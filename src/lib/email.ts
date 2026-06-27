import nodemailer from "nodemailer";
import { Resend } from "resend";
import type { Order } from "./db";
import { getNotificationEmails } from "./admin-db";
import { formatPrice, STATUS_LABELS, TICKET_TYPE_LABELS } from "./constants";

function buildEmailContent(order: Order) {
  const adminUrl = `${process.env.APP_URL || "http://localhost:3000"}/admin`;

  const text = [
    "Nouvelle demande de réservation Festichill",
    "",
    `Référence : ${order.reference}`,
    `Nom : ${order.full_name}`,
    `Téléphone : ${order.phone}`,
    `Email : ${order.email}`,
    `Quartier : ${order.delivery_zone}`,
    `Type : ${TICKET_TYPE_LABELS[order.ticket_type]}`,
    `Tickets : ${order.ticket_count}`,
    `Total : ${formatPrice(order.total_amount)}`,
    `Statut : ${STATUS_LABELS[order.status]}`,
    order.customer_note ? `Remarque client : ${order.customer_note}` : "",
    "",
    `Voir l'admin : ${adminUrl}`,
  ]
    .filter(Boolean)
    .join("\n");

  const html = `
    <h2>Nouvelle réservation Festichill</h2>
    <p><strong>Référence :</strong> ${order.reference}</p>
    <p><strong>Nom :</strong> ${order.full_name}</p>
    <p><strong>Téléphone :</strong> ${order.phone}</p>
    <p><strong>Email :</strong> ${order.email}</p>
    <p><strong>Quartier :</strong> ${order.delivery_zone}</p>
    <p><strong>Type :</strong> ${TICKET_TYPE_LABELS[order.ticket_type]}</p>
    <p><strong>Tickets :</strong> ${order.ticket_count}</p>
    <p><strong>Total :</strong> ${formatPrice(order.total_amount)}</p>
    ${order.customer_note ? `<p><strong>Remarque :</strong> ${order.customer_note}</p>` : ""}
    <p><a href="${adminUrl}">Ouvrir l'admin</a></p>
  `;

  return {
    subject: `[Festichill] Nouvelle réservation — ${order.reference}`,
    text,
    html,
  };
}

/** Sans domaine vérifié, Resend n'autorise qu'un seul destinataire (compte test). */
function isResendTestMode(): boolean {
  const from = (
    process.env.RESEND_FROM ||
    "Festichill <onboarding@resend.dev>"
  ).toLowerCase();
  return from.includes("onboarding@resend.dev");
}

function getResendOwnerEmail(): string | null {
  const email =
    process.env.RESEND_TO_EMAIL?.trim() ||
    process.env.NOTIFICATION_EMAIL?.trim();
  return email ? email.toLowerCase() : null;
}

async function resolveSmtpRecipients(): Promise<string[]> {
  const emails = new Set<string>();
  const fromEnv = process.env.NOTIFICATION_EMAIL?.trim();
  if (fromEnv) emails.add(fromEnv.toLowerCase());

  try {
    for (const email of await getNotificationEmails()) {
      emails.add(email.toLowerCase());
    }
  } catch (error) {
    console.error("[email] Impossible de lire les destinataires en base:", error);
  }

  return [...emails];
}

async function resolveResendRecipients(): Promise<string[]> {
  const owner = getResendOwnerEmail();
  if (!owner) {
    console.error("[email] RESEND_TO_EMAIL ou NOTIFICATION_EMAIL requis.");
    return [];
  }

  if (isResendTestMode()) {
    console.log(
      `[email] Mode test Resend — envoi uniquement à ${owner} (équipe : voir /admin)`
    );
    return [owner];
  }

  return resolveSmtpRecipients();
}

async function sendViaResend(
  order: Order,
  recipients: string[]
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;

  const from =
    process.env.RESEND_FROM ||
    process.env.SMTP_FROM ||
    "Festichill <onboarding@resend.dev>";

  const resend = new Resend(apiKey);
  const content = buildEmailContent(order);

  const { data, error } = await resend.emails.send({
    from,
    to: recipients,
    subject: content.subject,
    text: content.text,
    html: content.html,
  });

  if (error) {
    throw new Error(error.message);
  }

  console.log(
    `[email] Resend OK pour ${order.reference} → ${recipients.join(", ")} (${data?.id})`
  );
  return true;
}

function getSmtpTransporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) return null;

  const port = Number(process.env.SMTP_PORT || 587);
  const secure = process.env.SMTP_SECURE === "true";

  return nodemailer.createTransport({
    host,
    port,
    secure,
    requireTLS: !secure && port === 587,
    auth: { user, pass },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
  });
}

async function sendViaSmtp(order: Order, recipients: string[]): Promise<void> {
  const transporter = getSmtpTransporter();
  if (!transporter) {
    throw new Error("SMTP non configuré.");
  }

  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  const content = buildEmailContent(order);

  const info = await transporter.sendMail({
    from,
    to: recipients.join(", "),
    subject: content.subject,
    text: content.text,
    html: content.html,
  });

  console.log(
    `[email] SMTP OK pour ${order.reference} → ${recipients.join(", ")} (${info.messageId})`
  );
}

export async function sendNewOrderNotification(order: Order): Promise<void> {
  if (process.env.RESEND_API_KEY) {
    const recipients = await resolveResendRecipients();
    if (recipients.length === 0) return;
    await sendViaResend(order, recipients);
    return;
  }

  const recipients = await resolveSmtpRecipients();
  if (recipients.length === 0) {
    console.error(
      "[email] Aucun destinataire — notification ignorée pour",
      order.reference
    );
    return;
  }

  await sendViaSmtp(order, recipients);
}

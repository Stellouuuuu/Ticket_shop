import nodemailer from "nodemailer";
import type { Order } from "./db";
import { getNotificationEmails } from "./admin-db";
import { formatPrice, STATUS_LABELS, TICKET_TYPE_LABELS } from "./constants";

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) return null;

  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user, pass },
  });
}

export async function sendNewOrderNotification(order: Order): Promise<void> {
  const transporter = getTransporter();
  let recipients: string[] = [];

  try {
    recipients = await getNotificationEmails();
  } catch (error) {
    console.error("[email] Impossible de lire les destinataires:", error);
  }

  if (recipients.length === 0 && process.env.NOTIFICATION_EMAIL) {
    recipients = [process.env.NOTIFICATION_EMAIL];
  }

  if (!transporter || recipients.length === 0) {
    console.log(
      "[email] SMTP ou destinataires non configurés — notification ignorée pour",
      order.reference
    );
    return;
  }

  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  await transporter.sendMail({
    from,
    to: recipients.join(", "),
    subject: `[Festichill] Nouvelle réservation — ${order.reference}`,
    text: [
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
      `Voir l'admin : ${process.env.APP_URL || "http://localhost:3000"}/admin`,
    ]
      .filter(Boolean)
      .join("\n"),
    html: `
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
      <p><a href="${process.env.APP_URL || "http://localhost:3000"}/admin">Ouvrir l'admin</a></p>
    `,
  });
}

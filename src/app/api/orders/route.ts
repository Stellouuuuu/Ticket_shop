import { NextResponse, after } from "next/server";
import {
  createOrder,
  generateReference,
  getOrderByReference,
} from "@/lib/db";
import { sendNewOrderNotification } from "@/lib/email";
import {
  calculateTotal,
  getTicketPrice,
  isValidTicketType,
} from "@/lib/constants";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const full_name = String(body.full_name || "").trim();
    const phone = String(body.phone || "").trim();
    const email = String(body.email || "").trim();
    const delivery_zone = String(body.delivery_zone || "").trim();
    const ticket_type = String(body.ticket_type || "standard");
    const ticket_count = Number(body.ticket_count);
    const customer_note = body.customer_note
      ? String(body.customer_note).trim()
      : undefined;

    if (!full_name || !phone || !email || !delivery_zone) {
      return NextResponse.json(
        { error: "Tous les champs obligatoires doivent être remplis." },
        { status: 400 }
      );
    }

    if (!isValidTicketType(ticket_type)) {
      return NextResponse.json(
        { error: "Type de ticket invalide." },
        { status: 400 }
      );
    }

    if (!Number.isInteger(ticket_count) || ticket_count < 1 || ticket_count > 50) {
      return NextResponse.json(
        { error: "Le nombre de tickets doit être entre 1 et 50." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Adresse email invalide." },
        { status: 400 }
      );
    }

    const reference = generateReference();
    const unit_price = getTicketPrice(ticket_type);
    const total_amount = calculateTotal(ticket_count, ticket_type);

    const order = await createOrder(
      {
        full_name,
        phone,
        email,
        delivery_zone,
        ticket_type,
        ticket_count,
        customer_note,
      },
      reference,
      unit_price,
      total_amount
    );

    // Email après la réponse (API Next.js — garanti sur Render)
    after(async () => {
      try {
        await sendNewOrderNotification(order);
      } catch (emailError) {
        console.error("[email] Échec envoi notification:", emailError);
      }
    });

    return NextResponse.json({ reference: order.reference }, { status: 201 });
  } catch (error) {
    console.error("[orders] POST error:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'enregistrement de la commande." },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const reference = searchParams.get("reference");

  if (!reference) {
    return NextResponse.json(
      { error: "Référence requise." },
      { status: 400 }
    );
  }

  try {
    const order = await getOrderByReference(reference);
    if (!order) {
      return NextResponse.json(
        { error: "Commande introuvable." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      reference: order.reference,
      full_name: order.full_name,
      ticket_type: order.ticket_type,
      ticket_count: order.ticket_count,
      unit_price: order.unit_price,
      total_amount: order.total_amount,
      status: order.status,
      created_at: order.created_at,
    });
  } catch (error) {
    console.error("[orders] GET error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de la commande." },
      { status: 500 }
    );
  }
}

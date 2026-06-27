import { NextResponse } from "next/server";
import { getAdminFromRequest } from "@/lib/auth";
import { updateOrder } from "@/lib/db";
import {
  ORDER_STATUSES,
  TEAM_MEMBERS,
  type OrderStatus,
  type TeamMember,
} from "@/lib/constants";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await getAdminFromRequest(request))) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const { id } = await params;
  const orderId = Number(id);

  if (!Number.isInteger(orderId) || orderId < 1) {
    return NextResponse.json({ error: "ID invalide." }, { status: 400 });
  }

  try {
    const body = await request.json();
    const updates: {
      status?: OrderStatus;
      assigned_to?: TeamMember | null;
      delivery_date?: string | null;
      internal_note?: string | null;
    } = {};

    if (body.status !== undefined) {
      if (!ORDER_STATUSES.includes(body.status)) {
        return NextResponse.json({ error: "Statut invalide." }, { status: 400 });
      }
      updates.status = body.status;
    }

    if (body.assigned_to !== undefined) {
      if (body.assigned_to !== null && !TEAM_MEMBERS.includes(body.assigned_to)) {
        return NextResponse.json(
          { error: "Responsable invalide." },
          { status: 400 }
        );
      }
      updates.assigned_to = body.assigned_to;
    }

    if (body.delivery_date !== undefined) {
      updates.delivery_date = body.delivery_date || null;
    }

    if (body.internal_note !== undefined) {
      updates.internal_note = body.internal_note || null;
    }

    const order = await updateOrder(orderId, updates);
    if (!order) {
      return NextResponse.json(
        { error: "Commande introuvable." },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("[admin/orders] PATCH error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour." },
      { status: 500 }
    );
  }
}

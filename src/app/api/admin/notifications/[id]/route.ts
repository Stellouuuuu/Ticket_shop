import { NextResponse } from "next/server";
import { deleteNotificationRecipient } from "@/lib/admin-db";
import { getAdminFromRequest } from "@/lib/auth";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const { id } = await params;
  const recipientId = Number(id);

  if (!Number.isInteger(recipientId) || recipientId < 1) {
    return NextResponse.json({ error: "ID invalide." }, { status: 400 });
  }

  try {
    await deleteNotificationRecipient(recipientId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[admin/notifications] DELETE error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression." },
      { status: 500 }
    );
  }
}

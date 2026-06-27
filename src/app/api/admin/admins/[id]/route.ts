import { NextResponse } from "next/server";
import { deleteAdmin } from "@/lib/admin-db";
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
  const adminId = Number(id);

  if (!Number.isInteger(adminId) || adminId < 1) {
    return NextResponse.json({ error: "ID invalide." }, { status: 400 });
  }

  if (adminId === admin.adminId) {
    return NextResponse.json(
      { error: "Vous ne pouvez pas supprimer votre propre compte." },
      { status: 400 }
    );
  }

  try {
    const result = await deleteAdmin(adminId);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[admin/admins] DELETE error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression." },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { changeAdminPassword } from "@/lib/admin-db";
import { getAdminFromRequest } from "@/lib/auth";

export async function POST(request: Request) {
  const admin = await getAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const currentPassword = String(body.currentPassword || "");
    const newPassword = String(body.newPassword || "");
    const confirmPassword = String(body.confirmPassword || "");

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Tous les champs sont requis." },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: "Les nouveaux mots de passe ne correspondent pas." },
        { status: 400 }
      );
    }

    const result = await changeAdminPassword(
      admin.adminId,
      currentPassword,
      newPassword
    );

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[admin/change-password] error:", error);
    return NextResponse.json(
      { error: "Erreur lors du changement de mot de passe." },
      { status: 500 }
    );
  }
}

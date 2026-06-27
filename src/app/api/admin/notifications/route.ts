import { NextResponse } from "next/server";
import {
  addNotificationRecipient,
  listNotificationRecipients,
} from "@/lib/admin-db";
import { getAdminFromRequest } from "@/lib/auth";

export async function GET(request: Request) {
  const admin = await getAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  try {
    const recipients = await listNotificationRecipients();
    return NextResponse.json(recipients);
  } catch (error) {
    console.error("[admin/notifications] GET error:", error);
    return NextResponse.json(
      { error: "Erreur lors du chargement des emails." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const admin = await getAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const email = String(body.email || "");
    const label = body.label ? String(body.label) : undefined;

    const result = await addNotificationRecipient(email, label);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("[admin/notifications] POST error:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'ajout de l'email." },
      { status: 500 }
    );
  }
}

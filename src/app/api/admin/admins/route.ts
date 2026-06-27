import { NextResponse } from "next/server";
import { createAdmin, listAdmins } from "@/lib/admin-db";
import { getAdminFromRequest } from "@/lib/auth";

export async function GET(request: Request) {
  const admin = await getAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  try {
    const admins = await listAdmins();
    return NextResponse.json(admins);
  } catch (error) {
    console.error("[admin/admins] GET error:", error);
    return NextResponse.json(
      { error: "Erreur lors du chargement des administrateurs." },
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
    const username = String(body.username || "");
    const password = String(body.password || "");

    const result = await createAdmin(username, password);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("[admin/admins] POST error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de l'administrateur." },
      { status: 500 }
    );
  }
}

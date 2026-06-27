import { NextResponse } from "next/server";
import { deleteSession } from "@/lib/admin-db";
import { getAdminFromRequest } from "@/lib/auth";

export async function POST(request: Request) {
  const admin = await getAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  await deleteSession(admin.token);
  return NextResponse.json({ ok: true });
}

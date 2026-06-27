import { NextResponse } from "next/server";
import { getAdminFromRequest } from "@/lib/auth";

export async function GET(request: Request) {
  const admin = await getAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  return NextResponse.json({
    id: admin.adminId,
    username: admin.username,
  });
}

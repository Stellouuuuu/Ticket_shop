import { NextResponse } from "next/server";
import { getAdminFromRequest } from "@/lib/auth";
import { getAllOrders } from "@/lib/db";

export async function GET(request: Request) {
  if (!(await getAdminFromRequest(request))) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  try {
    const orders = await getAllOrders();
    return NextResponse.json(orders);
  } catch (error) {
    console.error("[admin/orders] GET error:", error);
    return NextResponse.json(
      { error: "Erreur lors du chargement des commandes." },
      { status: 500 }
    );
  }
}

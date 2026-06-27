import { NextResponse } from "next/server";
import { authenticateAdmin, createSession } from "@/lib/admin-db";
import { isRetryableDbError } from "@/lib/db-config";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const username = String(body.username || "").trim();
    const password = String(body.password || "");

    if (!username || !password) {
      return NextResponse.json(
        { error: "Identifiant et mot de passe requis." },
        { status: 400 }
      );
    }

    const admin = await authenticateAdmin(username, password);
    if (!admin) {
      return NextResponse.json(
        { error: "Identifiant ou mot de passe incorrect." },
        { status: 401 }
      );
    }

    const token = await createSession(admin.id);

    return NextResponse.json({
      token,
      admin: { id: admin.id, username: admin.username },
    });
  } catch (error) {
    console.error("[admin/login] error:", error);

    if (isRetryableDbError(error)) {
      return NextResponse.json(
        {
          error:
            "Connexion MySQL impossible (timeout). Réessayez dans quelques secondes, ou lancez le tunnel SSH : npm run tunnel",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Erreur de connexion à la base de données." },
      { status: 500 }
    );
  }
}

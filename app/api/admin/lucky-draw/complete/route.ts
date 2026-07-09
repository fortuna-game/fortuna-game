import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

async function requireAdmin(req: Request) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");

  if (!token) return false;

  const {
    data: { user },
  } = await supabaseAdmin.auth.getUser(token);

  if (!user) return false;

  const { data: role } = await supabaseAdmin
    .from("admin_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  return Boolean(
    role && ["super_admin", "admin"].includes(role.role)
  );
}

export async function POST(req: Request) {
  try {
    const isAdmin = await requireAdmin(req);

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Admin access denied." },
        { status: 403 }
      );
    }

    const { drawId } = await req.json();

    if (!drawId) {
      return NextResponse.json(
        { error: "Draw ID is required." },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin.rpc(
      "complete_lucky_draw_atomic",
      {
        p_draw_id: drawId,
      }
    );

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      result: data,
      message: "Winner selected and prize paid successfully.",
    });
  } catch (error) {
    console.error("COMPLETE LUCKY DRAW ERROR:", error);

    return NextResponse.json(
      { error: "Could not complete Lucky Draw." },
      { status: 500 }
    );
  }
}

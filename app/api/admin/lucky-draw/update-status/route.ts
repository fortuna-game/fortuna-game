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
    const ok = await requireAdmin(req);

    if (!ok) {
      return NextResponse.json(
        { error: "Admin access denied." },
        { status: 403 }
      );
    }

    const { drawId, status } = await req.json();

    if (!drawId) {
      return NextResponse.json(
        { error: "Lucky Draw ID is required." },
        { status: 400 }
      );
    }

    const allowedStatuses = ["open", "paused", "suspended"];

    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid Lucky Draw status." },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("lucky_draws")
      .update({ status })
      .eq("id", drawId)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      draw: data,
    });
  } catch (error) {
    console.error("UPDATE LUCKY DRAW STATUS ERROR:", error);

    return NextResponse.json(
      { error: "Could not update Lucky Draw status." },
      { status: 500 }
    );
  }
}

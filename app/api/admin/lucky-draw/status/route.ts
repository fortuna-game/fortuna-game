import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

async function requireAdmin(req: Request) {
  const token = req.headers
    .get("authorization")
    ?.replace("Bearer ", "");

  if (!token) return false;

  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) return false;

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
        { error: "Lucky Draw not found." },
        { status: 400 }
      );
    }

    const allowedStatuses = [
      "open",
      "paused",
      "suspended",
      "cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid Lucky Draw status." },
        { status: 400 }
      );
    }

    if (status === "open") {
      const { data: existingOpenDraw, error: checkError } =
        await supabaseAdmin
          .from("lucky_draws")
          .select("id")
          .eq("status", "open")
          .neq("id", drawId)
          .maybeSingle();

      if (checkError) {
        return NextResponse.json(
          { error: checkError.message },
          { status: 500 }
        );
      }

      if (existingOpenDraw) {
        return NextResponse.json(
          {
            error:
              "Another Lucky Draw is already open. Pause, suspend or complete it first.",
          },
          { status: 400 }
        );
      }
    }

    const { data: draw, error } = await supabaseAdmin
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
      draw,
      message: `Lucky Draw status changed to ${status}.`,
    });
  } catch (error) {
    console.error("UPDATE LUCKY DRAW STATUS ERROR:", error);

    return NextResponse.json(
      { error: "Could not update Lucky Draw status." },
      { status: 500 }
    );
  }
}

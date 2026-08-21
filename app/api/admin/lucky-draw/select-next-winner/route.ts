import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    const token = authorization.replace("Bearer ", "");

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: "Supabase configuration is missing." },
        { status: 500 }
      );
    }

    const supabase = createClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Invalid or expired session." },
        { status: 401 }
      );
    }

    const { data: adminProfile, error: adminError } =
      await supabase
        .from("profiles")
        .select("id, role")
        .eq("id", user.id)
        .single();

    if (
      adminError ||
      !adminProfile ||
      adminProfile.role !== "admin"
    ) {
      return NextResponse.json(
        { error: "Admin access required." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const drawId = body?.drawId;

    if (!drawId || typeof drawId !== "string") {
      return NextResponse.json(
        { error: "A valid drawId is required." },
        { status: 400 }
      );
    }

    const { data: draw, error: drawError } =
      await supabaseAdmin
        .from("lucky_draws")
        .select("id, status, ends_at, winner_count")
        .eq("id", drawId)
        .maybeSingle();

    if (drawError) {
      return NextResponse.json(
        { error: drawError.message },
        { status: 500 }
      );
    }

    if (!draw) {
      return NextResponse.json(
        { error: "Lucky Draw not found." },
        { status: 404 }
      );
    }

    if (draw.status === "cancelled") {
      return NextResponse.json(
        {
          error:
            "This Lucky Draw was cancelled. Winner selection is not allowed.",
        },
        { status: 400 }
      );
    }

    if (
      draw.ends_at &&
      new Date(draw.ends_at).getTime() > Date.now()
    ) {
      return NextResponse.json(
        {
          error:
            "Winner selection cannot begin until the Lucky Draw has ended.",
        },
        { status: 400 }
      );
    }

    const { count: ticketCount, error: ticketCountError } =
      await supabaseAdmin
        .from("lucky_draw_tickets")
        .select("id", {
          count: "exact",
          head: true,
        })
        .eq("draw_id", drawId);

    if (ticketCountError) {
      return NextResponse.json(
        { error: ticketCountError.message },
        { status: 500 }
      );
    }

    if (!ticketCount || ticketCount < 1) {
      return NextResponse.json(
        {
          error:
            "Winner selection cannot begin because no eligible participants entered this Lucky Draw.",
        },
        { status: 400 }
      );
    }

    if (
      draw.status !== "ended" &&
      draw.status !== "selecting"
    ) {
      return NextResponse.json(
        {
          error:
            "This Lucky Draw is not ready for winner selection.",
        },
        { status: 400 }
      );
    }

    if (
      draw.status === "ended"
    ) {
      // Ended draws are eligible for winner selection.
      // The RPC will move the draw into selecting state.
    }

    const { data, error } = await supabaseAdmin.rpc(
      "select_next_lucky_draw_winner",
      {
        p_draw_id: drawId,
      }
    );

    if (error) {
      console.error(
        "Select next Lucky Draw winner error:",
        error
      );

      return NextResponse.json(
        { error: error.message || "Unable to select winner." },
        { status: 400 }
      );
    }

    const result = Array.isArray(data) ? data[0] : data;

    if (!result) {
      return NextResponse.json(
        { error: "Winner selection returned no result." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      winner: result,
    });
  } catch (error) {
    console.error(
      "Unexpected select-next-winner error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unexpected server error.",
      },
      { status: 500 }
    );
  }
}

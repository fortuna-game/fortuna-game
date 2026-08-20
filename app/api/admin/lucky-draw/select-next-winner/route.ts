import { NextRequest, NextResponse } from "next/server";
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

    const { data, error } = await supabase.rpc(
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

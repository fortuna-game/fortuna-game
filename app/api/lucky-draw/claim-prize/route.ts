import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const token = req.headers
      .get("authorization")
      ?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { error: "Please log in to claim your prize." },
        { status: 401 }
      );
    }

    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json(
        { error: "Invalid user session." },
        { status: 401 }
      );
    }

    const {
      drawId,
      fullName,
      location,
      city,
      region,
      phoneNumber,
      alternatePhoneNumber,
      email,
    } = await req.json();

    if (
      !drawId ||
      !fullName?.trim() ||
      !location?.trim() ||
      !city?.trim() ||
      !region?.trim() ||
      !phoneNumber?.trim() ||
      !email?.trim()
    ) {
      return NextResponse.json(
        { error: "Please complete all required delivery details." },
        { status: 400 }
      );
    }

    // Confirm the draw exists and this logged-in user is the winner.
    const { data: draw, error: drawError } = await supabaseAdmin
      .from("lucky_draws")
      .select("id, status, winner_user_id, prize_type")
      .eq("id", drawId)
      .maybeSingle();

    if (drawError || !draw) {
      return NextResponse.json(
        { error: "Lucky Draw not found." },
        { status: 404 }
      );
    }

    if (draw.status !== "completed") {
      return NextResponse.json(
        { error: "This Lucky Draw has not been completed yet." },
        { status: 400 }
      );
    }

    if (draw.winner_user_id !== user.id) {
      return NextResponse.json(
        { error: "Only the verified winner can submit delivery details." },
        { status: 403 }
      );
    }

    // Cash prizes do not require delivery details.
    if (draw.prize_type === "cash") {
      return NextResponse.json(
        { error: "Cash prizes do not require delivery details." },
        { status: 400 }
      );
    }

    // Only allow one delivery claim per draw.
    const { data: existingClaim, error: existingError } =
      await supabaseAdmin
        .from("lucky_draw_prize_claims")
        .select("id")
        .eq("draw_id", drawId)
        .maybeSingle();

    if (existingError) {
      return NextResponse.json(
        { error: existingError.message },
        { status: 500 }
      );
    }

    if (existingClaim) {
      return NextResponse.json(
        {
          error:
            "Delivery details have already been submitted for this prize.",
        },
        { status: 400 }
      );
    }

    const { data: claim, error: claimError } = await supabaseAdmin
      .from("lucky_draw_prize_claims")
      .insert({
        draw_id: drawId,
        winner_user_id: user.id,
        full_name: fullName.trim(),
        location: location.trim(),
        city: city.trim(),
        region: region.trim(),
        phone_number: phoneNumber.trim(),
        alternate_phone_number:
          alternatePhoneNumber?.trim() || null,
        email: email.trim().toLowerCase(),
        status: "pending",
      })
      .select("*")
      .single();

    if (claimError) {
      return NextResponse.json(
        { error: claimError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      claim,
      message:
        "Your delivery details have been submitted successfully. Our team will contact you about your prize.",
    });
  } catch (error) {
    console.error("LUCKY DRAW PRIZE CLAIM ERROR:", error);

    return NextResponse.json(
      { error: "Could not submit delivery details." },
      { status: 500 }
    );
  }
}

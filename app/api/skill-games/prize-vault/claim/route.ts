import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const allowedNetworks = ["MTN", "Telecel", "AirtelTigo"];

export async function POST(req: Request) {
  try {
    const token = req.headers
      .get("authorization")
      ?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { error: "Please log in." },
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

    const body = await req.json();

    const playId = String(body.playId || "").trim();
    const fullName = String(body.fullName || "").trim();
    const phone = String(body.phone || "").trim();
    const network = String(body.network || "").trim();
    const region = String(body.region || "").trim();
    const city = String(body.city || "").trim();
    const address = String(body.address || "").trim();
    const note = String(body.note || "").trim();

    if (!playId) {
      return NextResponse.json(
        { error: "Prize claim reference is missing." },
        { status: 400 }
      );
    }

    const { data: play, error: playError } = await supabaseAdmin
      .from("prize_vault_plays")
      .select("*")
      .eq("id", playId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (playError) {
      return NextResponse.json(
        { error: playError.message },
        { status: 500 }
      );
    }

    if (!play) {
      return NextResponse.json(
        { error: "Prize claim not found." },
        { status: 404 }
      );
    }

    if (!["won", "claimed"].includes(String(play.result))) {
      return NextResponse.json(
        { error: "This result cannot be claimed." },
        { status: 400 }
      );
    }

    if (
      ["submitted", "processing", "fulfilled"].includes(
        String(play.claim_status)
      )
    ) {
      return NextResponse.json(
        { error: "This prize claim has already been submitted." },
        { status: 400 }
      );
    }

    const fulfillmentType = String(play.fulfillment_type || "");

    if (fulfillmentType === "wallet") {
      return NextResponse.json(
        { error: "Cash prizes are credited automatically." },
        { status: 400 }
      );
    }

    if (fulfillmentType === "airtime" || fulfillmentType === "data") {
      if (!phone) {
        return NextResponse.json(
          { error: "Phone number is required." },
          { status: 400 }
        );
      }

      if (!allowedNetworks.includes(network)) {
        return NextResponse.json(
          { error: "Please select a valid network." },
          { status: 400 }
        );
      }
    }

    if (
      fulfillmentType === "food_delivery" ||
      fulfillmentType === "delivery"
    ) {
      if (!fullName || !phone || !region || !city || !address) {
        return NextResponse.json(
          {
            error:
              "Full name, phone number, region, city and delivery address are required.",
          },
          { status: 400 }
        );
      }
    }

    if (fulfillmentType === "voucher") {
      if (!fullName || !phone) {
        return NextResponse.json(
          {
            error:
              "Full name and phone number are required for voucher delivery.",
          },
          { status: 400 }
        );
      }
    }

    const { error: updateError } = await supabaseAdmin
      .from("prize_vault_plays")
      .update({
        result: "claimed",
        claim_status: "submitted",
        claim_full_name: fullName || null,
        claim_phone: phone || null,
        claim_network: network || null,
        claim_region: region || null,
        claim_city: city || null,
        claim_address: address || null,
        claim_note: note || null,
        claimed_at: new Date().toISOString(),
      })
      .eq("id", play.id)
      .eq("user_id", user.id);

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        "Your prize claim has been submitted successfully. Fortuna Admin will process it.",
    });
  } catch (error) {
    console.error("PRIZE VAULT CLAIM ERROR:", error);

    return NextResponse.json(
      { error: "Could not submit prize claim." },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

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
    const referralCode = String(body.referralCode || "")
      .trim()
      .toUpperCase();

    if (!referralCode) {
      return NextResponse.json(
        { error: "Referral code is required." },
        { status: 400 }
      );
    }

    const { data: affiliate, error: affiliateError } =
      await supabaseAdmin
        .from("affiliate_profiles")
        .select("id, user_id, referral_code, status")
        .eq("referral_code", referralCode)
        .maybeSingle();

    if (affiliateError) {
      return NextResponse.json(
        { error: affiliateError.message },
        { status: 500 }
      );
    }

    if (!affiliate || affiliate.status !== "active") {
      return NextResponse.json(
        { error: "Invalid or inactive referral code." },
        { status: 400 }
      );
    }

    if (affiliate.user_id === user.id) {
      return NextResponse.json(
        { error: "You cannot refer your own account." },
        { status: 400 }
      );
    }

    const { data: existingReferral } = await supabaseAdmin
      .from("affiliate_referrals")
      .select("id")
      .eq("referred_user_id", user.id)
      .maybeSingle();

    if (existingReferral) {
      return NextResponse.json({
        success: true,
        message: "Referral already recorded.",
      });
    }

    const { error: insertError } = await supabaseAdmin
      .from("affiliate_referrals")
      .insert({
        affiliate_id: affiliate.id,
        referred_user_id: user.id,
        referral_code: affiliate.referral_code,
      });

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Referral recorded successfully.",
    });
  } catch (error) {
    console.error("REGISTER REFERRAL ERROR:", error);

    return NextResponse.json(
      { error: "Could not record referral." },
      { status: 500 }
    );
  }
}

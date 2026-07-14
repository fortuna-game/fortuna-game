import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

async function getUser(req: Request) {
  const token = req.headers
    .get("authorization")
    ?.replace("Bearer ", "");

  if (!token) return null;

  const {
    data: { user },
  } = await supabaseAdmin.auth.getUser(token);

  return user;
}

function createReferralCode(username: string) {
  const clean = username
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase()
    .slice(0, 8);

  const random = Math.floor(1000 + Math.random() * 9000);

  return `${clean || "FORTUNA"}${random}`;
}

export async function GET(req: Request) {
  try {
    const user = await getUser(req);

    if (!user) {
      return NextResponse.json(
        { error: "Please log in." },
        { status: 401 }
      );
    }

    const { data: affiliate } = await supabaseAdmin
      .from("affiliate_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!affiliate) {
      return NextResponse.json({
        success: true,
        affiliate: null,
        referrals: [],
        earnings: [],
      });
    }

    const { data: referrals } = await supabaseAdmin
      .from("affiliate_referrals")
      .select("*")
      .eq("affiliate_id", affiliate.id)
      .order("created_at", { ascending: false });

    const { data: earnings } = await supabaseAdmin
      .from("affiliate_earnings")
      .select("*")
      .eq("affiliate_id", affiliate.id)
      .order("earned_at", { ascending: false });

    return NextResponse.json({
      success: true,
      affiliate,
      referrals: referrals || [],
      earnings: earnings || [],
    });
  } catch (error) {
    console.error("AFFILIATE GET ERROR:", error);

    return NextResponse.json(
      { error: "Could not load affiliate account." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await getUser(req);

    if (!user) {
      return NextResponse.json(
        { error: "Please log in." },
        { status: 401 }
      );
    }

    const body = await req.json();

    const fullName = String(body.fullName || "").trim();
    const phone = String(body.phone || "").trim();
    const paymentMethod = String(
      body.paymentMethod || "momo"
    ).trim();

    const momoNumber = String(body.momoNumber || "").trim();
    const momoNetwork = String(body.momoNetwork || "").trim();

    if (!fullName || !phone) {
      return NextResponse.json(
        { error: "Full name and phone number are required." },
        { status: 400 }
      );
    }

    const { data: existing } = await supabaseAdmin
      .from("affiliate_profiles")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "You already have an affiliate account." },
        { status: 400 }
      );
    }

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("username")
      .eq("user_id", user.id)
      .maybeSingle();

    let referralCode = createReferralCode(
      profile?.username || "FORTUNA"
    );

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const { data: codeExists } = await supabaseAdmin
        .from("affiliate_profiles")
        .select("id")
        .eq("referral_code", referralCode)
        .maybeSingle();

      if (!codeExists) break;

      referralCode = createReferralCode(
        profile?.username || "FORTUNA"
      );
    }

    const { data: affiliate, error } = await supabaseAdmin
      .from("affiliate_profiles")
      .insert({
        user_id: user.id,
        full_name: fullName,
        phone,
        email: user.email || null,
        referral_code: referralCode,
        payment_method: paymentMethod,
        momo_number: momoNumber || phone,
        momo_network: momoNetwork || null,
        status: "active",
      })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      affiliate,
      message: "Affiliate account created successfully.",
    });
  } catch (error) {
    console.error("AFFILIATE CREATE ERROR:", error);

    return NextResponse.json(
      { error: "Could not create affiliate account." },
      { status: 500 }
    );
  }
}

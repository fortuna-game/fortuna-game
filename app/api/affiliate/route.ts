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

    const { data: payouts, error: payoutsError } = await supabaseAdmin
      .from("affiliate_payouts")
      .select("*")
      .eq("affiliate_id", affiliate.id)
      .order("requested_at", { ascending: false });

    if (payoutsError) {
      return NextResponse.json(
        { error: payoutsError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      affiliate,
      referrals: referrals || [],
      earnings: earnings || [],
      payouts: payouts || [],
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
    const bankName = String(body.bankName || "").trim();
    const bankAccountName = String(body.bankAccountName || "").trim();
    const bankAccountNumber = String(body.bankAccountNumber || "").trim();

    if (!fullName || !phone) {
      return NextResponse.json(
        { error: "Full name and phone number are required." },
        { status: 400 }
      );
    }

    if (!["momo", "bank"].includes(paymentMethod)) {
      return NextResponse.json(
        { error: "Select Mobile Money or Bank Account." },
        { status: 400 }
      );
    }

    if (paymentMethod === "momo") {
      if (!["MTN", "Telecel", "AT"].includes(momoNetwork)) {
        return NextResponse.json(
          { error: "Select MTN, Telecel or AirtelTigo." },
          { status: 400 }
        );
      }

      if (!momoNumber) {
        return NextResponse.json(
          { error: "Mobile Money number is required." },
          { status: 400 }
        );
      }
    }

    if (
      paymentMethod === "bank" &&
      (!bankName || !bankAccountName || !bankAccountNumber)
    ) {
      return NextResponse.json(
        { error: "Complete all bank account details." },
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

        momo_number:
          paymentMethod === "momo" ? momoNumber : null,

        momo_network:
          paymentMethod === "momo" ? momoNetwork : null,

        bank_name:
          paymentMethod === "bank" ? bankName : null,

        bank_account_name:
          paymentMethod === "bank" ? bankAccountName : null,

        bank_account_number:
          paymentMethod === "bank" ? bankAccountNumber : null,

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


export async function PUT(req: Request) {
  try {
    const user = await getUser(req);

    if (!user) {
      return NextResponse.json(
        { error: "Please log in." },
        { status: 401 }
      );
    }

    const body = await req.json();

    const paymentMethod = String(body.paymentMethod || "").trim();
    const momoNetwork = String(body.momoNetwork || "").trim();
    const momoNumber = String(body.momoNumber || "").trim();
    const bankName = String(body.bankName || "").trim();
    const bankAccountName = String(body.bankAccountName || "").trim();
    const bankAccountNumber = String(body.bankAccountNumber || "").trim();

    if (!["momo", "bank"].includes(paymentMethod)) {
      return NextResponse.json(
        { error: "Select Mobile Money or Bank Account." },
        { status: 400 }
      );
    }

    if (paymentMethod === "momo") {
      if (!["MTN", "Telecel", "AT"].includes(momoNetwork)) {
        return NextResponse.json(
          { error: "Select MTN, Telecel or AirtelTigo." },
          { status: 400 }
        );
      }

      if (!momoNumber) {
        return NextResponse.json(
          { error: "Mobile Money number is required." },
          { status: 400 }
        );
      }
    }

    if (paymentMethod === "bank") {
      if (!bankName || !bankAccountName || !bankAccountNumber) {
        return NextResponse.json(
          { error: "Complete all bank account details." },
          { status: 400 }
        );
      }
    }

    const updates =
      paymentMethod === "momo"
        ? {
            payment_method: "momo",
            momo_network: momoNetwork,
            momo_number: momoNumber,
            bank_name: null,
            bank_account_name: null,
            bank_account_number: null,
            updated_at: new Date().toISOString(),
          }
        : {
            payment_method: "bank",
            momo_network: null,
            momo_number: null,
            bank_name: bankName,
            bank_account_name: bankAccountName,
            bank_account_number: bankAccountNumber,
            updated_at: new Date().toISOString(),
          };

    const { data: affiliate, error } = await supabaseAdmin
      .from("affiliate_profiles")
      .update(updates)
      .eq("user_id", user.id)
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
      affiliate,
      message: "Payment details saved successfully.",
    });
  } catch (error) {
    console.error("AFFILIATE PAYMENT SETTINGS ERROR:", error);

    return NextResponse.json(
      { error: "Could not save payment details." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getUser(req);

    if (!user) {
      return NextResponse.json(
        { error: "Please log in." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const amount = Number(body.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Enter a valid withdrawal amount." },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin.rpc(
      "request_affiliate_payout_atomic",
      {
        p_user_id: user.id,
        p_amount: amount,
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
      payout: data,
      message: `GH₵${amount.toFixed(2)} withdrawal requested successfully.`,
    });
  } catch (error) {
    console.error("AFFILIATE WITHDRAWAL ERROR:", error);

    return NextResponse.json(
      { error: "Could not request withdrawal." },
      { status: 500 }
    );
  }
}

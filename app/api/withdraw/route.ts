import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Please log in before withdrawing." }, { status: 401 });
    }

    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json({ error: "Invalid user session." }, { status: 401 });
    }

    const { amount, momoNumber, network } = await req.json();

    if (!amount || !momoNumber || !network) {
      return NextResponse.json({ error: "Missing withdrawal details" }, { status: 400 });
    }

    const value = Number(amount);

    if (!Number.isFinite(value) || value < 1) {
      return NextResponse.json({ error: "Invalid withdrawal amount." }, { status: 400 });
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("username")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    const safeUsername = String(profile?.username || "PLAYER")
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "");

    const d = new Date();
    const month = d.toLocaleString("en-US", { month: "short" });
    const day = d.getDate();
    const year = String(d.getFullYear()).slice(-2);
    const reference = `FG-WITHDRAW-${safeUsername}-${month} ${day}-${year}`;

    const { data: withdrawResult, error: withdrawError } = await supabaseAdmin.rpc(
      "request_withdrawal_atomic",
      {
        p_user_id: user.id,
        p_amount: value,
        p_momo_number: momoNumber,
        p_network: network,
        p_reference: reference,
      }
    );

    if (withdrawError) {
      return NextResponse.json({ error: withdrawError.message }, { status: 500 });
    }

    const row = Array.isArray(withdrawResult) ? withdrawResult[0] : null;

    if (!row?.success) {
      return NextResponse.json({ error: row?.message || "Withdrawal failed." }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `✅ Withdrawal is being processed.

Amount: GH₵${value.toFixed(2)}

Destination: ${network} • ${momoNumber}

Reference: ${reference}

Estimated processing time: 5–30 minutes.`,
    });
  } catch (error) {
    console.error("WITHDRAW ERROR:", error);
    return NextResponse.json({ error: "Withdrawal failed. Check server logs." }, { status: 500 });
  }
}

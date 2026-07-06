import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const { userId, amount, momoNumber, network } = await req.json();

    if (!userId || !amount || !momoNumber || !network) {
      return NextResponse.json({ error: "Missing withdrawal details" }, { status: 400 });
    }

    const value = Number(amount);

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("is_verified, username")
      .eq("user_id", userId)
      .maybeSingle();

    if (profileError) return NextResponse.json({ error: profileError.message }, { status: 500 });

    if (!profile?.is_verified) {
      return NextResponse.json({ error: "Please verify your account before withdrawing." }, { status: 403 });
    }

    const { data: wallet, error: walletError } = await supabaseAdmin
      .from("wallets")
      .select("balance")
      .eq("user_id", userId)
      .maybeSingle();

    if (walletError) return NextResponse.json({ error: walletError.message }, { status: 500 });

    const balance = Number(wallet?.balance || 0);
    if (balance < value) {
      return NextResponse.json({ error: "Insufficient wallet balance." }, { status: 400 });
    }

    const safeUsername = String(profile?.username || "PLAYER").toUpperCase().replace(/[^A-Z0-9]/g, "");
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const reference = `FP-${safeUsername}-${today}-${Math.floor(1000 + Math.random() * 9000)}`;

    const { error: withdrawalError } = await supabaseAdmin.from("withdrawals").insert({
      user_id: userId,
      amount: value,
      momo_number: momoNumber,
      network,
      status: "processing",
      reference,
    });

    if (withdrawalError) {
      return NextResponse.json({ error: withdrawalError.message }, { status: 500 });
    }

    const { error: updateWalletError } = await supabaseAdmin
      .from("wallets")
      .update({ balance: balance - value })
      .eq("user_id", userId);

    if (updateWalletError) {
      return NextResponse.json({ error: updateWalletError.message }, { status: 500 });
    }

    await supabaseAdmin.from("wallet_transactions").insert({
      user_id: userId,
      type: "withdrawal",
      amount: -value,
      status: "processing",
      reference,
      description: "Withdrawal request",
    });

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

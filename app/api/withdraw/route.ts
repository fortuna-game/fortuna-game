import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const { userId, amount, momoNumber, network } = await req.json();

    if (!userId || !amount || !momoNumber || !network) {
      return NextResponse.json({ error: "Missing withdrawal details" }, { status: 400 });
    }

    const value = Number(amount);

    if (value <= 0) {
      return NextResponse.json({ error: "Enter a valid amount." }, { status: 400 });
    }

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("is_verified")
      .eq("user_id", userId)
      .maybeSingle();

    if (!profile?.is_verified) {
      return NextResponse.json(
        { error: "Please verify your account before withdrawing." },
        { status: 403 }
      );
    }

    const { data: wallet } = await supabaseAdmin
      .from("wallets")
      .select("balance")
      .eq("user_id", userId)
      .maybeSingle();

    const balance = Number(wallet?.balance || 0);

    if (balance < value) {
      return NextResponse.json({ error: "Insufficient wallet balance." }, { status: 400 });
    }

    const newBalance = balance - value;
    const reference = `WITHDRAW-${Date.now()}`;

    await supabaseAdmin
      .from("wallets")
      .update({ balance: newBalance })
      .eq("user_id", userId);

    await supabaseAdmin.from("withdrawals").insert({
      user_id: userId,
      amount: value,
      momo_number: momoNumber,
      network,
      status: "pending",
      reference,
    });

    await supabaseAdmin.from("wallet_transactions").insert({
      user_id: userId,
      type: "withdrawal",
      amount: -value,
      status: "pending",
      reference,
      description: "Withdrawal request",
    });

    return NextResponse.json({
      success: true,
      message: "Withdrawal request submitted for review.",
      balance: newBalance,
    });
  } catch (error) {
    console.error("WITHDRAW ERROR:", error);
    return NextResponse.json({ error: "Withdrawal failed. Check server logs." }, { status: 500 });
  }
}

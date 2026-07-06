import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const { userId, amount, momoNumber, network } = await req.json();

    if (!userId || !amount || !momoNumber || !network) {
      return NextResponse.json({ error: "Missing withdrawal details" }, { status: 400 });
    }

    const value = Number(amount);

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("username, is_verified")
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

    const username = (profile.username || "PLAYER").toUpperCase();
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const random = Math.floor(1000 + Math.random() * 9000);
    const reference = `FP-${username}-${date}-${random}`;

    await supabaseAdmin
      .from("wallets")
      .update({ balance: balance - value })
      .eq("user_id", userId);

    await supabaseAdmin.from("withdrawals").insert({
      user_id: userId,
      amount: value,
      momo_number: momoNumber,
      network,
      status: "processing",
      reference,
    });

    await supabaseAdmin.from("wallet_transactions").insert({
      user_id: userId,
      type: "withdrawal",
      amount: -value,
      status: "processing",
      reference,
    });

    return NextResponse.json({
      success: true,
      message: `✅ Withdrawal is being processed.\n\nAmount: GH₵${value.toFixed(2)}\nDestination: ${network} • ${momoNumber}\nReference: ${reference}\n\nEstimated processing time: 5–30 minutes.`,
      reference,
    });
  } catch (error) {
    console.error("WITHDRAW ERROR:", error);
    return NextResponse.json({ error: "Withdrawal failed." }, { status: 500 });
  }
}

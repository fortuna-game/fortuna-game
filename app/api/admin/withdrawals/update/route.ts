import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const { id, status } = await req.json();

    if (!id || !["paid", "failed"].includes(status)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const { data: withdrawal } = await supabaseAdmin
      .from("withdrawals")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (!withdrawal) {
      return NextResponse.json({ error: "Withdrawal not found" }, { status: 404 });
    }

    if (withdrawal.status === "paid" || withdrawal.status === "failed") {
      return NextResponse.json({ error: "Withdrawal already processed" }, { status: 400 });
    }

    if (status === "failed") {
      const { data: wallet } = await supabaseAdmin
        .from("wallets")
        .select("balance")
        .eq("user_id", withdrawal.user_id)
        .maybeSingle();

      await supabaseAdmin
        .from("wallets")
        .update({
          balance: Number(wallet?.balance || 0) + Number(withdrawal.amount),
        })
        .eq("user_id", withdrawal.user_id);

      await supabaseAdmin.from("wallet_transactions").insert({
        user_id: withdrawal.user_id,
        type: "withdrawal_refund",
        amount: Number(withdrawal.amount),
        status: "completed",
        reference: withdrawal.reference,
      });
    }

    await supabaseAdmin
      .from("withdrawals")
      .update({
        status,
        processed_at: new Date().toISOString(),
      })
      .eq("id", id);

    return NextResponse.json({
      success: true,
      message:
        status === "paid"
          ? "Withdrawal marked as paid."
          : "Withdrawal marked as failed and wallet refunded.",
    });
  } catch (error) {
    console.error("ADMIN WITHDRAW UPDATE ERROR:", error);
    return NextResponse.json({ error: "Could not update withdrawal" }, { status: 500 });
  }
}

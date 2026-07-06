import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const { id, status } = await req.json();

    if (!id || !["sending", "paid", "failed"].includes(status)) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    const { data: withdrawal } = await supabaseAdmin
      .from("withdrawals")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (!withdrawal) {
      return NextResponse.json({ error: "Withdrawal not found." }, { status: 404 });
    }

    if (withdrawal.status === "paid") {
      return NextResponse.json({ error: "This withdrawal is already paid." }, { status: 400 });
    }

    if (withdrawal.status === "failed") {
      return NextResponse.json({ error: "This withdrawal already failed and has already been handled." }, { status: 400 });
    }

    if (status === "sending") {
      if (withdrawal.status === "sending") {
        return NextResponse.json({ error: "Payment is already pending." }, { status: 400 });
      }

      await supabaseAdmin.from("withdrawals").update({
        status: "sending",
        admin_note: "Payment being processed manually",
      }).eq("id", id);

      return NextResponse.json({ success: true, message: "Payment moved to pending." });
    }

    if (status === "paid") {
      await supabaseAdmin.from("withdrawals").update({
        status: "paid",
        processed_at: new Date().toISOString(),
        admin_note: "Payment marked paid manually",
      }).eq("id", id);

      return NextResponse.json({ success: true, message: "Withdrawal marked as paid." });
    }

    if (status === "failed") {
      if (withdrawal.refunded_at) {
        return NextResponse.json({ error: "This withdrawal has already been refunded." }, { status: 400 });
      }

      const { data: wallet } = await supabaseAdmin
        .from("wallets")
        .select("balance")
        .eq("user_id", withdrawal.user_id)
        .maybeSingle();

      await supabaseAdmin.from("wallets").update({
        balance: Number(wallet?.balance || 0) + Number(withdrawal.amount),
      }).eq("user_id", withdrawal.user_id);

      await supabaseAdmin.from("wallet_transactions").insert({
        user_id: withdrawal.user_id,
        type: "withdrawal_refund",
        amount: Number(withdrawal.amount),
        status: "completed",
        reference: withdrawal.reference,
        description: "Withdrawal failed and refunded",
      });

      await supabaseAdmin.from("withdrawals").update({
        status: "failed",
        processed_at: new Date().toISOString(),
        refunded_at: new Date().toISOString(),
        failure_reason: "Payment failed. Wallet refunded.",
        admin_note: "Payment failed and wallet refunded",
      }).eq("id", id);

      return NextResponse.json({ success: true, message: "Withdrawal failed and wallet refunded." });
    }

    return NextResponse.json({ error: "No action taken." }, { status: 400 });
  } catch (error) {
    console.error("ADMIN WITHDRAW UPDATE ERROR:", error);
    return NextResponse.json({ error: "Could not update withdrawal." }, { status: 500 });
  }
}

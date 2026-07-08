import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    console.log("Hubtel withdrawal callback:", payload);

    const responseCode = payload?.ResponseCode;
    const data = payload?.Data;

    const clientReference = data?.ClientReference;
    const transactionId = data?.TransactionId;
    const description = data?.Description || "Hubtel payout failed";

    if (!clientReference) {
      return NextResponse.json({ error: "ClientReference is missing." }, { status: 400 });
    }

    const { data: withdrawal } = await supabaseAdmin
      .from("withdrawals")
      .select("*")
      .eq("reference", clientReference)
      .maybeSingle();

    if (!withdrawal) {
      return NextResponse.json({ error: "Withdrawal not found." }, { status: 404 });
    }

    if (responseCode === "0000") {
      const { error } = await supabaseAdmin
        .from("withdrawals")
        .update({
          status: "paid",
          processed_at: new Date().toISOString(),
          hubtel_transaction_id: transactionId || null,
          hubtel_response: payload,
          failure_reason: null,
        })
        .eq("id", withdrawal.id)
        .neq("status", "failed");

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      return NextResponse.json({ success: true });
    }

    const { data: result, error: refundError } = await supabaseAdmin.rpc(
      "fail_withdrawal_and_refund_atomic",
      {
        p_withdrawal_id: withdrawal.id,
        p_failure_reason: description,
      }
    );

    if (refundError) {
      return NextResponse.json({ error: refundError.message }, { status: 500 });
    }

    const row = Array.isArray(result) ? result[0] : null;

    return NextResponse.json({
      success: Boolean(row?.success),
      message: row?.message || "Withdrawal callback handled.",
    });
  } catch (error) {
    console.error("Hubtel callback error:", error);
    return NextResponse.json({ error: "Unable to process Hubtel callback." }, { status: 500 });
  }
}

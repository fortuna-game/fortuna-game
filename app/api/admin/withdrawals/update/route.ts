import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function normalizePhone(phone: string) {
  let cleaned = String(phone).replace(/\D/g, "");
  if (cleaned.startsWith("0")) cleaned = "233" + cleaned.slice(1);
  return cleaned;
}

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

    if (status === "paid") {
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("username, first_name, last_name")
        .eq("user_id", withdrawal.user_id)
        .maybeSingle();

      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
      const internalSecret = process.env.INTERNAL_API_SECRET;

      if (!siteUrl || !internalSecret) {
        return NextResponse.json({ error: "Missing payout configuration" }, { status: 500 });
      }

      const payoutRes = await fetch(`${siteUrl}/api/withdrawals/process`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-internal-secret": internalSecret,
        },
        body: JSON.stringify({
          recipientName:
            `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim() ||
            profile?.username ||
            "Fortuna Player",
          recipientMsisdn: normalizePhone(withdrawal.momo_number),
          customerEmail: "",
          network: withdrawal.network,
          amount: withdrawal.amount,
          clientReference: withdrawal.reference,
        }),
      });

      const payoutData = await payoutRes.json();

      await supabaseAdmin
        .from("withdrawals")
        .update({
          hubtel_response: payoutData,
        })
        .eq("id", id);

      if (!payoutRes.ok) {
        return NextResponse.json({
          error: payoutData.error || "Hubtel payout failed to start",
          raw: payoutData,
        }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        message: "Payment has been sent to Hubtel for processing.",
        raw: payoutData,
      });
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

      await supabaseAdmin
        .from("withdrawals")
        .update({
          status: "failed",
          processed_at: new Date().toISOString(),
          failure_reason: "Marked failed by admin",
        })
        .eq("id", id);

      return NextResponse.json({
        success: true,
        message: "Withdrawal marked as failed and wallet refunded.",
      });
    }
  } catch (error) {
    console.error("ADMIN WITHDRAW UPDATE ERROR:", error);
    return NextResponse.json({ error: "Could not update withdrawal" }, { status: 500 });
  }
}

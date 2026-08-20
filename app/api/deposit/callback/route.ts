import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("HUBTEL CALLBACK:", body);

    const reference =
      body?.Data?.ClientReference ||
      body?.data?.clientReference ||
      body?.clientReference ||
      body?.ClientReference;

    const status =
      body?.Data?.Status ||
      body?.data?.status ||
      body?.status ||
      body?.Status;

    if (!reference) {
      return NextResponse.json(
        { error: "No reference" },
        { status: 400 }
      );
    }

    const { data: deposit } = await supabaseAdmin
      .from("deposits")
      .select("*")
      .eq("reference", reference)
      .maybeSingle();

    if (!deposit) {
      return NextResponse.json(
        { error: "Deposit not found" },
        { status: 404 }
      );
    }

    if (
      deposit.status === "completed" ||
      deposit.status === "failed" ||
      deposit.status === "cancelled" ||
      deposit.status === "declined" ||
      deposit.status === "expired"
    ) {
      return NextResponse.json({ success: true });
    }

    const normalizedStatus = String(status || "").toLowerCase();

    const isSuccessful =
      normalizedStatus.includes("success") ||
      normalizedStatus.includes("completed");

    const isCancelled =
      normalizedStatus.includes("cancel");

    const isDeclined =
      normalizedStatus.includes("declined") ||
      normalizedStatus.includes("reject");

    const isExpired =
      normalizedStatus.includes("expired") ||
      normalizedStatus.includes("timeout");

    const isFailed =
      normalizedStatus.includes("failed");

    if (isSuccessful) {
      const { error: completeError } = await supabaseAdmin.rpc("complete_deposit_atomic", {
        p_reference: reference,
      });

      if (completeError) {
        return NextResponse.json({ error: completeError.message }, { status: 500 });
      }
    } else if (isCancelled || isDeclined || isExpired || isFailed) {
      const failureStatus = isCancelled
        ? "cancelled"
        : isDeclined
        ? "declined"
        : isExpired
        ? "expired"
        : "failed";

      await supabaseAdmin
        .from("deposits")
        .update({ status: failureStatus })
        .eq("id", deposit.id);

      await supabaseAdmin
        .from("wallet_transactions")
        .insert({
          user_id: deposit.user_id,
          type: "deposit",
          amount: Number(deposit.amount),
          status: failureStatus,
          reference,
        });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("CALLBACK ERROR:", error);

    return NextResponse.json(
      { error: "Callback failed" },
      { status: 500 }
    );
  }
}

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
      deposit.status === "failed"
    ) {
      return NextResponse.json({ success: true });
    }

    const normalizedStatus = String(status || "").toLowerCase();

    const isSuccessful =
      normalizedStatus.includes("success") ||
      normalizedStatus.includes("completed");

    const isFailed =
      normalizedStatus.includes("failed") ||
      normalizedStatus.includes("cancel") ||
      normalizedStatus.includes("declined") ||
      normalizedStatus.includes("expired");

    if (isSuccessful) {
      const { data: wallet } = await supabaseAdmin
        .from("wallets")
        .select("balance")
        .eq("user_id", deposit.user_id)
        .maybeSingle();

      const newBalance =
        Number(wallet?.balance || 0) +
        Number(deposit.amount || 0);

      await supabaseAdmin
        .from("wallets")
        .update({ balance: newBalance })
        .eq("user_id", deposit.user_id);

      await supabaseAdmin
        .from("deposits")
        .update({ status: "completed" })
        .eq("id", deposit.id);

      await supabaseAdmin
        .from("wallet_transactions")
        .insert({
          user_id: deposit.user_id,
          type: "deposit",
          amount: Number(deposit.amount),
          status: "completed",
          reference,
        });
    } else if (isFailed) {
      await supabaseAdmin
        .from("deposits")
        .update({ status: "failed" })
        .eq("id", deposit.id);

      await supabaseAdmin
        .from("wallet_transactions")
        .insert({
          user_id: deposit.user_id,
          type: "deposit",
          amount: Number(deposit.amount),
          status: "failed",
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

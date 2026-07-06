import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    console.log("Hubtel withdrawal callback:", payload);

    const responseCode = payload?.ResponseCode;
    const data = payload?.Data;

    const clientReference = data?.ClientReference;
    const transactionId = data?.TransactionId;
    const description = data?.Description;

    if (!clientReference) {
      return NextResponse.json(
        { error: "ClientReference is missing." },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: "Supabase server environment variables are missing." },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const status = responseCode === "0000" ? "paid" : "failed";

    const { error } = await supabase
      .from("withdrawals")
      .update({
        status,
        hubtel_transaction_id: transactionId || null,
        hubtel_response: payload,
        failure_reason:
          responseCode === "0000"
            ? null
            : description || "Hubtel payout failed",
      })
      .eq("reference", clientReference);

    if (error) {
      console.error("Withdrawal callback database error:", error);

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Hubtel callback error:", error);

    return NextResponse.json(
      { error: "Unable to process Hubtel callback." },
      { status: 500 }
    );
  }
}

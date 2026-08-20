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

    const { data: deposit, error: depositError } = await supabaseAdmin
      .from("deposits")
      .select("id, user_id, amount, reference, status")
      .eq("reference", reference)
      .maybeSingle();

    if (depositError) {
      console.error("DEPOSIT LOOKUP ERROR:", depositError);

      return NextResponse.json(
        { error: depositError.message },
        { status: 500 }
      );
    }

    if (!deposit) {
      return NextResponse.json(
        { error: "Deposit not found" },
        { status: 404 }
      );
    }

    // Terminal states must never be processed again.
    if (
      deposit.status === "completed" ||
      deposit.status === "failed" ||
      deposit.status === "cancelled" ||
      deposit.status === "declined" ||
      deposit.status === "expired"
    ) {
      return NextResponse.json({
        success: true,
        status: deposit.status,
      });
    }

    const normalizedStatus = String(status || "")
      .trim()
      .toLowerCase();

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

    // SUCCESS: keep the existing atomic wallet-crediting flow.
    if (isSuccessful) {
      const { error: completeError } =
        await supabaseAdmin.rpc("complete_deposit_atomic", {
          p_reference: reference,
        });

      if (completeError) {
        console.error(
          "COMPLETE DEPOSIT ERROR:",
          completeError
        );

        return NextResponse.json(
          { error: completeError.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        status: "completed",
      });
    }

    // Only a confirmed provider result should leave PENDING.
    let finalStatus:
      | "cancelled"
      | "declined"
      | "expired"
      | "failed"
      | null = null;

    if (isCancelled) {
      finalStatus = "cancelled";
    } else if (isDeclined) {
      finalStatus = "declined";
    } else if (isExpired) {
      finalStatus = "expired";
    } else if (isFailed) {
      finalStatus = "failed";
    }

    // Unknown / missing / inconclusive status:
    // leave the deposit PENDING.
    if (!finalStatus) {
      console.log(
        "HUBTEL CALLBACK INCONCLUSIVE:",
        reference,
        normalizedStatus || "(empty status)"
      );

      return NextResponse.json({
        success: true,
        status: "pending",
      });
    }

    // Change the deposit only if it is still pending.
    // This prevents duplicate callbacks from creating duplicate history rows.
    const { data: updatedDeposit, error: updateError } =
      await supabaseAdmin
        .from("deposits")
        .update({ status: finalStatus })
        .eq("id", deposit.id)
        .eq("status", "pending")
        .select("id, status")
        .maybeSingle();

    if (updateError) {
      console.error(
        "UPDATE DEPOSIT STATUS ERROR:",
        updateError
      );

      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    // Another callback/request may already have finalized it.
    if (!updatedDeposit) {
      return NextResponse.json({
        success: true,
        status: finalStatus,
      });
    }

    return NextResponse.json({
      success: true,
      status: finalStatus,
    });
  } catch (error) {
    console.error("CALLBACK ERROR:", error);

    return NextResponse.json(
      { error: "Callback failed" },
      { status: 500 }
    );
  }
}

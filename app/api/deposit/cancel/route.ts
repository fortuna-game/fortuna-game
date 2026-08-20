import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: "Invalid session." },
        { status: 401 }
      );
    }

    const { reference } = await req.json();

    if (!reference) {
      return NextResponse.json(
        { error: "Missing deposit reference." },
        { status: 400 }
      );
    }

    const { data: deposit, error: fetchError } = await supabaseAdmin
      .from("deposits")
      .select("id, user_id, status")
      .eq("reference", reference)
      .eq("user_id", user.id)
      .maybeSingle();

    if (fetchError) {
      return NextResponse.json(
        { error: fetchError.message },
        { status: 500 }
      );
    }

    if (!deposit) {
      return NextResponse.json(
        { error: "Deposit not found." },
        { status: 404 }
      );
    }

    // Never change a completed/failed/declined/expired/cancelled deposit.
    if (deposit.status !== "pending") {
      return NextResponse.json({
        success: true,
        status: deposit.status,
      });
    }

    const { data: updated, error: updateError } = await supabaseAdmin
      .from("deposits")
      .update({ status: "cancelled" })
      .eq("id", deposit.id)
      .eq("user_id", user.id)
      .eq("status", "pending")
      .select("id, status")
      .maybeSingle();

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    if (!updated) {
      return NextResponse.json({
        success: true,
        status: "cancelled",
      });
    }

    await supabaseAdmin.from("wallet_transactions").insert({
      user_id: user.id,
      type: "deposit",
      amount: 0,
      status: "cancelled",
      reference,
    });

    return NextResponse.json({
      success: true,
      status: "cancelled",
    });
  } catch (error) {
    console.error("DEPOSIT CANCEL ERROR:", error);

    return NextResponse.json(
      { error: "Could not cancel deposit." },
      { status: 500 }
    );
  }
}

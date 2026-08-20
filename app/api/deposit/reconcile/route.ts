import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const PENDING_TIMEOUT_MS = 2 * 60 * 60 * 1000; // 2 hours

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

    const { data: adminRole } = await supabaseAdmin
      .from("admin_roles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();

    const isAdmin =
      adminRole && ["super_admin", "admin"].includes(adminRole.role);

    const cutoff = new Date(
      Date.now() - PENDING_TIMEOUT_MS
    ).toISOString();

    let query = supabaseAdmin
      .from("deposits")
      .select("id, user_id, amount, reference, status, created_at")
      .eq("status", "pending")
      .lt("created_at", cutoff);

    if (!isAdmin) {
      query = query.eq("user_id", user.id);
    }

    const { data: staleDeposits, error: fetchError } =
      await query;

    if (fetchError) {
      return NextResponse.json(
        { error: fetchError.message },
        { status: 500 }
      );
    }

    const stale = staleDeposits || [];

    if (stale.length === 0) {
      return NextResponse.json({
        success: true,
        expired: 0,
      });
    }

    const ids = stale.map((deposit) => deposit.id);

    const { data: expiredDeposits, error: updateError } =
      await supabaseAdmin
        .from("deposits")
        .update({ status: "expired" })
        .eq("status", "pending")
        .in("id", ids)
        .select("id, user_id, amount, reference");

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    for (const deposit of expiredDeposits || []) {
      // Zero amount: expiry is not a wallet credit/debit.
      await supabaseAdmin
        .from("wallet_transactions")
        .insert({
          user_id: deposit.user_id,
          type: "deposit",
          amount: 0,
          status: "expired",
          reference: deposit.reference,
        });
    }

    return NextResponse.json({
      success: true,
      expired: expiredDeposits?.length || 0,
    });
  } catch (error) {
    console.error("DEPOSIT RECONCILE ERROR:", error);

    return NextResponse.json(
      { error: "Could not reconcile pending deposits." },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

async function requireAdmin(req: Request) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;

  const {
    data: { user },
  } = await supabaseAdmin.auth.getUser(token);

  if (!user) return null;

  const { data: role } = await supabaseAdmin
    .from("admin_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!role || !["super_admin", "admin"].includes(role.role)) {
    return null;
  }

  return user;
}

export async function PATCH(req: Request) {
  try {
    const admin = await requireAdmin(req);

    if (!admin) {
      return NextResponse.json(
        { error: "Admin access denied." },
        { status: 403 }
      );
    }

    const { id, status } = await req.json();

    if (!id || status !== "cancelled") {
      return NextResponse.json(
        { error: "Invalid deposit update." },
        { status: 400 }
      );
    }

    const { data: deposit, error: fetchError } = await supabaseAdmin
      .from("deposits")
      .select("id, user_id, amount, reference, status")
      .eq("id", id)
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

    if (deposit.status !== "pending") {
      return NextResponse.json(
        {
          error: `Only pending deposits can be cancelled. Current status: ${deposit.status}`,
        },
        { status: 409 }
      );
    }

    const { data: updated, error: updateError } = await supabaseAdmin
      .from("deposits")
      .update({ status: "cancelled" })
      .eq("id", id)
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
      return NextResponse.json(
        { error: "Deposit status changed before cancellation completed." },
        { status: 409 }
      );
    }

    // Record the cancelled transaction for the user's account history.
    await supabaseAdmin.from("wallet_transactions").insert({
      user_id: deposit.user_id,
      type: "deposit",
      amount: Number(deposit.amount),
      status: "cancelled",
      reference: deposit.reference,
    });

    return NextResponse.json({
      success: true,
      deposit: updated,
    });
  } catch (error) {
    console.error("ADMIN DEPOSIT UPDATE ERROR:", error);

    return NextResponse.json(
      { error: "Could not update deposit." },
      { status: 500 }
    );
  }
}

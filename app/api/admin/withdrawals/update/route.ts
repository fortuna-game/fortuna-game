import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Admin login required." }, { status: 401 });
    }

    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json({ error: "Admin access denied." }, { status: 403 });
    }

    const { data: adminRole } = await supabaseAdmin
      .from("admin_roles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!adminRole || !["super_admin", "admin"].includes(adminRole.role)) {
      return NextResponse.json({ error: "Admin access denied." }, { status: 403 });
    }

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

    if (withdrawal.status === "failed" || withdrawal.refunded_at) {
      return NextResponse.json({ error: "This withdrawal has already failed and was already refunded." }, { status: 400 });
    }

    if (status === "sending") {
      if (withdrawal.status === "sending") {
        return NextResponse.json({ error: "Payment is already pending." }, { status: 400 });
      }

      const { error } = await supabaseAdmin
        .from("withdrawals")
        .update({
          status: "sending",
          admin_note: "Payment being processed manually",
        })
        .eq("id", id);

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      return NextResponse.json({ success: true, message: "Payment moved to pending." });
    }

    if (status === "paid") {
      const { error } = await supabaseAdmin
        .from("withdrawals")
        .update({
          status: "paid",
          processed_at: new Date().toISOString(),
          admin_note: "Payment marked paid manually",
        })
        .eq("id", id);

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      return NextResponse.json({ success: true, message: "Withdrawal marked as paid." });
    }

    if (status === "failed") {
      const { data: result, error: refundError } = await supabaseAdmin.rpc(
        "fail_withdrawal_and_refund_atomic",
        {
          p_withdrawal_id: id,
          p_failure_reason: "Payment failed manually by admin",
        }
      );

      if (refundError) {
        return NextResponse.json({ error: refundError.message }, { status: 500 });
      }

      const row = Array.isArray(result) ? result[0] : null;

      if (!row?.success) {
        return NextResponse.json({ error: row?.message || "Refund failed." }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        message: row.message || "Withdrawal failed and wallet refunded once.",
      });
    }

    return NextResponse.json({ error: "No action taken." }, { status: 400 });
  } catch (error) {
    console.error("ADMIN WITHDRAW UPDATE ERROR:", error);
    return NextResponse.json({ error: "Could not update withdrawal." }, { status: 500 });
  }
}

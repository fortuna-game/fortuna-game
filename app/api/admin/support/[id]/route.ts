import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

async function requireAdmin(req: Request) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return false;

  const { data: { user } } = await supabaseAdmin.auth.getUser(token);
  if (!user) return false;

  const { data: role } = await supabaseAdmin
    .from("admin_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  return Boolean(role && ["super_admin", "admin"].includes(role.role));
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const ok = await requireAdmin(req);

  if (!ok) {
    return NextResponse.json(
      { error: "Admin access denied." },
      { status: 403 }
    );
  }

  const { id } = await params;

  const { data, error } = await supabaseAdmin
    .from("support_tickets")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Ticket not found." }, { status: 404 });
  }

  const isAffiliateTicket =
    typeof data.issue_type === "string" &&
    data.issue_type.startsWith("Affiliate —");

  if (!isAffiliateTicket) {
    return NextResponse.json({
      ticket: data,
      affiliate: null,
      affiliateStats: null,
    });
  }

  const { data: affiliate } = await supabaseAdmin
    .from("affiliate_profiles")
    .select("*")
    .eq("user_id", data.user_id)
    .maybeSingle();

  if (!affiliate) {
    return NextResponse.json({
      ticket: data,
      affiliate: null,
      affiliateStats: null,
    });
  }

  const [
    referralsResult,
    earningsResult,
    payoutsResult,
  ] = await Promise.all([
    supabaseAdmin
      .from("affiliate_referrals")
      .select("*")
      .eq("affiliate_id", affiliate.id),

    supabaseAdmin
      .from("affiliate_earnings")
      .select("*")
      .eq("affiliate_id", affiliate.id),

    supabaseAdmin
      .from("affiliate_payouts")
      .select("*")
      .eq("affiliate_id", affiliate.id),
  ]);

  const referrals = referralsResult.data || [];
  const earnings = earningsResult.data || [];
  const payouts = payoutsResult.data || [];

  const qualifiedReferrals = referrals.filter((referral: any) =>
    referral.qualified === true ||
    referral.is_qualified === true ||
    referral.status === "qualified" ||
    referral.reward_paid === true
  ).length;

  const totalEarnings = earnings.reduce(
    (total: number, earning: any) =>
      total + Number(
        earning.amount ??
        earning.earning_amount ??
        earning.commission_amount ??
        0
      ),
    0
  );

  const pendingWithdrawals = payouts
    .filter((payout: any) =>
      ["pending", "processing", "requested"].includes(
        String(payout.status || "").toLowerCase()
      )
    )
    .reduce(
      (total: number, payout: any) =>
        total + Number(payout.amount ?? payout.payout_amount ?? 0),
      0
    );

  const paidWithdrawals = payouts
    .filter((payout: any) =>
      ["paid", "completed", "approved", "successful"].includes(
        String(payout.status || "").toLowerCase()
      )
    )
    .reduce(
      (total: number, payout: any) =>
        total + Number(payout.amount ?? payout.payout_amount ?? 0),
      0
    );

  const availableBalance = Number(
    affiliate.available_balance ??
    affiliate.balance ??
    Math.max(totalEarnings - paidWithdrawals - pendingWithdrawals, 0)
  );

  return NextResponse.json({
    ticket: data,
    affiliate,
    affiliateStats: {
      totalReferrals: referrals.length,
      qualifiedReferrals,
      totalEarnings,
      availableBalance,
      pendingWithdrawals,
    },
  });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const ok = await requireAdmin(req);

  if (!ok) {
    return NextResponse.json(
      { error: "Admin access denied." },
      { status: 403 }
    );
  }

  const { id } = await params;
  const { status, admin_reply } = await req.json();

  if (
    status &&
    !["open", "in_progress", "resolved"].includes(status)
  ) {
    return NextResponse.json(
      { error: "Invalid ticket status." },
      { status: 400 }
    );
  }

  const updateData: {
    status?: string;
    admin_reply?: string;
    replied_at?: string;
  } = {};

  if (status) {
    updateData.status = status;
  }

  if (typeof admin_reply === "string") {
    updateData.admin_reply = admin_reply.trim();
    updateData.replied_at = new Date().toISOString();
  }

  const { error } = await supabaseAdmin
    .from("support_tickets")
    .update(updateData)
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    message: "Ticket updated successfully.",
  });
}

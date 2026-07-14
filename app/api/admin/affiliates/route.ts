import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

async function requireAdmin(req: Request) {
  const token = req.headers
    .get("authorization")
    ?.replace("Bearer ", "");

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

export async function GET(req: Request) {
  try {
    const admin = await requireAdmin(req);

    if (!admin) {
      return NextResponse.json(
        { error: "Admin access denied." },
        { status: 403 }
      );
    }

    const [
      affiliatesResult,
      referralsResult,
      payoutsResult,
    ] = await Promise.all([
      supabaseAdmin
        .from("affiliate_profiles")
        .select("*")
        .order("created_at", { ascending: false }),

      supabaseAdmin
        .from("affiliate_referrals")
        .select("*"),

      supabaseAdmin
        .from("affiliate_payouts")
        .select("*")
        .order("requested_at", { ascending: false }),
    ]);

    if (affiliatesResult.error) {
      return NextResponse.json(
        { error: affiliatesResult.error.message },
        { status: 500 }
      );
    }

    if (payoutsResult.error) {
      return NextResponse.json(
        { error: payoutsResult.error.message },
        { status: 500 }
      );
    }

    const affiliates = (affiliatesResult.data || []).map(
      (affiliate: any) => {
        const referrals = (referralsResult.data || []).filter(
          (referral: any) =>
            referral.affiliate_id === affiliate.id
        );

        return {
          ...affiliate,
          referral_count: referrals.length,
          qualified_count: referrals.filter(
            (referral: any) => referral.qualified
          ).length,
        };
      }
    );

    const payouts = (payoutsResult.data || []).map(
      (payout: any) => {
        const affiliate = affiliates.find(
          (item: any) => item.id === payout.affiliate_id
        );

        return {
          ...payout,
          affiliate_name:
            affiliate?.full_name || "Unknown Affiliate",
          affiliate_phone: affiliate?.phone || "",
          affiliate_email: affiliate?.email || "",
        };
      }
    );

    const totalReferrals = (referralsResult.data || []).length;

    const totalQualified = (referralsResult.data || []).filter(
      (referral: any) => referral.qualified
    ).length;

    const totalAvailable = affiliates.reduce(
      (sum: number, affiliate: any) =>
        sum + Number(affiliate.available_balance || 0),
      0
    );

    const totalPaid = affiliates.reduce(
      (sum: number, affiliate: any) =>
        sum + Number(affiliate.total_paid || 0),
      0
    );

    const pendingPayoutAmount = payouts
      .filter(
        (payout: any) =>
          payout.status === "pending" ||
          payout.status === "processing"
      )
      .reduce(
        (sum: number, payout: any) =>
          sum + Number(payout.amount || 0),
        0
      );

    return NextResponse.json({
      affiliates,
      payouts,
      totals: {
        totalAffiliates: affiliates.length,
        activeAffiliates: affiliates.filter(
          (affiliate: any) => affiliate.status === "active"
        ).length,
        totalReferrals,
        totalQualified,
        totalAvailable,
        totalPaid,
        pendingPayouts: payouts.filter(
          (payout: any) =>
            payout.status === "pending" ||
            payout.status === "processing"
        ).length,
        pendingPayoutAmount,
      },
    });
  } catch (error) {
    console.error("ADMIN AFFILIATES GET ERROR:", error);

    return NextResponse.json(
      { error: "Could not load affiliates." },
      { status: 500 }
    );
  }
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

    const body = await req.json();

    const action = String(body.action || "").trim();

    if (action === "activate" || action === "suspend") {
      const affiliateId = String(
        body.affiliateId || ""
      ).trim();

      if (!affiliateId) {
        return NextResponse.json(
          { error: "Affiliate ID is required." },
          { status: 400 }
        );
      }

      const status =
        action === "activate" ? "active" : "suspended";

      const { error } = await supabaseAdmin
        .from("affiliate_profiles")
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", affiliateId);

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message:
          action === "activate"
            ? "Affiliate activated successfully."
            : "Affiliate suspended successfully.",
      });
    }

    if (
      action === "processing" ||
      action === "paid" ||
      action === "failed"
    ) {
      const payoutId = String(body.payoutId || "").trim();
      const adminNote = String(body.adminNote || "").trim();

      if (!payoutId) {
        return NextResponse.json(
          { error: "Payout ID is required." },
          { status: 400 }
        );
      }

      if (action === "failed" && !adminNote) {
        return NextResponse.json(
          { error: "Enter a reason for the failed payment." },
          { status: 400 }
        );
      }

      const { data, error } = await supabaseAdmin.rpc(
        "process_affiliate_payout_atomic",
        {
          p_payout_id: payoutId,
          p_action: action,
          p_admin_note: adminNote || null,
        }
      );

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        result: data,
        message:
          action === "processing"
            ? "Withdrawal marked as processing."
            : action === "paid"
            ? "Affiliate withdrawal marked as paid."
            : "Payment failed and the money was returned to the affiliate balance.",
      });
    }

    return NextResponse.json(
      { error: "Invalid affiliate action." },
      { status: 400 }
    );
  } catch (error) {
    console.error("ADMIN AFFILIATES PATCH ERROR:", error);

    return NextResponse.json(
      { error: "Could not update affiliate payout." },
      { status: 500 }
    );
  }
}

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
      earningsResult,
      payoutsResult,
    ] = await Promise.all([
      supabaseAdmin
        .from("affiliate_profiles")
        .select("*")
        .order("created_at", { ascending: false }),

      supabaseAdmin
        .from("affiliate_referrals")
        .select("*")
        .order("created_at", { ascending: false }),

      supabaseAdmin
        .from("affiliate_earnings")
        .select("*")
        .order("earned_at", { ascending: false }),

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

    const affiliates = (affiliatesResult.data || []).map(
      (affiliate: any) => {
        const referrals = (referralsResult.data || []).filter(
          (referral: any) =>
            referral.affiliate_id === affiliate.id
        );

        const qualifiedReferrals = referrals.filter(
          (referral: any) => referral.qualified
        );

        const earnings = (earningsResult.data || []).filter(
          (earning: any) =>
            earning.affiliate_id === affiliate.id
        );

        const payouts = (payoutsResult.data || []).filter(
          (payout: any) =>
            payout.affiliate_id === affiliate.id
        );

        const availableEarnings = earnings
          .filter((earning: any) => earning.status === "available")
          .reduce(
            (sum: number, earning: any) =>
              sum + Number(earning.amount || 0),
            0
          );

        const paidEarnings = earnings
          .filter((earning: any) => earning.status === "paid")
          .reduce(
            (sum: number, earning: any) =>
              sum + Number(earning.amount || 0),
            0
          );

        return {
          ...affiliate,
          referral_count: referrals.length,
          qualified_count: qualifiedReferrals.length,
          available_earnings: availableEarnings,
          paid_earnings: paidEarnings,
          payout_count: payouts.length,
          pending_payout_count: payouts.filter(
            (payout: any) =>
              payout.status === "pending" ||
              payout.status === "processing"
          ).length,
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

    return NextResponse.json({
      affiliates,
      totals: {
        totalAffiliates: affiliates.length,
        activeAffiliates: affiliates.filter(
          (affiliate: any) => affiliate.status === "active"
        ).length,
        totalReferrals,
        totalQualified,
        totalAvailable,
        totalPaid,
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

    const affiliateId = String(
      body.affiliateId || ""
    ).trim();

    const action = String(body.action || "").trim();

    if (!affiliateId) {
      return NextResponse.json(
        { error: "Affiliate ID is required." },
        { status: 400 }
      );
    }

    const { data: affiliate, error: affiliateError } =
      await supabaseAdmin
        .from("affiliate_profiles")
        .select("*")
        .eq("id", affiliateId)
        .maybeSingle();

    if (affiliateError) {
      return NextResponse.json(
        { error: affiliateError.message },
        { status: 500 }
      );
    }

    if (!affiliate) {
      return NextResponse.json(
        { error: "Affiliate not found." },
        { status: 404 }
      );
    }

    if (action === "activate") {
      const { error } = await supabaseAdmin
        .from("affiliate_profiles")
        .update({
          status: "active",
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
        message: "Affiliate activated successfully.",
      });
    }

    if (action === "suspend") {
      const { error } = await supabaseAdmin
        .from("affiliate_profiles")
        .update({
          status: "suspended",
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
        message: "Affiliate suspended successfully.",
      });
    }

    if (action === "mark_paid") {
      const amount = Number(affiliate.available_balance || 0);

      if (amount <= 0) {
        return NextResponse.json(
          { error: "Affiliate has no available earnings." },
          { status: 400 }
        );
      }

      const now = new Date().toISOString();

      const { error: payoutError } = await supabaseAdmin
        .from("affiliate_payouts")
        .insert({
          affiliate_id: affiliateId,
          amount,
          payment_method:
            affiliate.payment_method || "momo",
          payment_details: {
            momo_number: affiliate.momo_number,
            momo_network: affiliate.momo_network,
            bank_name: affiliate.bank_name,
            bank_account_name:
              affiliate.bank_account_name,
            bank_account_number:
              affiliate.bank_account_number,
          },
          status: "paid",
          admin_note:
            String(body.adminNote || "").trim() || null,
          requested_at: now,
          processed_at: now,
        });

      if (payoutError) {
        return NextResponse.json(
          { error: payoutError.message },
          { status: 500 }
        );
      }

      const { error: earningsError } =
        await supabaseAdmin
          .from("affiliate_earnings")
          .update({
            status: "paid",
            paid_at: now,
          })
          .eq("affiliate_id", affiliateId)
          .eq("status", "available");

      if (earningsError) {
        return NextResponse.json(
          { error: earningsError.message },
          { status: 500 }
        );
      }

      const { error: profileError } =
        await supabaseAdmin
          .from("affiliate_profiles")
          .update({
            available_balance: 0,
            total_paid:
              Number(affiliate.total_paid || 0) + amount,
            updated_at: now,
          })
          .eq("id", affiliateId);

      if (profileError) {
        return NextResponse.json(
          { error: profileError.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: `GH₵${amount.toFixed(
          2
        )} marked as paid successfully.`,
      });
    }

    return NextResponse.json(
      { error: "Invalid affiliate action." },
      { status: 400 }
    );
  } catch (error) {
    console.error("ADMIN AFFILIATES PATCH ERROR:", error);

    return NextResponse.json(
      { error: "Could not update affiliate." },
      { status: 500 }
    );
  }
}

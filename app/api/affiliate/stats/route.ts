import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [
      affiliatesResult,
      referralsResult,
      earningsResult,
    ] = await Promise.all([
      supabaseAdmin
        .from("affiliate_profiles")
        .select("id, status"),

      supabaseAdmin
        .from("affiliate_referrals")
        .select("*"),

      supabaseAdmin
        .from("affiliate_earnings")
        .select("*"),
    ]);

    if (affiliatesResult.error) {
      throw affiliatesResult.error;
    }

    if (referralsResult.error) {
      throw referralsResult.error;
    }

    if (earningsResult.error) {
      throw earningsResult.error;
    }

    const affiliates = affiliatesResult.data || [];
    const referrals = referralsResult.data || [];
    const earnings = earningsResult.data || [];

    const activeAffiliates = affiliates.filter((affiliate) => {
      const status = String(affiliate.status || "active").toLowerCase();

      return !["blocked", "suspended", "inactive"].includes(status);
    }).length;

    const qualifiedReferrals = referrals.filter((referral) => {
      const status = String(referral.status || "").toLowerCase();

      return (
        referral.qualified === true ||
        referral.is_qualified === true ||
        referral.reward_paid === true ||
        status === "qualified" ||
        status === "completed"
      );
    }).length;

    const totalAffiliateEarnings = earnings.reduce((total, earning) => {
      const amount = Number(
        earning.amount ??
        earning.earning_amount ??
        earning.commission_amount ??
        0
      );

      return total + (Number.isFinite(amount) ? amount : 0);
    }, 0);

    return NextResponse.json(
      {
        success: true,
        stats: {
          activeAffiliates,
          qualifiedReferrals,
          totalAffiliateEarnings,
          dailyEarningPotential: 100,
        },
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (error) {
    console.error("PUBLIC AFFILIATE STATS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        stats: {
          activeAffiliates: 0,
          qualifiedReferrals: 0,
          totalAffiliateEarnings: 0,
          dailyEarningPotential: 100,
        },
      },
      { status: 500 }
    );
  }
}

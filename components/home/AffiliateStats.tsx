"use client";

import { useEffect, useState } from "react";

type AffiliateStatsData = {
  activeAffiliates: number;
  qualifiedReferrals: number;
  totalAffiliateEarnings: number;
  dailyEarningPotential: number;
};

const defaultStats: AffiliateStatsData = {
  activeAffiliates: 0,
  qualifiedReferrals: 0,
  totalAffiliateEarnings: 0,
  dailyEarningPotential: 100,
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-GH").format(value);
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-GH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export default function AffiliateStats() {
  const [stats, setStats] = useState<AffiliateStatsData>(defaultStats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const response = await fetch("/api/affiliate/stats", {
          cache: "no-store",
        });

        const data = await response.json();

        if (response.ok && data.stats) {
          setStats(data.stats);
        }
      } catch (error) {
        console.error("Could not load affiliate statistics:", error);
      } finally {
        setLoading(false);
      }
    }

    void loadStats();
  }, []);

  const cards = [
    {
      label: "Active Affiliates",
      value: loading ? "..." : formatNumber(stats.activeAffiliates),
    },
    {
      label: "Qualified Referrals",
      value: loading ? "..." : formatNumber(stats.qualifiedReferrals),
    },
    {
      label: "Affiliate Earnings Generated",
      value: loading
        ? "..."
        : `GH₵${formatMoney(stats.totalAffiliateEarnings)}`,
    },
    {
      label: "Daily Earning Potential",
      value: `GH₵${formatNumber(stats.dailyEarningPotential)}`,
    },
  ];

  return (
    <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-3xl border border-green-500/20 bg-[#071A33]/50 p-5 text-center"
        >
          <p className="text-3xl font-black text-green-400">
            {card.value}
          </p>

          <p className="mt-2 text-sm font-bold uppercase tracking-wider text-[#8295B0]">
            {card.label}
          </p>
        </div>
      ))}
    </div>
  );
}

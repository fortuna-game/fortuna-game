"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Activity = {
  id: string;
  source: "skill_game" | "lucky_draw" | "prize_vault";
  title: string;
  subtitle: string;
  outcome: "won" | "lost";
  score: number | null;
  prizeAmount: number;
  createdAt: string;
  claimStatus: string | null;
  href: string | null;
};

type Tab = "all" | "wins" | "losses";

function ActivityContent() {
  const searchParams = useSearchParams();

  const requestedTab = searchParams.get("tab");

  const initialTab: Tab =
    requestedTab === "wins"
      ? "wins"
      : requestedTab === "losses"
      ? "losses"
      : "all";

  const [tab, setTab] = useState<Tab>(initialTab);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadActivity() {
    setLoading(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setActivities([]);
        return;
      }

      const response = await fetch("/api/my-activity", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        cache: "no-store",
      });

      if (!response.ok) {
        setActivities([]);
        return;
      }

      const data = await response.json();

      setActivities(data.activities || []);
    } catch (error) {
      console.error(error);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadActivity();
  }, []);

  const visibleActivities = activities.filter((item) => {
    if (tab === "wins") return item.outcome === "won";
    if (tab === "losses") return item.outcome === "lost";
    return true;
  });

  const tabButton = (
    value: Tab,
    label: string,
    activeClass: string
  ) => (
    <button
      type="button"
      onClick={() => setTab(value)}
      className={`border-b-2 px-4 py-3 text-sm font-black transition ${
        tab === value
          ? activeClass
          : "border-transparent text-[#8295B0] hover:text-white"
      }`}
    >
      {label}
    </button>
  );

  return (
    <main className="min-h-screen bg-[#071A33] px-4 py-8 text-white sm:px-6 sm:py-10">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black sm:text-4xl">
              My Activity
            </h1>

            <p className="mt-2 text-sm text-[#9AAAC1]">
              Your complete game and prize activity.
            </p>
          </div>

          <Link
            href="/wallet/history"
            className="text-sm font-bold text-[#8295B0] hover:text-white"
          >
            Transactions →
          </Link>
        </div>

        <div className="mt-6 border-b border-white/10">
          <div className="flex flex-wrap">
            {tabButton(
              "all",
              "All Activity",
              "border-white text-white"
            )}

            {tabButton(
              "wins",
              "Wins",
              "border-green-500 text-green-400"
            )}

            {tabButton(
              "losses",
              "Losses",
              "border-red-500 text-red-400"
            )}
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm text-[#8295B0]">
            Loading your activity...
          </div>
        ) : visibleActivities.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-lg font-black">
              {tab === "wins"
                ? "No wins recorded yet."
                : tab === "losses"
                ? "No losses recorded yet."
                : "No activity recorded yet."}
            </p>

            <p className="mt-2 text-sm text-[#8295B0]">
              Your completed games and prize events will appear here.
            </p>
          </div>
        ) : (
          <div className="mt-2 overflow-hidden bg-white text-[#071A33]">
            {visibleActivities.map((item) => {
              const won = item.outcome === "won";

              return (
                <div
                  key={item.id}
                  className={`grid gap-3 border-b px-4 py-4 last:border-b-0 sm:grid-cols-[1fr_auto_auto] sm:items-center ${
                    won
                      ? "border-green-100"
                      : "border-red-100"
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-base font-black capitalize">
                        {item.title}
                      </p>

                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#8295B0]">
                        {item.source === "skill_game"
                          ? "Game"
                          : item.source === "lucky_draw"
                          ? "Lucky Draw"
                          : "Prize Vault"}
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-[#8295B0]">
                      {item.subtitle}
                      {item.score !== null
                        ? ` · Score ${item.score}`
                        : ""}
                    </p>

                    <p className="mt-1 text-[11px] text-[#A3AAB5]">
                      {new Date(item.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div
                    className={`text-sm font-black ${
                      won ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {won ? "WON" : "LOST"}
                  </div>

                  <div className="text-left sm:text-right">
                    {won ? (
                      <>
                        <p className="text-sm font-black text-green-600">
                          GH₵{Number(item.prizeAmount || 0).toFixed(2)}
                        </p>

                        {item.claimStatus && (
                          <p className="mt-1 text-[11px] capitalize text-[#8295B0]">
                            {item.claimStatus.replaceAll("_", " ")}
                          </p>
                        )}

                        {item.href && (
                          <Link
                            href={item.href}
                            className="mt-1 inline-block text-[11px] font-black text-green-700 hover:underline"
                          >
                            Prize details →
                          </Link>
                        )}
                      </>
                    ) : (
                      <p className="text-xs font-bold text-red-500">
                        No prize won
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

export default function GameHistoryPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#071A33] px-4 py-8 text-white">
          <div className="mx-auto max-w-5xl py-12 text-center text-sm text-[#8295B0]">
            Loading your activity...
          </div>
        </main>
      }
    >
      <ActivityContent />
    </Suspense>
  );
}

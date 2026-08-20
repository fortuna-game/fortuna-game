"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type GameResult = {
  id: string;
  game_slug: string;
  score: number;
  prize_amount: number;
  won: boolean;
  created_at: string;
};

type LuckyDrawWin = {
  id: string;
  title: string;
  prize_amount: number | null;
  prize_type: string | null;
  prize_description: string | null;
  prize_value: number | null;
  draw_at: string | null;
  created_at: string;
};

function GameHistoryContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "wins" ? "wins" : "history";

  const [tab, setTab] = useState<"history" | "wins">(initialTab);
  const [results, setResults] = useState<GameResult[]>([]);
  const [wins, setWins] = useState<LuckyDrawWin[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setResults([]);
      setWins([]);
      setLoading(false);
      return;
    }

    const { data: gameResults } = await supabase
      .from("game_results")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    setResults(gameResults || []);

    const winsResponse = await fetch("/api/my-wins", {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (winsResponse.ok) {
      const winsData = await winsResponse.json();
      setWins(winsData.wins || []);
    } else {
      setWins([]);
    }

    setLoading(false);
  }

  useEffect(() => {
    void loadData();
  }, []);

  return (
    <main className="min-h-screen bg-[#071A33] px-4 py-8 text-white sm:px-6 sm:py-10">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-black text-[#4D94F5] sm:text-4xl">
          My Activity
        </h1>

        <p className="mt-2 text-[#9AAAC1]">
          View your game history and Lucky Draw wins.
        </p>

        <div className="mt-8 flex gap-3 border-b border-[#38BDF8]/15">
          <button
            onClick={() => setTab("history")}
            className={`border-b-2 px-4 py-3 font-black transition ${
              tab === "history"
                ? "border-blue-500 text-[#66A7FF]"
                : "border-transparent text-[#8295B0]"
            }`}
          >
            History
          </button>

          <button
            onClick={() => setTab("wins")}
            className={`border-b-2 px-4 py-3 font-black transition ${
              tab === "wins"
                ? "border-[#FFD54A] text-[#FFE08A]"
                : "border-transparent text-[#8295B0]"
            }`}
          >
            Wins
          </button>

          <Link
            href="/wallet/history"
            className="border-b-2 border-transparent px-4 py-3 font-black text-[#8295B0]"
          >
            Transactions
          </Link>
        </div>

        {loading ? (
          <p className="mt-8 rounded-2xl border border-[#38BDF8]/15 bg-[#0B2545]/70 p-6 text-[#9AAAC1]">
            Loading your activity...
          </p>
        ) : tab === "history" ? (
          <div className="mt-6 space-y-4">
            {results.map((r) => (
              <div
                key={r.id}
                className="rounded-2xl border border-[#38BDF8]/15 bg-[#0B2545]/70 p-5"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xl font-black capitalize">
                      {r.game_slug.replaceAll("-", " ")}
                    </p>

                    <p className="mt-1 text-sm text-[#8295B0]">
                      Score: {r.score}
                    </p>

                    <p className="mt-1 text-xs text-[#7185A3]">
                      {new Date(r.created_at).toLocaleString()}
                    </p>
                  </div>

                  <div className="text-right">
                    <p
                      className={
                        r.won
                          ? "text-2xl font-black text-[#66A7FF]"
                          : "text-2xl font-black text-red-300"
                      }
                    >
                      {r.won ? "Won" : "Lost"}
                    </p>

                    <p className="mt-1 text-sm text-[#8295B0]">
                      Prize: GH₵{Number(r.prize_amount || 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {results.length === 0 && (
              <p className="rounded-2xl border border-[#38BDF8]/15 bg-[#0B2545]/70 p-6 text-[#9AAAC1]">
                No game history yet.
              </p>
            )}
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {wins.map((win) => (
              <div
                key={win.id}
                className="rounded-2xl border border-[#FFD54A]/25 bg-[#FFD54A]/[0.05] p-5"
              >
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#FFE08A]">
                      Lucky Draw Winner 🎉
                    </p>

                    <h2 className="mt-1 text-xl font-black">
                      Congratulations! You won {win.title}
                    </h2>

                    {win.prize_description && (
                      <p className="mt-2 text-sm text-[#9AAAC1]">
                        {win.prize_description}
                      </p>
                    )}

                    <p className="mt-2 text-xs text-[#7185A3]">
                      Draw completed:{" "}
                      {new Date(
                        win.draw_at || win.created_at
                      ).toLocaleString()}
                    </p>
                  </div>

                  <Link
                    href={`/lucky-draw/claim-prize?drawId=${win.id}`}
                    className="shrink-0 rounded-xl bg-[#FFD54A] px-5 py-3 text-center font-black text-black"
                  >
                    View Prize Details
                  </Link>
                </div>
              </div>
            ))}

            {wins.length === 0 && (
              <p className="rounded-2xl border border-[#38BDF8]/15 bg-[#0B2545]/70 p-6 text-[#9AAAC1]">
                You have not won a Lucky Draw yet.
              </p>
            )}
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
          <div className="mx-auto max-w-5xl text-center text-[#9AAAC1]">
            Loading your activity...
          </div>
        </main>
      }
    >
      <GameHistoryContent />
    </Suspense>
  );
}

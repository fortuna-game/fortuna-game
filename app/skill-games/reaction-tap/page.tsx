"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import RewardsCard from "@/components/RewardsCard";

type Status = "idle" | "waiting" | "ready" | "done";
type Result = {
  score: number;
  total: number;
  won: boolean;
  reactionMs: number | null;
  payout: number;
};

export default function ReactionRushPage() {
  const [stake, setStake] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [readyAt, setReadyAt] = useState(0);
  const [delayMs, setDelayMs] = useState(0);
  const [targetMs, setTargetMs] = useState(450);
  const [result, setResult] = useState<Result | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const playing = status === "waiting" || status === "ready";

  async function startGame() {
    setLoading(true);
    setMessage("");

    const { data: auth } = await supabase.auth.getSession();
    const token = auth.session?.access_token;

    const res = await fetch("/api/skill-games/reaction-tap/secure-start", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ stake: Number(stake) }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Could not start game.");
      setLoading(false);
      return;
    }

    setSessionId(data.sessionId);
    setDelayMs(Number(data.delayMs));
    setTargetMs(Number(data.targetMs || 450));
    setResult(null);
    setStatus("waiting");
    setMessage("Wait for green...");
    setLoading(false);

    window.setTimeout(() => {
      setReadyAt(Date.now());
      setStatus("ready");
      setMessage("TAP NOW!");
    }, Number(data.delayMs));
  }

  async function finishGame(reactionMs: number | null, tooEarly: boolean) {
    if (loading || result) return;
    setLoading(true);

    const { data: auth } = await supabase.auth.getSession();
    const token = auth.session?.access_token;

    const res = await fetch("/api/skill-games/reaction-tap/secure-finish", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ sessionId, reactionMs, tooEarly }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Could not finish game.");
      setLoading(false);
      return;
    }

    setResult(data);
    setStatus("done");
    setLoading(false);
  }

  function tap() {
    if (status === "waiting") {
      void finishGame(null, true);
      return;
    }

    if (status === "ready") {
      const reaction = Date.now() - readyAt;
      void finishGame(reaction, false);
    }
  }

  function resetGame() {
    setStake("");
    setSessionId("");
    setStatus("idle");
    setReadyAt(0);
    setDelayMs(0);
    setResult(null);
    setMessage("");
  }

  useEffect(() => {
    if (!playing) return;

    const warning = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", warning);
    return () => window.removeEventListener("beforeunload", warning);
  }, [playing]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-4 py-6 text-white">
      <div className="w-full max-w-xl rounded-3xl border border-pink-400/20 bg-white/5 p-5 text-center">

        <div className="mb-6">
          <RewardsCard />
        </div>
        <div className="text-5xl">⚡</div>
        <h1 className="mt-3 text-3xl font-black text-pink-400">Reaction Rush</h1>
        <p className="mt-2 text-sm text-white/60">
          Wait for green, then tap as fast as possible. Beat {targetMs}ms to win.
        </p>

        {message && status === "idle" && (
          <div className="mt-4 rounded-xl bg-red-500/10 p-3 text-red-300">{message}</div>
        )}

        {status === "idle" && !result && (
          <div className="mt-6">
            <div className="mb-5 rounded-2xl border border-white/10 bg-white/5 p-4 text-left">
              <p className="font-black text-white">
                📋 How to Play
              </p>

              <p className="mt-2 text-sm leading-6 text-white/70">
                Wait for the signal, then tap as quickly as you can. Do not tap too early. React within the required time to win.
              </p>
            </div>

            <div className="mb-5 rounded-2xl border border-pink-500/20 bg-pink-500/10 p-4 text-left">
              <p className="font-black text-pink-400">
                🏆 Prize Information
              </p>

              <p className="mt-2 text-sm leading-6 text-white/70">
                A minimum entry fee of GH₵7 is required to play. You may enter
                GH₵7 or any higher amount. Complete the challenge successfully
                to win a prize equal to 2x your entry fee.
              </p>
            </div>

            <input
              type="number"
              min="7"
                            value={stake}
              onChange={(e) => setStake(e.target.value)}
              placeholder="Enter entry fee GH₵7 or above"
              className="w-full rounded-xl border border-white/10 bg-black p-4 text-center text-xl font-bold"
            />

            <button
              onClick={() => void startGame()}
              disabled={loading || !stake || Number(stake) < 7}
              className="mt-5 w-full rounded-xl bg-pink-400 py-4 font-black text-black disabled:opacity-40"
            >
              {loading ? "Starting..." : "Play Now"}
            </button>
          </div>
        )}

        {playing && (
          <button
            onClick={tap}
            disabled={loading}
            className={`mt-8 flex h-72 w-full items-center justify-center rounded-3xl text-4xl font-black transition ${
              status === "ready"
                ? "bg-pink-500 text-black"
                : "bg-red-500/20 text-red-300"
            }`}
          >
            {loading ? "Checking..." : message}
          </button>
        )}

        {result && (
          <div className="mt-6">
            <div className={result.won ? "rounded-2xl bg-pink-500/10 p-6 text-green-300" : "rounded-2xl bg-white/5 p-6 text-white/70"}>
              <div className="text-5xl">{result.won ? "🏆" : "⚡"}</div>
              <h2 className="mt-3 text-2xl font-black">
                {result.won ? "Lightning Fast!" : "Reaction Complete"}
              </h2>

              {result.reactionMs !== null && (
                <p className="mt-3">Reaction Time: <b>{result.reactionMs}ms</b></p>
              )}

              {result.won ? (
                <p className="mt-3 font-black">You won GH₵{Number(result.payout).toFixed(2)}</p>
              ) : (
                <p className="mt-3">Too early or not fast enough. Try again.</p>
              )}
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button onClick={resetGame} className="rounded-xl bg-pink-400 py-3 font-black text-black">
                Play Again
              </button>
              <Link href="/skill-games" className="rounded-xl border border-white/10 bg-white/5 py-3 font-bold">
                All Games
              </Link>
            </div>
          </div>
        )}

        <p className="mt-5 text-xs text-white/30">
          Secure mode — your entry fee is handled through your wallet.
        </p>
      </div>
    </main>
  );
}

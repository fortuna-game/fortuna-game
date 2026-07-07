"use client";

import { useState } from "react";
import Link from "next/link";

export default function ReactionTapPreview() {
  const [stake, setStake] = useState("");
  const [status, setStatus] = useState<"idle" | "waiting" | "ready" | "done">("idle");
  const [startTime, setStartTime] = useState(0);
  const [reaction, setReaction] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  const payout = Number(stake || 0) * 2;
  const won = reaction !== null && reaction <= 450;

  function startGame() {
    if (!stake || Number(stake) <= 0) return;

    setStatus("waiting");
    setReaction(null);
    setMessage("Wait for green...");

    const delay = 1500 + Math.random() * 2500;

    setTimeout(() => {
      setStatus("ready");
      setStartTime(Date.now());
      setMessage("TAP NOW!");
    }, delay);
  }

  function tap() {
    if (status === "waiting") {
      setStatus("done");
      setMessage("Too early! Wait for green next time.");
      setReaction(null);
      return;
    }

    if (status === "ready") {
      const time = Date.now() - startTime;
      setReaction(time);
      setStatus("done");
      setMessage(time <= 450 ? "🏆 Congratulations! You won." : "Good attempt. You were not fast enough.");
    }
  }

  function playAgain() {
    setStake("");
    setStatus("idle");
    setReaction(null);
    setMessage("");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-4 py-6 text-white">
      <div className="w-full max-w-xl rounded-3xl border border-green-400/20 bg-white/5 p-6 text-center">
        <div className="text-5xl">⚡</div>
        <h1 className="mt-3 text-3xl font-black text-green-400">Reaction Tap</h1>
        <p className="mt-2 text-sm text-white/60">Tap when the screen turns green. Beat 450ms to win.</p>

        {status === "idle" && (
          <div className="mt-6">
            <input
              type="number"
              min="1"
              value={stake}
              onChange={(e) => setStake(e.target.value)}
              placeholder="Enter amount"
              className="w-full rounded-xl border border-white/10 bg-black p-4 text-center text-xl font-bold outline-none focus:border-green-400"
            />

            {Number(stake) > 0 && (
              <div className="mt-4 rounded-xl bg-green-500/10 p-3 text-green-300">
                Win this game and receive GH₵{payout.toFixed(2)} total payout.
              </div>
            )}

            <button
              onClick={startGame}
              disabled={!stake || Number(stake) <= 0}
              className="mt-5 w-full rounded-xl bg-green-400 py-4 font-black text-black disabled:opacity-40"
            >
              Start Reaction Tap
            </button>
          </div>
        )}

        {(status === "waiting" || status === "ready") && (
          <button
            onClick={tap}
            className={`mt-8 flex h-64 w-full items-center justify-center rounded-3xl text-4xl font-black ${
              status === "ready" ? "bg-green-500 text-black" : "bg-red-500/20 text-red-300"
            }`}
          >
            {message}
          </button>
        )}

        {status === "done" && (
          <div className="mt-6">
            <div className={won ? "rounded-2xl border border-green-400/30 bg-green-500/10 p-6" : "rounded-2xl border border-white/10 bg-white/5 p-6"}>
              <h2 className={won ? "text-3xl font-black text-green-400" : "text-2xl font-black"}>
                {message}
              </h2>

              {reaction !== null && (
                <p className="mt-3 text-xl">
                  Reaction Time: <span className="font-black">{reaction}ms</span>
                </p>
              )}

              {won && (
                <p className="mt-3 text-xl font-black text-green-300">
                  You won GH₵{payout.toFixed(2)}
                </p>
              )}
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button onClick={playAgain} className="rounded-xl bg-green-400 py-3 font-black text-black">
                Play Again
              </button>

              <Link href="/skill-games" className="rounded-xl border border-white/10 bg-white/5 py-3 font-bold">
                Skill Games
              </Link>
            </div>
          </div>
        )}

        <p className="mt-5 text-xs text-white/30">Preview Mode — wallet balance is not affected.</p>
      </div>
    </main>
  );
}

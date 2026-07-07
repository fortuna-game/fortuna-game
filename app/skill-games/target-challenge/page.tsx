"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Result = {
  score: number;
  total: number;
  won: boolean;
  targetNumber: number;
  landedNumber: number;
  payout: number;
};

export default function ArrowTargetPage() {
  const [stake, setStake] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [started, setStarted] = useState(false);
  const [targetNumber, setTargetNumber] = useState<number | null>(null);
  const [aim, setAim] = useState(50);
  const [direction, setDirection] = useState(1);
  const [zones, setZones] = useState([1, 2, 3, 4, 5]);
  const [timeLeft, setTimeLeft] = useState(45);
  const [result, setResult] = useState<Result | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const playing = started && !result;

  async function startGame() {
    setLoading(true);
    setMessage("");

    const { data: auth } = await supabase.auth.getSession();
    const token = auth.session?.access_token;

    const res = await fetch("/api/skill-games/target-challenge/secure-start", {
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
    setTargetNumber(data.challenge.targetNumber);
    setZones(data.challenge.zones);
    setTimeLeft(data.challenge.timeLimit || 45);
    setAim(50);
    setDirection(1);
    setResult(null);
    setStarted(true);
    setLoading(false);
  }

  async function shoot() {
    if (loading || result) return;
    setLoading(true);

    const shot = aim;

    const { data: auth } = await supabase.auth.getSession();
    const token = auth.session?.access_token;

    const res = await fetch("/api/skill-games/target-challenge/secure-finish", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ sessionId, shot }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Could not finish game.");
      setLoading(false);
      return;
    }

    setResult(data);
    setLoading(false);
  }

  function resetGame() {
    setStake("");
    setSessionId("");
    setStarted(false);
    setTargetNumber(null);
    setAim(50);
    setDirection(1);
    setZones([1, 2, 3, 4, 5]);
    setResult(null);
    setMessage("");
    setTimeLeft(45);
  }

  useEffect(() => {
    if (!playing) return;

    const timer = window.setInterval(() => {
      setAim((current) => {
        let next = current + direction * 8;

        if (next >= 100) {
          setDirection(-1);
          next = 100;
        }

        if (next <= 0) {
          setDirection(1);
          next = 0;
        }

        return next;
      });
    }, 30);

    return () => window.clearInterval(timer);
  }, [playing, direction]);

  useEffect(() => {
    if (!playing || loading) return;

    if (timeLeft <= 0) {
      void shoot();
      return;
    }

    const timer = window.setTimeout(() => setTimeLeft((v) => v - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [playing, loading, timeLeft]);

  useEffect(() => {
    if (!playing) return;

    const zoneTimer = window.setInterval(() => {
      setZones((current) => [...current].sort(() => Math.random() - 0.5));
    }, 900);

    return () => window.clearInterval(zoneTimer);
  }, [playing]);

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
      <div className="w-full max-w-xl rounded-3xl border border-purple-400/20 bg-white/5 p-5 text-center">
        <div className="text-5xl">🏹</div>
        <h1 className="mt-3 text-3xl font-black text-purple-400">Arrow Target</h1>
        <p className="mt-2 text-sm text-white/60">Hit the moving arrow on the target number.</p>

        {message && <div className="mt-4 rounded-xl bg-red-500/10 p-3 text-red-300">{message}</div>}

        {!started && !result && (
          <div className="mt-6">
            <input
              type="number"
              min="1"
              max="50"
              value={stake}
              onChange={(e) => setStake(e.target.value)}
              placeholder="Enter stake amount"
              className="w-full rounded-xl border border-white/10 bg-black p-4 text-center text-xl font-bold"
            />

            <button
              onClick={() => void startGame()}
              disabled={loading || !stake || Number(stake) < 1}
              className="mt-5 w-full rounded-xl bg-purple-400 py-4 font-black text-black disabled:opacity-40"
            >
              {loading ? "Starting..." : "Start Arrow Target"}
            </button>
          </div>
        )}

        {playing && (
          <div className="mt-6">
            <div className="flex justify-between text-sm text-white/60">
              <span>Target: {targetNumber}</span>
              <span className={timeLeft <= 10 ? "text-red-400" : "text-purple-400"}>⏱ {timeLeft}s</span>
            </div>

            <div className="mt-4 rounded-2xl border border-purple-400/20 bg-purple-500/10 p-4">
              <p className="text-sm text-white/60">Hit this number</p>
              <div className="mt-1 text-5xl font-black text-purple-300">{targetNumber}</div>
            </div>

            <div className="relative mt-6 h-44 rounded-3xl border border-purple-400/20 bg-gradient-to-b from-purple-950/40 to-black p-3">
              <div
                className="absolute top-2 z-20 -translate-x-1/2 text-5xl drop-shadow-lg"
                style={{ left: `${aim}%` }}
              >
                🏹
              </div>

              <div
                className="absolute bottom-4 top-14 z-10 w-1 -translate-x-1/2 rounded-full bg-purple-300 shadow-lg shadow-purple-400/70"
                style={{ left: `${aim}%` }}
              />

              <div className="absolute bottom-4 left-3 right-3 grid h-24 grid-cols-5 overflow-hidden rounded-2xl border border-white/10">
                {zones.map((zone) => (
                  <div
                    key={zone}
                    className={`flex items-center justify-center border-r border-white/10 text-4xl font-black ${
                      zone === targetNumber
                        ? "bg-green-500/20 text-green-300"
                        : "bg-black text-white"
                    }`}
                  >
                    {zone}
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => void shoot()}
              disabled={loading}
              className="mt-5 w-full rounded-xl bg-purple-400 py-4 font-black text-black disabled:opacity-40"
            >
              {loading ? "Finishing..." : "Shoot"}
            </button>
          </div>
        )}

        {result && (
          <div className="mt-6">
            <div className={result.won ? "rounded-2xl bg-green-500/10 p-6 text-green-300" : "rounded-2xl bg-white/5 p-6 text-white/70"}>
              <div className="text-5xl">{result.won ? "🏆" : "🏹"}</div>
              <h2 className="mt-3 text-2xl font-black">{result.won ? "Perfect Shot!" : "Missed Target"}</h2>
              <p className="mt-3">Target: {result.targetNumber} | Landed: {result.landedNumber}</p>
              {result.won && <p className="mt-3 font-black">You won GH₵{Number(result.payout).toFixed(2)}</p>}
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button onClick={resetGame} className="rounded-xl bg-purple-400 py-3 font-black text-black">
                Play Again
              </button>
              <Link href="/skill-games" className="rounded-xl border border-white/10 bg-white/5 py-3 font-bold">
                All Games
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

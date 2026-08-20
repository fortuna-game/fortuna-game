"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import RewardsCard from "@/components/RewardsCard";

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
  const [timeLeft, setTimeLeft] = useState(60);
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
    setZones([1, 2, 3, 4, 5, 6, 7]);
    setResult(null);
    setMessage("");
    setTimeLeft(60);
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
    <main className="flex min-h-screen items-center justify-center bg-[#071A33] px-4 py-6 text-white">
      <div className="w-full max-w-xl rounded-3xl border border-blue-400/20 bg-[#0B2545]/70 p-5 text-center">

        <div className="mb-6">
          <RewardsCard />
        </div>
        <div className="text-5xl">🏹</div>
        <h1 className="mt-3 text-3xl font-black text-blue-400">Arrow Target</h1>
        <p className="mt-2 text-sm text-[#9AAAC1]">Hit the moving arrow on the target number.</p>

        {message && <div className="mt-4 rounded-xl bg-red-500/10 p-3 text-red-300">{message}</div>}

        {!started && !result && (
          <div className="mt-6">
            <div className="mb-5 rounded-2xl border border-[#38BDF8]/15 bg-[#0B2545]/70 p-4 text-left">
              <p className="font-black text-white">
                📋 How to Play
              </p>

              <p className="mt-2 text-sm leading-6 text-[#B4C0D1]">
                Aim carefully and take your shot. Land on the target number shown to win.
              </p>
            </div>

            <div className="mb-5 rounded-2xl border border-[#2A5688] bg-[#3F82DD]/10 p-4 text-left">
              <p className="font-black text-[#66A7FF]">
                🏆 Prize Information
              </p>

              <p className="mt-2 text-sm leading-6 text-[#B4C0D1]">
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
              className="w-full rounded-xl border border-[#38BDF8]/15 bg-[#071A33] p-4 text-center text-xl font-bold"
            />

            {Number(stake) > 0 && (
              <div className="rounded-xl border border-green-400/20 bg-green-500/10 p-3 text-center font-black text-green-300">
                Entry Fee GH₵{Number(stake).toFixed(2)} → Possible Win GH₵{(
                  Number(stake) * 2
                ).toFixed(2)}
              </div>
            )}

            <button
              onClick={() => void startGame()}
              disabled={loading || !stake || Number(stake) < 7}
              className="mt-5 w-full rounded-xl bg-blue-400 py-4 font-black text-black disabled:opacity-40"
            >
              {loading ? "Starting..." : "Start Arrow Target"}
            </button>
          </div>
        )}

        {playing && (
          <div className="mt-6">
            <div className="flex justify-between text-sm text-[#9AAAC1]">
              <span>Target: {targetNumber}</span>
              <span className={timeLeft <= 10 ? "text-red-400" : "text-blue-400"}>⏱ {timeLeft}s</span>
            </div>

            <div className="mt-4 rounded-2xl border border-blue-400/20 bg-blue-500/10 p-4">
              <p className="text-sm text-[#9AAAC1]">Hit this number</p>
              <div className="mt-1 text-5xl font-black text-blue-300">{targetNumber}</div>
            </div>

            <div className="relative mt-6 h-44 rounded-3xl border border-blue-400/20 bg-gradient-to-b from-purple-950/40 to-[#071A33] p-3">
              <div
                className="absolute top-2 z-20 -translate-x-1/2 text-5xl drop-shadow-lg"
                style={{ left: `${aim}%` }}
              >
                🏹
              </div>

              <div
                className="absolute bottom-4 top-14 z-10 w-1 -translate-x-1/2 rounded-full bg-blue-300 shadow-lg shadow-purple-400/70"
                style={{ left: `${aim}%` }}
              />

              <div className="absolute bottom-4 left-3 right-3 grid h-24 grid-cols-7 overflow-hidden rounded-2xl border border-[#38BDF8]/15">
                {zones.map((zone) => (
                  <div
                    key={zone}
                    className={`flex items-center justify-center border-r border-[#38BDF8]/15 text-4xl font-black ${
                      zone === targetNumber
                        ? "bg-[#3F82DD]/20 text-green-300"
                        : "bg-[#071A33] text-white"
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
              className="mt-5 w-full rounded-xl bg-blue-400 py-4 font-black text-black disabled:opacity-40"
            >
              {loading ? "Finishing..." : "Shoot"}
            </button>
          </div>
        )}

        {result && (
          <div className="mt-6">
            <div className={result.won ? "rounded-2xl bg-[#3F82DD]/10 p-6 text-green-300" : "rounded-2xl bg-[#0B2545]/70 p-6 text-[#B4C0D1]"}>
              <div className="text-5xl">{result.won ? "🏆" : "🏹"}</div>
              <h2 className="mt-3 text-2xl font-black">{result.won ? "Perfect Shot!" : "Missed Target"}</h2>
              <p className="mt-3">Target: {result.targetNumber} | Landed: {result.landedNumber}</p>
              {result.won && <p className="mt-3 font-black">You won GH₵{Number(result.payout).toFixed(2)}</p>}
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button onClick={resetGame} className="rounded-xl bg-blue-400 py-3 font-black text-black">
                Play Again
              </button>
              <Link href="/skill-games" className="rounded-xl border border-[#38BDF8]/15 bg-[#0B2545]/70 py-3 font-bold">
                All Games
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

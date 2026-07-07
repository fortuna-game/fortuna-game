"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function TargetChallengePreview() {
  const [stake, setStake] = useState("");
  const [started, setStarted] = useState(false);
  const [targetNumber, setTargetNumber] = useState<number | null>(null);
  const [aim, setAim] = useState(50);
  const [direction, setDirection] = useState(1);
  const [shot, setShot] = useState<number | null>(null);

  const payout = Number(stake || 0) * 2;
  const [zones, setZones] = useState([1, 2, 3, 4, 5]);
  const landedZoneIndex =
    shot === null ? -1 : Math.min(4, Math.max(0, Math.floor(shot / 20)));

  const landedNumber =
    landedZoneIndex >= 0 ? zones[landedZoneIndex] : null;

  const won =
    shot !== null &&
    targetNumber !== null &&
    landedNumber === targetNumber;

  useEffect(() => {
    if (!started || shot !== null) return;

    const timer = setInterval(() => {
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

    return () => clearInterval(timer);
  }, [started, direction, shot]);

  useEffect(() => {
    if (!started || shot !== null) return;

    const zoneTimer = setInterval(() => {
      setZones((current) => [...current].sort(() => Math.random() - 0.5));
    }, 900);

    return () => clearInterval(zoneTimer);
  }, [started, shot]);

  function startGame() {
    if (!stake || Number(stake) <= 0 || !targetNumber) return;
    setStarted(true);
    setShot(null);
    setAim(50);
    setZones([1, 2, 3, 4, 5]);
    setDirection(1);
    setZones([1, 2, 3, 4, 5].sort(() => Math.random() - 0.5));
  }

  function playAgain() {
    setStake("");
    setStarted(false);
    setTargetNumber(null);
    setShot(null);
    setAim(50);
    setZones([1, 2, 3, 4, 5]);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-4 py-6 text-white">
      <div className="w-full max-w-xl rounded-3xl border border-red-400/20 bg-white/5 p-6 text-center">
        <div className="text-5xl">��</div>

        <h1 className="mt-3 text-3xl font-black text-red-400">Arrow Target</h1>
        <p className="mt-2 text-sm text-white/60">
          Choose a target number. Stop the moving arrow inside that zone to win.
        </p>

        {!started && (
          <div className="mt-6">
            <input
              type="number"
              min="1"
              value={stake}
              onChange={(e) => setStake(e.target.value)}
              placeholder="Enter amount"
              className="w-full rounded-xl border border-white/10 bg-black p-4 text-center text-xl font-bold outline-none"
            />

            <p className="mt-5 text-sm text-white/50">Choose your target number</p>

            <div className="mt-3 grid grid-cols-5 gap-2">
              {zones.map((z) => (
                <button
                  key={z}
                  onClick={() => setTargetNumber(z)}
                  className={`rounded-xl py-4 font-black ${
                    targetNumber === z
                      ? "bg-yellow-400 text-black"
                      : "bg-white/5 text-white"
                  }`}
                >
                  {z}
                </button>
              ))}
            </div>

            {Number(stake) > 0 && targetNumber && (
              <div className="mt-4 rounded-xl bg-green-500/10 p-3 text-green-300">
                Hit zone {targetNumber} and receive GH₵{payout.toFixed(2)} total payout.
              </div>
            )}

            <button
              onClick={startGame}
              disabled={!stake || Number(stake) <= 0 || !targetNumber}
              className="mt-5 w-full rounded-xl bg-red-400 py-4 font-black text-black disabled:opacity-40"
            >
              Start Arrow Target
            </button>
          </div>
        )}

        {started && (
          <div className="mt-6">
            <div className="relative h-32 rounded-2xl border border-white/10 bg-black">
              <div className="grid h-full grid-cols-5">
                {zones.map((z) => (
                  <div
                    key={z}
                    className={`flex items-center justify-center border-r border-white/10 text-2xl font-black ${
                      z === targetNumber ? "bg-yellow-400/20 text-yellow-300" : "text-white/40"
                    }`}
                  >
                    {z}
                  </div>
                ))}
              </div>

              <div
                className="absolute top-0 flex h-full -translate-x-1/2 items-center justify-center text-5xl"
                style={{ left: `${shot ?? aim}%` }}
              >
                🏹
              </div>
            </div>

            {shot === null ? (
              <button
                onClick={() => setShot(aim)}
                className="mt-6 w-full rounded-xl bg-yellow-400 py-4 font-black text-black"
              >
                Shoot Arrow
              </button>
            ) : (
              <div className="mt-6">
                {won ? (
                  <div className="rounded-2xl border border-green-400/30 bg-green-500/10 p-6">
                    <div className="text-5xl">🏆</div>
                    <h2 className="mt-3 text-3xl font-black text-green-400">
                      Congratulations!
                    </h2>
                    <p className="mt-3">You hit zone {targetNumber}.</p>
                    <p className="mt-3 text-xl font-black text-green-300">
                      You won GH₵{payout.toFixed(2)}
                    </p>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                    <h2 className="text-2xl font-black">Missed Target</h2>
                    <p className="mt-3 text-white/60">
                      Your arrow landed on number {landedNumber}. You needed number {targetNumber}.
                    </p>
                    <p className="mt-2 text-white/50">Please try again.</p>
                  </div>
                )}

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <button onClick={playAgain} className="rounded-xl bg-red-400 py-3 font-black text-black">
                    Play Again
                  </button>

                  <Link href="/skill-games" className="rounded-xl border border-white/10 bg-white/5 py-3 font-bold">
                    Skill Games
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        <p className="mt-5 text-xs text-white/30">Preview Mode — wallet balance is not affected.</p>
      </div>
    </main>
  );
}

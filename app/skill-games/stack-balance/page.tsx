"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function StackBalancePreview() {
  const [stake, setStake] = useState("");
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [position, setPosition] = useState(50);
  const [direction, setDirection] = useState(1);
  const [blocks, setBlocks] = useState<number[]>([]);
  const [message, setMessage] = useState("");

  const payout = Number(stake || 0) * 2;
  const won = blocks.length >= 6;

  useEffect(() => {
    if (!started || finished) return;

    const timer = setInterval(() => {
      setPosition((current) => {
        let next = current + direction * 6;

        if (next >= 90) {
          setDirection(-1);
          next = 90;
        }

        if (next <= 10) {
          setDirection(1);
          next = 10;
        }

        return next;
      });
    }, 45);

    return () => clearInterval(timer);
  }, [started, finished, direction]);

  function startGame() {
    if (!stake || Number(stake) <= 0) return;

    setStarted(true);
    setFinished(false);
    setBlocks([]);
    setPosition(50);
    setDirection(1);
    setMessage("");
  }

  function dropBlock() {
    if (finished) return;

    if (blocks.length === 0) {
      setBlocks([position]);
      return;
    }

    const last = blocks[blocks.length - 1];
    const difference = Math.abs(position - last);

    if (difference > 18) {
      setFinished(true);
      setMessage("Stack collapsed. Your block was not balanced.");
      return;
    }

    const nextBlocks = [...blocks, position];
    setBlocks(nextBlocks);

    if (nextBlocks.length >= 6) {
      setFinished(true);
      setMessage("Perfect stack! You completed the challenge.");
    }
  }

  function playAgain() {
    setStake("");
    setStarted(false);
    setFinished(false);
    setBlocks([]);
    setPosition(50);
    setMessage("");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-4 py-6 text-white">
      <div className="w-full max-w-xl rounded-3xl border border-amber-400/20 bg-white/5 p-6 text-center">
        <div className="text-5xl">📦</div>

        <h1 className="mt-3 text-3xl font-black text-amber-400">
          Stack Balance
        </h1>

        <p className="mt-2 text-sm text-white/60">
          Drop moving blocks carefully. Build a stack of 6 blocks without collapsing.
        </p>

        {!started && (
          <div className="mt-6">
            <input
              type="number"
              min="1"
              value={stake}
              onChange={(e) => setStake(e.target.value)}
              placeholder="Enter amount"
              className="w-full rounded-xl border border-white/10 bg-black p-4 text-center text-xl font-bold outline-none focus:border-amber-400"
            />

            {Number(stake) > 0 && (
              <div className="mt-4 rounded-xl bg-green-500/10 p-3 text-green-300">
                Win and receive GH₵{payout.toFixed(2)} total payout.
              </div>
            )}

            <button
              onClick={startGame}
              disabled={!stake || Number(stake) <= 0}
              className="mt-5 w-full rounded-xl bg-amber-400 py-4 font-black text-black disabled:opacity-40"
            >
              Start Stack Balance
            </button>
          </div>
        )}

        {started && (
          <div className="mt-6">
            <div className="flex justify-between text-sm text-white/50">
              <span>Blocks: {blocks.length}/6</span>
              <span>Keep it balanced</span>
            </div>

            <div className="relative mt-5 h-80 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-slate-900 to-black">
              <div
                className="absolute top-8 h-10 w-28 -translate-x-1/2 rounded-xl bg-amber-400 shadow-lg"
                style={{ left: `${position}%` }}
              />

              <div className="absolute bottom-5 left-0 right-0 flex flex-col-reverse items-center">
                {blocks.map((block, index) => (
                  <div
                    key={index}
                    className="h-8 w-28 rounded-lg border border-black bg-amber-500"
                    style={{
                      marginLeft: `${block - 50}%`,
                    }}
                  />
                ))}
              </div>
            </div>

            {!finished && (
              <button
                onClick={dropBlock}
                className="mt-5 w-full rounded-xl bg-amber-400 py-4 font-black text-black"
              >
                Drop Block
              </button>
            )}

            {finished && (
              <div className="mt-6">
                {won ? (
                  <div className="rounded-2xl border border-green-400/30 bg-green-500/10 p-6">
                    <div className="text-5xl">🏆</div>
                    <h2 className="mt-3 text-3xl font-black text-green-400">
                      Congratulations!
                    </h2>
                    <p className="mt-3">{message}</p>
                    <p className="mt-3 text-xl font-black text-green-300">
                      You won GH₵{payout.toFixed(2)}
                    </p>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                    <div className="text-5xl">📦</div>
                    <h2 className="mt-3 text-2xl font-black">
                      Stack Collapsed
                    </h2>
                    <p className="mt-3 text-white/60">{message}</p>
                    <p className="mt-2 text-white/50">
                      Balance your timing and try again.
                    </p>
                  </div>
                )}

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <button
                    onClick={playAgain}
                    className="rounded-xl bg-amber-400 py-3 font-black text-black"
                  >
                    Play Again
                  </button>

                  <Link
                    href="/skill-games"
                    className="rounded-xl border border-white/10 bg-white/5 py-3 font-bold"
                  >
                    Skill Games
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        <p className="mt-5 text-xs text-white/30">
          Preview Mode — wallet balance is not affected.
        </p>
      </div>
    </main>
  );
}

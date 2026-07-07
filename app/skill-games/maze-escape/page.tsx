"use client";

import { useState } from "react";
import Link from "next/link";

const size = 5;

const walls = new Set([
  "0-1", "1-1", "3-1",
  "1-3", "2-3", "3-3",
  "3-2"
]);

export default function MazeEscapePreview() {
  const [stake, setStake] = useState("");
  const [started, setStarted] = useState(false);
  const [player, setPlayer] = useState({ x: 0, y: 0 });
  const [moves, setMoves] = useState(0);
  const [finished, setFinished] = useState(false);

  const payout = Number(stake || 0) * 2;
  const won = finished && player.x === 4 && player.y === 4 && moves <= 12;

  function startGame() {
    if (!stake || Number(stake) <= 0) return;
    setStarted(true);
    setPlayer({ x: 0, y: 0 });
    setMoves(0);
    setFinished(false);
  }

  function move(dx: number, dy: number) {
    if (finished) return;

    const next = { x: player.x + dx, y: player.y + dy };

    if (
      next.x < 0 ||
      next.y < 0 ||
      next.x >= size ||
      next.y >= size ||
      walls.has(`${next.x}-${next.y}`)
    ) {
      return;
    }

    setPlayer(next);
    setMoves((m) => m + 1);

    if (next.x === 4 && next.y === 4) {
      setFinished(true);
    }
  }

  function playAgain() {
    setStake("");
    setStarted(false);
    setPlayer({ x: 0, y: 0 });
    setMoves(0);
    setFinished(false);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-4 py-6 text-white">
      <div className="w-full max-w-xl rounded-3xl border border-lime-400/20 bg-white/5 p-6 text-center">
        <div className="text-5xl">🧭</div>

        <h1 className="mt-3 text-3xl font-black text-lime-400">
          Maze Escape
        </h1>

        <p className="mt-2 text-sm text-white/60">
          Reach the exit in 12 moves or less to win.
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

            {Number(stake) > 0 && (
              <div className="mt-4 rounded-xl bg-green-500/10 p-3 text-green-300">
                Win and receive GH₵{payout.toFixed(2)} total payout.
              </div>
            )}

            <button
              onClick={startGame}
              disabled={!stake || Number(stake) <= 0}
              className="mt-5 w-full rounded-xl bg-lime-400 py-4 font-black text-black disabled:opacity-40"
            >
              Start Maze Escape
            </button>
          </div>
        )}

        {started && !finished && (
          <div className="mt-6">
            <div className="flex justify-between text-sm text-white/50">
              <span>Moves: {moves}/12</span>
              <span>Goal: Exit 🏁</span>
            </div>

            <div className="mx-auto mt-5 grid max-w-sm grid-cols-5 gap-2">
              {Array.from({ length: 25 }, (_, i) => {
                const x = i % size;
                const y = Math.floor(i / size);
                const isPlayer = player.x === x && player.y === y;
                const isWall = walls.has(`${x}-${y}`);
                const isExit = x === 4 && y === 4;

                return (
                  <div
                    key={i}
                    className={`flex aspect-square items-center justify-center rounded-xl border text-2xl font-black ${
                      isWall
                        ? "border-white/10 bg-white/20"
                        : isExit
                        ? "border-green-400 bg-green-500/20"
                        : "border-white/10 bg-black"
                    }`}
                  >
                    {isPlayer ? "🧍" : isExit ? "🏁" : isWall ? "■" : ""}
                  </div>
                );
              })}
            </div>

            <div className="mx-auto mt-5 grid max-w-xs grid-cols-3 gap-2">
              <div />
              <button onClick={() => move(0, -1)} className="rounded-xl bg-lime-400 py-3 font-black text-black">↑</button>
              <div />
              <button onClick={() => move(-1, 0)} className="rounded-xl bg-lime-400 py-3 font-black text-black">←</button>
              <button onClick={() => move(0, 1)} className="rounded-xl bg-lime-400 py-3 font-black text-black">↓</button>
              <button onClick={() => move(1, 0)} className="rounded-xl bg-lime-400 py-3 font-black text-black">→</button>
            </div>

            {moves > 12 && (
              <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-5">
                <h2 className="text-2xl font-black">Out of Moves</h2>
                <p className="mt-2 text-white/60">You used more than 12 moves. Please try again.</p>
                <button onClick={playAgain} className="mt-4 rounded-xl bg-lime-400 px-6 py-3 font-black text-black">
                  Play Again
                </button>
              </div>
            )}
          </div>
        )}

        {finished && (
          <div className="mt-6">
            {won ? (
              <div className="rounded-2xl border border-green-400/30 bg-green-500/10 p-6">
                <div className="text-5xl">🏆</div>
                <h2 className="mt-3 text-3xl font-black text-green-400">Escaped!</h2>
                <p className="mt-3">You escaped in {moves} moves.</p>
                <p className="mt-3 text-xl font-black text-green-300">You won GH₵{payout.toFixed(2)}</p>
              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <h2 className="text-2xl font-black">Maze Complete</h2>
                <p className="mt-2 text-white/60">You needed 12 moves or less to win.</p>
              </div>
            )}

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button onClick={playAgain} className="rounded-xl bg-lime-400 py-3 font-black text-black">
                Play Again
              </button>
              <Link href="/skill-games" className="rounded-xl border border-white/10 bg-white/5 py-3 font-bold">
                Skill Games
              </Link>
            </div>
          </div>
        )}

        <p className="mt-5 text-xs text-white/30">
          Preview Mode — wallet balance is not affected.
        </p>
      </div>
    </main>
  );
}

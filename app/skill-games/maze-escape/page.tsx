"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import RewardsCard from "@/components/RewardsCard";

type Maze = {
  size: number;
  walls: string[];
  start: { x: number; y: number };
  exit: { x: number; y: number };
  maxMoves: number;
  timeLimit: number;
};

type Result = { score: number; total: number; won: boolean; payout: number };

export default function MazeEscapePage() {
  const [stake, setStake] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [maze, setMaze] = useState<Maze | null>(null);
  const [player, setPlayer] = useState({ x: 0, y: 0 });
  const [moves, setMoves] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(60);
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const playing = Boolean(maze) && !result;

  async function startGame() {
    setLoading(true);
    setMessage("");

    const { data: auth } = await supabase.auth.getSession();
    const token = auth.session?.access_token;

    const res = await fetch("/api/skill-games/maze-escape/secure-start", {
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
    setMaze(data.maze);
    setPlayer(data.maze.start);
    setMoves([]);
    setTimeLeft(data.maze.timeLimit || 45);
    setResult(null);
    setLoading(false);
  }

  async function finishGame(finalMoves: string[]) {
    if (loading || result) return;
    setLoading(true);

    const { data: auth } = await supabase.auth.getSession();
    const token = auth.session?.access_token;

    const res = await fetch("/api/skill-games/maze-escape/secure-finish", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ sessionId, moves: finalMoves }),
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

  function move(direction: string) {
    if (!maze || loading || result) return;

    let nx = player.x;
    let ny = player.y;

    if (direction === "up") ny -= 1;
    if (direction === "down") ny += 1;
    if (direction === "left") nx -= 1;
    if (direction === "right") nx += 1;

    if (
      nx < 0 ||
      ny < 0 ||
      nx >= maze.size ||
      ny >= maze.size ||
      maze.walls.includes(`${nx}-${ny}`)
    ) {
      return;
    }

    const nextMoves = [...moves, direction];
    setMoves(nextMoves);
    setPlayer({ x: nx, y: ny });

    if (nx === maze.exit.x && ny === maze.exit.y) {
      void finishGame(nextMoves);
      return;
    }

    if (nextMoves.length >= maze.maxMoves) {
      void finishGame(nextMoves);
    }
  }

  function resetGame() {
    setStake("");
    setSessionId("");
    setMaze(null);
    setPlayer({ x: 0, y: 0 });
    setMoves([]);
    setResult(null);
    setMessage("");
    setTimeLeft(60);
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

  useEffect(() => {
    if (!playing || loading) return;

    if (timeLeft <= 0) {
      void finishGame(moves);
      return;
    }

    const timer = window.setTimeout(() => setTimeLeft((v) => v - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [playing, loading, timeLeft, moves]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#071A33] px-4 py-6 text-white">
      <div className="w-full max-w-xl rounded-3xl border border-lime-400/20 bg-[#0B2545]/70 p-5 text-center">

        <div className="mb-6">
          <RewardsCard />
        </div>
        <div className="text-5xl">🧭</div>
        <h1 className="mt-3 text-3xl font-black text-lime-400">Maze Escape</h1>
        <p className="mt-2 text-sm text-[#9AAAC1]">Reach the exit before time or moves run out.</p>

        {message && <div className="mt-4 rounded-xl bg-red-500/10 p-3 text-red-300">{message}</div>}

        {!maze && !result && (
          <div className="mt-6">
            <div className="mb-5 rounded-2xl border border-[#38BDF8]/15 bg-[#0B2545]/70 p-4 text-left">
              <p className="font-black text-white">
                📋 How to Play
              </p>

              <p className="mt-2 text-sm leading-6 text-[#B4C0D1]">
                Move through the maze and reach the exit within 14 moves and 60 seconds to win.
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
              className="mt-5 w-full rounded-xl bg-lime-400 py-4 font-black text-black disabled:opacity-40"
            >
              {loading ? "Starting..." : "Start Now"}
            </button>
          </div>
        )}

        {maze && !result && (
          <div className="mt-6">
            <div className="flex justify-between text-sm text-[#9AAAC1]">
              <span>Moves: {moves.length}/{maze.maxMoves}</span>
              <span className={timeLeft <= 10 ? "text-red-400" : "text-lime-400"}>⏱ {timeLeft}s</span>
            </div>

            <div className="mx-auto mt-5 grid max-w-sm grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2">
              {Array.from({ length: maze.size * maze.size }, (_, i) => {
                const x = i % maze.size;
                const y = Math.floor(i / maze.size);
                const isPlayer = player.x === x && player.y === y;
                const isWall = maze.walls.includes(`${x}-${y}`);
                const isExit = maze.exit.x === x && maze.exit.y === y;

                return (
                  <div
                    key={i}
                    className={`flex aspect-square items-center justify-center rounded-xl border text-xl font-black ${
                      isWall
                        ? "border-[#38BDF8]/15 bg-[#163A63]/90"
                        : isExit
                        ? "border-blue-400 bg-[#3F82DD]/20"
                        : "border-[#38BDF8]/15 bg-[#071A33]"
                    }`}
                  >
                    {isPlayer ? "🧍" : isExit ? "🏁" : isWall ? "■" : ""}
                  </div>
                );
              })}
            </div>

            <div className="mx-auto mt-5 grid max-w-xs grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              <div />
              <button onClick={() => move("up")} className="rounded-xl bg-lime-400 py-3 font-black text-black">↑</button>
              <div />
              <button onClick={() => move("left")} className="rounded-xl bg-lime-400 py-3 font-black text-black">←</button>
              <button onClick={() => move("down")} className="rounded-xl bg-lime-400 py-3 font-black text-black">↓</button>
              <button onClick={() => move("right")} className="rounded-xl bg-lime-400 py-3 font-black text-black">→</button>
            </div>
          </div>
        )}

        {result && (
          <div className="mt-6">
            <div className={result.won ? "rounded-2xl bg-[#3F82DD]/10 p-6 text-green-300" : "rounded-2xl bg-[#0B2545]/70 p-6 text-[#B4C0D1]"}>
              <div className="text-5xl">{result.won ? "🏆" : "🧭"}</div>
              <h2 className="mt-3 text-2xl font-black">
                {result.won ? "You Escaped!" : "Maze Failed"}
              </h2>
              {result.won && <p className="mt-3 font-black">You won GH₵{Number(result.payout).toFixed(2)}</p>}
              {!result.won && <p className="mt-3">You did not reach the exit in time.</p>}
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button onClick={resetGame} className="rounded-xl bg-lime-400 py-3 font-black text-black">
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

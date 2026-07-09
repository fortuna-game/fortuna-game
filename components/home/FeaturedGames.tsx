"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const games = [
  { icon: "⚡", name: "Reaction Tap", href: "/skill-games/reaction-tap" },
  { icon: "🧠", name: "Memory Match", href: "/skill-games/memory-match" },
  { icon: "🔢", name: "Math Rush", href: "/skill-games/math-rush" },
  { icon: "🏹", name: "Target Challenge", href: "/skill-games/target-challenge" },
  { icon: "🧩", name: "Stack Balance", href: "/skill-games/stack-balance" },
  { icon: "🏃", name: "Maze Escape", href: "/skill-games/maze-escape" },
  { icon: "❓", name: "Trivia Challenge", href: "/skill-games/trivia" },
  { icon: "🎮", name: "All Skill Games", href: "/skill-games" },
];

export default function FeaturedGames() {
  const router = useRouter();

  async function startGame(href: string) {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      router.push("/login");
      return;
    }

    router.push(href);
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <h2 className="text-center text-5xl font-black text-white">
        Featured Skill Games
      </h2>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {games.map((game) => (
          <div
            key={game.name}
            className="rounded-3xl border border-pink-500/30 bg-white/5 p-6"
          >
            <div className="text-5xl">{game.icon}</div>

            <h3 className="mt-5 text-2xl font-black text-white">
              {game.name}
            </h3>

            <button
              type="button"
              onClick={() => startGame(game.href)}
              className="mt-6 block w-full rounded-xl bg-pink-500 py-4 text-center font-black text-black hover:bg-pink-400"
            >
              Start Now
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

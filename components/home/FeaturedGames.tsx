"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const games = [
  {
    icon: "💰",
    name: "Lucky Draw",
    description: "Get in. Get lucky. Win exciting prizes.",
    href: "/skill-games/lucky-draw",
    featured: true,
  },
  {
    icon: "🎁",
    name: "Prize Vault",
    description: "Pick a vault and unlock a surprise prize.",
    href: "/skill-games/prize-vault",
    featured: true,
  },
  {
    icon: "🧠",
    name: "Trivia Sprint",
    description: "Test your knowledge.",
    href: "/skill-games/trivia",
  },
  {
    icon: "➗",
    name: "Math Rush",
    description: "Fast calculations.",
    href: "/skill-games/math-rush",
  },
  {
    icon: "🔤",
    name: "Word Puzzle",
    description: "Test your word mastery.",
    href: "/skill-games/word-puzzle",
  },
  {
    icon: "🧩",
    name: "Memory Match",
    description: "Challenge your memory.",
    href: "/skill-games/memory-match",
  },
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
      <div className="text-center">
        <p className="text-xs font-black uppercase tracking-[0.3em] text-[#FFD54A]">
          Games & Challenges
        </p>

        <h2 className="mt-3 text-4xl font-black text-white sm:text-5xl">
          Play. Challenge yourself. Win.
        </h2>

        <p className="mx-auto mt-4 max-w-2xl text-[#9AAAC1]">
          Enter exciting draws, unlock prizes, and test your skills.
        </p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {games.map((game) => (
          <div
            key={game.name}
            className={`rounded-3xl border p-6 shadow-xl ${
              game.featured
                ? "border-[#F5B700]/60 bg-[#0B2545]"
                : "border-[#32659D] bg-[#0B2545]/70"
            }`}
          >
            <div className="text-5xl">{game.icon}</div>

            <h3 className="mt-5 text-2xl font-black text-white">
              {game.name}
            </h3>

            <p className="mt-2 text-sm text-[#9AAAC1]">
              {game.description}
            </p>

            <button
              type="button"
              onClick={() => startGame(game.href)}
              className={`mt-6 block w-full rounded-xl py-4 text-center font-black text-black transition ${
                game.featured
                  ? "bg-[#FFD54A] hover:bg-yellow-300"
                  : "bg-[#3F82DD] hover:bg-blue-400"
              }`}
            >
              Play Now
            </button>
          </div>
        ))}
      </div>

      <div className="mt-10 text-center">
        <button
          type="button"
          onClick={() => router.push("/skill-games")}
          className="rounded-xl border border-[#4D94F5] px-8 py-4 font-black text-white transition hover:bg-[#4D94F5]"
        >
          View All Games →
        </button>
      </div>
    </section>
  );
}

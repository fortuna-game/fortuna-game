"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const featuredGames = [
  {
    slug: "lucky-draw",
    icon: "💰",
    name: "Lucky Draw",
    tagline: "Get in. Get lucky. Win big prizes.",
    description:
      "Buy a ticket, enter the draw and compete with other players for exciting prizes.",
    button: "Play Now",
    badge: "🔥 POPULAR",
    featured: true,
  },
  {
    slug: "prize-vault",
    icon: "��",
    name: "Prize Vault",
    tagline: "Pick your vault. Unlock a surprise prize.",
    description:
      "Choose a numbered box. Some boxes contain cash, phones, wigs, airtime, lunch and more.",
    button: "Play Now",
    badge: "🔥 HOT",
    featured: true,
  },
];

const games = [
  ["trivia", "🧠", "Trivia Sprint", "Knowledge challenge"],
  ["math-rush", "➗", "Math Rush", "Fast calculations"],
  ["word-puzzle", "🔤", "Word Puzzle", "Word mastery"],
  ["memory-match", "🧩", "Memory Match", "Memory challenge"],
  ["target-challenge", "🏹", "Arrow Target", "Accuracy challenge"],
  ["pattern-sequence", "🧬", "Pattern Sequence", "Logic patterns"],
  ["speed-sort", "⚡", "Speed Sort", "Fast decisions"],
  ["code-breaker", "🔐", "Code Breaker", "Crack the code"],
  ["maze-escape", "🧭", "Maze Escape", "Find the exit"],
  ["color-clash", "🎨", "Color Clash", "Focus test"],
  ["quick-count", "👁️", "Quick Count", "Sharp eyes"],
  ["stack-balance", "📦", "Stack Balance", "Timing skill"],
  ["number-hunt", "🔢", "Number Hunt", "Find numbers"],
  ["logic-lock", "🔒", "Logic Lock", "Reasoning test"],
];

export default function FeaturedGames() {
  const router = useRouter();

  async function openGame(slug: string) {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      router.push("/login");
      return;
    }

    router.push(`/skill-games/${slug}`);
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

      <div className="mt-12 grid gap-5 lg:grid-cols-2">
        {featuredGames.map((game) => (
          <button
            key={game.slug}
            type="button"
            onClick={() => void openGame(game.slug)}
            className="group relative overflow-hidden rounded-3xl border border-[#F5B700]/50 bg-gradient-to-br from-white/[0.08] via-white/[0.04] to-[#071A33] p-6 text-left shadow-2xl transition duration-300 hover:-translate-y-1"
          >
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#F5B700]/10 blur-3xl" />

            <div className="relative">
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-24 w-24 items-center justify-center rounded-3xl border border-[#32659D] bg-[#071A33]/70 text-6xl shadow-xl transition duration-300 group-hover:scale-110">
                  {game.icon}
                </div>

                <span className="rounded-full bg-[#FFD54A] px-3 py-1.5 text-xs font-black text-black">
                  {game.badge}
                </span>
              </div>

              <h3 className="mt-6 text-3xl font-black text-white">
                {game.name}
              </h3>

              <p className="mt-2 text-base font-black text-blue-300">
                {game.tagline}
              </p>

              <div className="mt-4 h-px w-24 bg-[#163A63]/90" />

              <p className="mt-4 text-sm leading-6 text-white/65 sm:text-base">
                {game.description}
              </p>

              <div className="mt-6 flex items-center justify-between rounded-2xl bg-[#FFD54A] px-5 py-4 font-black text-black transition group-hover:bg-yellow-300">
                <span>{game.button}</span>
                <span className="text-xl transition group-hover:translate-x-2">
                  →
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {games.map(([slug, icon, name, tag], index) => (
          <button
            key={slug}
            type="button"
            onClick={() => void openGame(slug)}
            className="group relative overflow-hidden rounded-3xl border border-[#38BDF8]/15 bg-gradient-to-br from-white/10 via-white/5 to-[#071A33] p-5 text-left shadow-xl transition duration-300 hover:-translate-y-1 hover:border-[#4D94F5]/60"
          >
            <div className="absolute right-[-30px] top-[-30px] h-28 w-28 rounded-full bg-[#3F82DD]/10 blur-2xl transition group-hover:bg-[#3F82DD]/25" />

            <div className="relative flex items-start justify-between gap-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#2A5688] bg-[#071A33]/60 text-4xl shadow-lg transition group-hover:scale-110">
                {icon}
              </div>

              <span className="rounded-full border border-[#38BDF8]/15 bg-[#0B2545]/70 px-3 py-1 text-xs text-[#8295B0]">
                #{index + 1}
              </span>
            </div>

            <h3 className="relative mt-5 text-2xl font-black text-white">
              {name}
            </h3>

            <p className="relative mt-2 text-sm text-[#66A7FF]">{tag}</p>

            <div className="relative mt-5 flex items-center justify-between rounded-2xl bg-[#3F82DD] px-4 py-3 font-black text-black">
              <span>Open Game</span>
              <span className="transition group-hover:translate-x-1">→</span>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-10 text-center">
        <button
          type="button"
          onClick={() => router.push("/skill-games")}
          className="rounded-xl border border-blue-500 px-8 py-4 font-black text-white transition hover:bg-[#4D94F5]"
        >
          View All Games →
        </button>
      </div>
    </section>
  );
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import RewardsCard from "@/components/RewardsCard";

const featuredGames = [
  {
    slug: "lucky-draw",
    icon: "💰",
    name: "Lucky Draw",
    tagline: "Get in. Get lucky. Win big prizes.",
    description:
      "Buy a ticket, enter the draw and compete with other players for exciting prizes.",
    button: "Enter Draw Now",
    badge: "🔥 POPULAR",
    accent: "border-[#F5B700]/60",
    glow: "bg-[#F5B700]/10",
  },
  {
    slug: "prize-vault",
    icon: "🎁",
    name: "Prize Vault",
    tagline: "Pick your vault. Unlock a surprise prize.",
    description:
      "Choose a numbered box. Some boxes contain cash, phones, wigs, airtime, lunch and more.",
    button: "Play Now",
    badge: "🔥 HOT",
    accent: "border-blue-500/60",
    glow: "bg-blue-500/10",
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

export default function SkillGamesPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#071A33] px-4 py-8 text-white sm:px-6">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,#facc1530,transparent_35%),radial-gradient(circle_at_bottom_right,#7c3aed30,transparent_35%)]" />

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-8">
          <RewardsCard />
        </div>

        <section className="rounded-[2rem] border border-[#2A5688] bg-[#0B2545]/70 p-6 text-center shadow-2xl backdrop-blur-xl sm:p-10">
          <p className="text-xs font-black uppercase tracking-[0.35em] text-[#4D94F5]">
            Games & Challenges
          </p>

          <h1 className="mt-4 text-4xl font-black leading-tight sm:text-6xl">
            Play. Challenge yourself. Win.
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm text-[#9AAAC1] sm:text-lg">
            Enter exciting draws, unlock prizes, and test your speed, memory,
            logic, accuracy, focus, and problem-solving skills.
          </p>
        </section>

        <section className="mt-10">
          <div className="mb-5">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-[#FFD54A]">
              ◉ Featured Games
            </p>

            <h2 className="mt-2 text-2xl font-black sm:text-3xl">
              Play for exciting prizes
            </h2>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {featuredGames.map((game) => (
              <Link
                key={game.slug}
                href={`/skill-games/${game.slug}`}
                className={`group relative overflow-hidden rounded-3xl border ${game.accent} bg-gradient-to-br from-white/[0.08] via-white/[0.04] to-[#071A33] p-6 shadow-2xl transition duration-300 hover:-translate-y-1`}
              >
                <div
                  className={`absolute -right-16 -top-16 h-48 w-48 rounded-full ${game.glow} blur-3xl`}
                />

                <div className="relative">
                  <div className="flex items-start justify-between gap-4">
                    <div
                      className={`flex h-24 w-24 items-center justify-center rounded-3xl border border-[#32659D] bg-[#071A33]/70 text-6xl shadow-xl ${
                        game.slug === "lucky-draw"
                          ? "animate-bounce"
                          : "transition duration-300 group-hover:scale-110"
                      }`}
                    >
                      {game.icon}
                    </div>

                    <span
                      className={`rounded-full px-3 py-1.5 text-xs font-black ${
                        game.slug === "lucky-draw"
                          ? "bg-[#FFD54A] text-black"
                          : "bg-blue-500 text-white"
                      }`}
                    >
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

                  <p className="mt-4 max-w-xl text-sm leading-6 text-white/65 sm:text-base">
                    {game.description}
                  </p>

                  <div
                    className={`mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl px-5 py-4 font-black text-black transition ${
                      game.slug === "lucky-draw"
                        ? "bg-[#FFD54A] group-hover:bg-yellow-300"
                        : "bg-[#3F82DD] group-hover:bg-blue-400"
                    }`}
                  >
                    <span>{game.button}</span>
                    <span className="text-xl transition group-hover:translate-x-2">
                      →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <div className="mb-5">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-[#4D94F5]">
              🎮 More Games
            </p>

            <h2 className="mt-2 text-2xl font-black sm:text-3xl">
              More Games — Coming Soon
            </h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {games.map(([slug, icon, name, tag], index) => (
              <div
                key={slug}
                className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.06] via-white/[0.03] to-[#071A33] p-5 shadow-xl"
              >
                <div className="absolute right-[-30px] top-[-30px] h-28 w-28 rounded-full bg-white/[0.03] blur-2xl" />

                <div className="relative flex items-start justify-between gap-3">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-[#071A33]/70 text-4xl opacity-70">
                    {icon}
                  </div>

                  <span className="rounded-full border border-yellow-400/20 bg-yellow-400/10 px-3 py-1 text-xs font-black text-yellow-300">
                    🔒 LOCKED
                  </span>
                </div>

                <h3 className="relative mt-5 text-2xl font-black text-white/80">
                  {name}
                </h3>

                <p className="relative mt-2 text-sm text-[#8295B0]">
                  {tag}
                </p>

                <div className="relative mt-5 rounded-2xl border border-yellow-400/15 bg-yellow-400/5 px-4 py-4">
                  <p className="font-black text-yellow-300">
                    🔒 Game Under Development
                  </p>

                  <p className="mt-1 text-xs leading-5 text-white/45">
                    We are improving this game to give you a better
                    experience. Please check back soon.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

import Link from "next/link";
import RewardsCard from "@/components/RewardsCard";

const games = [
  ["trivia", "🧠", "Trivia Sprint", "Knowledge challenge"],
  ["math-rush", "➗", "Math Rush", "Fast calculations"],
  ["word-puzzle", "🔤", "Word Puzzle", "Word mastery"],
  ["memory-match", "🧩", "Memory Match", "Memory challenge"],
  ["lucky-draw", "🎟️", "Lucky Draw", "GH₵20 ticket • Win GH₵500"],
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
    <main className="min-h-screen overflow-hidden bg-black px-4 py-8 text-white sm:px-6">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,#facc1530,transparent_35%),radial-gradient(circle_at_bottom_right,#7c3aed30,transparent_35%)]" />

      <div className="relative mx-auto max-w-7xl">

        <div className="mb-8">
          <RewardsCard />
        </div>
        <section className="rounded-[2rem] border border-pink-500/20 bg-white/5 p-6 shadow-2xl backdrop-blur-xl sm:p-10">
          <p className="text-xs font-black uppercase tracking-[0.35em] text-pink-500">
            Skill-Based Challenges
          </p>

          <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight sm:text-6xl">
            Play smarter. Test your skill. Win by performance.
          </h1>

          <p className="mt-4 max-w-2xl text-sm text-white/60 sm:text-lg">
            Choose from professional skill games built around speed, memory,
            logic, accuracy, focus, and problem solving.
          </p>
        </section>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {games.map(([slug, icon, name, tag], index) => (
            <Link
              key={slug}
              href={`/skill-games/${slug}`}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-black p-5 shadow-xl transition duration-300 hover:-translate-y-1 hover:border-pink-500/60"
            >
              <div className="absolute right-[-30px] top-[-30px] h-28 w-28 rounded-full bg-pink-500/10 blur-2xl transition group-hover:bg-pink-500/25" />

              <div className="relative flex items-start justify-between gap-3">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-pink-500/20 bg-black/60 text-4xl shadow-lg transition group-hover:scale-110">
                  {icon}
                </div>

                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/50">
                  #{index + 1}
                </span>
              </div>

              <h2 className="relative mt-5 text-2xl font-black text-white">
                {name}
              </h2>

              <p className="relative mt-2 text-sm text-pink-400">
                {tag}
              </p>

              <div className="relative mt-5 flex items-center justify-between rounded-2xl bg-pink-500 px-4 py-3 font-black text-black">
                <span>Open Game</span>
                <span className="transition group-hover:translate-x-1">→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

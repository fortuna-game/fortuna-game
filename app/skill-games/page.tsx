import Link from "next/link";

const games = [
  {
    name: "Trivia Sprint",
    emoji: "🧠",
    desc: "Answer timed questions. Beat the score target to win 2x.",
  },
  {
    name: "Math Rush",
    emoji: "➗",
    desc: "Solve quick math questions before time runs out.",
  },
  {
    name: "Word Puzzle",
    emoji: "🔤",
    desc: "Find or build words against the clock.",
  },
  {
    name: "Reaction Tap",
    emoji: "⚡",
    desc: "Tap at the right moment and beat the required reaction score.",
  },
  {
    name: "Memory Match",
    emoji: "🧩",
    desc: "Remember and match patterns to reach the target score.",
  },
  {
    name: "Target Challenge",
    emoji: "🎯",
    desc: "Hit targets and reach the required accuracy to win.",
  },
];

export default function SkillGamesMockupPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-4xl font-black text-yellow-400">Skill Games Mockup</h1>
        <p className="mt-2 text-white/60">
          Users choose how much to stake. Win and receive 2x payout.
        </p>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {games.map((game) => (
            <div key={game.name} className="rounded-3xl border border-yellow-400/20 bg-white/5 p-6">
              <div className="text-5xl">{game.emoji}</div>
              <h2 className="mt-4 text-2xl font-black">{game.name}</h2>
              <p className="mt-2 text-sm text-white/60">{game.desc}</p>

              <div className="mt-5 rounded-2xl bg-black/50 p-4">
                <p className="text-sm text-white/50">Stake Amount</p>
                <input
                  placeholder="Enter amount e.g. 10"
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-3 outline-none"
                />
                <p className="mt-3 text-sm text-green-300">
                  If you stake GH₵10 and win, payout is GH₵20.
                </p>
              </div>

              <button className="mt-5 w-full rounded-xl bg-yellow-400 py-3 font-black text-black">
                Preview Game
              </button>
            </div>
          ))}
        </div>

        <Link href="/dashboard" className="mt-8 inline-block rounded-full border border-white/10 px-6 py-3">
          Back to Dashboard
        </Link>
      </div>
    </main>
  );
}

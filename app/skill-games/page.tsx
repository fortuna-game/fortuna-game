import Link from "next/link";

const games = [
  ["trivia", "🧠", "Trivia Sprint", "Answer questions and beat the required score."],
  ["math-rush", "➗", "Math Rush", "Solve fast math challenges."],
  ["word-puzzle", "🔤", "Word Puzzle", "Unscramble words correctly."],
  ["memory-match", "🧩", "Memory Match", "Match hidden pairs with limited moves."],
  ["reaction-tap", "⚡", "Reaction Rush", "Fast reflex challenge."],
  ["target-challenge", "🏹", "Arrow Target", "Hit your chosen moving number."],
  ["pattern-sequence", "🧩", "Pattern Sequence", "Find what comes next."],
  ["speed-sort", "⚡", "Speed Sort", "Sort items quickly and correctly."],
  ["code-breaker", "🔐", "Code Breaker", "Crack secret codes using clues."],
  ["maze-escape", "🧭", "Maze Escape", "Reach the exit with limited moves."],
  ["color-clash", "🎨", "Color Clash", "Choose the actual display color."],
  ["quick-count", "👁️", "Quick Count", "Count objects before they disappear."],
  ["stack-balance", "📦", "Stack Balance", "Drop blocks carefully and build high."],
  ["number-hunt", "🔢", "Number Hunt", "Find the hidden target number."],
  ["logic-lock", "🔒", "Logic Lock", "Solve logic challenges and unlock the vault."],
];

export default function SkillGamesPage() {
  return (
    <main className="min-h-screen bg-black px-4 py-8 text-white sm:px-6">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-black text-yellow-400 sm:text-5xl">
          Skill Games
        </h1>

        <p className="mt-2 max-w-2xl text-sm text-white/60 sm:text-base">
          Choose a game, test your skill, and win based on performance.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {games.map(([slug, icon, name, desc]) => (
            <Link
              key={slug}
              href={`/skill-games/${slug}`}
              className="rounded-3xl border border-yellow-400/20 bg-white/5 p-5 transition hover:border-yellow-400/60 hover:bg-yellow-400/10"
            >
              <div className="text-5xl">{icon}</div>

              <h2 className="mt-4 text-xl font-black text-white">
                {name}
              </h2>

              <p className="mt-2 text-sm text-white/50">
                {desc}
              </p>

              <div className="mt-5 rounded-xl bg-yellow-400 py-3 text-center font-black text-black">
                Preview Game
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

import Link from "next/link";

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

            <Link
              href={game.href}
              className="mt-6 block rounded-xl bg-pink-500 py-4 text-center font-black text-black hover:bg-pink-400"
            >
              Play
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}

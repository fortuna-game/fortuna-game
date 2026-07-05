const games = [
  { icon: "🎡", name: "Spin the Wheel" },
  { icon: "🍾", name: "Spin the Bottle" },
  { icon: "🎲", name: "Dice Roll" },
  { icon: "📦", name: "Treasure Boxes" },
  { icon: "💰", name: "Treasure Vault" },
  { icon: "🏴‍☠️", name: "Treasure Hunt" },
  { icon: "🧠", name: "Trivia Challenge" },
  { icon: "🔤", name: "Word Search" },
];

export default function FeaturedGames() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <h2 className="mb-10 text-center text-5xl font-black">
        Featured Games
      </h2>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {games.map((game) => (
          <div
            key={game.name}
            className="rounded-3xl border border-yellow-400/20 bg-white/5 p-6 transition hover:scale-105 hover:border-yellow-400"
          >
            <div className="text-6xl">{game.icon}</div>

            <h3 className="mt-5 text-xl font-bold">
              {game.name}
            </h3>

            <button className="mt-6 w-full rounded-xl bg-yellow-400 py-3 font-bold text-black">
              Play
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

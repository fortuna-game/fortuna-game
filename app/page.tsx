import Hero from "@/components/home/Hero";
import JackpotCard from "@/components/home/JackpotCard";
import WinnersTicker from "@/components/home/WinnersTicker";
import Stats from "@/components/home/Stats";
import FeaturedGames from "@/components/home/FeaturedGames";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">

      <Hero />

      <JackpotCard />

      <div className="mt-16">
        <WinnersTicker />
      </div>

      <Stats />

      <FeaturedGames />

      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="rounded-[40px] border border-pink-500/20 bg-gradient-to-r from-pink-600/10 via-black to-purple-900/20 p-10 text-center">

          <h2 className="text-5xl font-black">
            Ready to Play?
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg text-white/60">
            Create your account, fund your wallet securely and enjoy exciting
            games with amazing prizes on Fortuna Play.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">

            <a
              href="/signup"
              className="rounded-full bg-pink-500 px-8 py-4 font-black text-black"
            >
              Create Account
            </a>

            <a
              href="/skill-games"
              className="rounded-full border border-pink-500 px-8 py-4 font-bold"
            >
              Browse Games
            </a>

          </div>

        </div>
      </section>

    </main>
  );
}

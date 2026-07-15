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

      <section className="mx-auto mt-20 max-w-7xl px-6">
        <div className="rounded-[40px] border border-green-500/20 bg-gradient-to-r from-green-600/10 via-black to-emerald-900/20 p-10">

          <div className="mx-auto max-w-4xl text-center">

            <p className="text-sm font-black uppercase tracking-[0.35em] text-green-400">
              AFFILIATE PROGRAM
            </p>

            <h2 className="mt-4 text-5xl font-black">
              Earn GH₵5 For Every Qualified Referral
            </h2>

            <p className="mx-auto mt-6 max-w-3xl text-lg text-white/70">
              Share your personal referral link with friends.
              Every player who qualifies earns you GH₵5.
              Track referrals, commissions and withdrawals from your affiliate dashboard.
            </p>

            <div className="mt-10 flex flex-wrap justify-center gap-4">

              <a
                href="/affiliate/register"
                className="rounded-full bg-green-500 px-8 py-4 font-black text-black"
              >
                Become an Affiliate
              </a>

              <a
                href="/affiliate/login"
                className="rounded-full border border-green-500 px-8 py-4 font-bold text-green-300"
              >
                Affiliate Login
              </a>

            </div>

          </div>

        </div>
      </section>



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

import Hero from "@/components/home/Hero";
import JackpotCard from "@/components/home/JackpotCard";
import WinnersTicker from "@/components/home/WinnersTicker";
import Stats from "@/components/home/Stats";
import FeaturedGames from "@/components/home/FeaturedGames";
import AffiliateStats from "@/components/home/AffiliateStats";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#071A33] text-white">

      <Hero />

      <JackpotCard />

      <div className="mt-16">
        <WinnersTicker />
      </div>

      <section className="mx-auto mt-10 max-w-7xl px-6">
        <div className="overflow-hidden rounded-[40px] border border-[#F5B700]/40 bg-gradient-to-br from-[#F5B700]/15 via-[#0B2545] to-[#071A33] p-6 shadow-2xl sm:p-10">
          <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto]">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full bg-red-500 px-4 py-2 text-xs font-black tracking-wider text-white">
                  <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-white"></span>
                  LIVE DRAW
                </span>

                <span className="rounded-full border border-[#F5B700]/30 bg-[#F5B700]/10 px-4 py-2 text-xs font-black text-[#FFD54A]">
                  WINNERS ANNOUNCEMENT
                </span>
              </div>

              <h2 className="mt-6 text-3xl font-black leading-tight text-white sm:text-4xl lg:text-5xl">
                Watch the Live Draw & See Who Wins
              </h2>

              <p className="mt-5 max-w-2xl text-base leading-7 text-[#B4C0D1] sm:text-lg">
                Join the excitement as Fortuna Play announces Lucky Draw winners.
                Watch the live results and see the selected winners and prizes.
              </p>

              <div className="mt-7 flex flex-wrap gap-4">
                <a
                  href="/lucky-draw/live"
                  className="inline-flex items-center gap-3 rounded-full bg-[#FFD54A] px-7 py-4 font-black text-black transition hover:scale-105 hover:bg-yellow-300"
                >
                  <span>🔴</span>
                  Watch Live Draw
                  <span>→</span>
                </a>

                <a
                  href="/winners"
                  className="inline-flex items-center gap-3 rounded-full border border-[#4D94F5] px-7 py-4 font-black text-white transition hover:bg-[#4D94F5]"
                >
                  View All Winners
                  <span>🏆</span>
                </a>
              </div>
            </div>

            <div className="flex justify-center">
              <div className="relative flex h-44 w-44 items-center justify-center rounded-full border border-[#F5B700]/50 bg-[#071A33]/80 text-7xl shadow-2xl sm:h-52 sm:w-52 sm:text-8xl">
                <div className="absolute inset-3 animate-pulse rounded-full border border-[#F5B700]/20"></div>
                ��
              </div>
            </div>
          </div>
        </div>
      </section>

      <Stats />

      <FeaturedGames />

      <section className="mx-auto mt-20 max-w-7xl px-6">
        <div className="rounded-[40px] border border-green-500/20 bg-gradient-to-r from-green-600/10 via-[#071A33] to-emerald-900/20 p-5 sm:p-7 lg:p-10">

          <div className="mx-auto max-w-4xl text-center">

            <p className="text-sm font-black uppercase tracking-[0.35em] text-green-400">
              AFFILIATE PROGRAM
            </p>

            <h2 className="mt-4 text-3xl sm:text-3xl sm:text-4xl lg:text-5xl font-black">
              Turn Your Network Into Daily Income
            </h2>

            <p className="mx-auto mt-6 max-w-3xl text-lg text-[#B4C0D1]">
              Earn up to GH₵100 every day by inviting players to Fortuna Play.
              Share your unique referral link, track your referrals and earnings in real time,
              and withdraw your commissions whenever you're eligible.
            </p>

            <p className="mt-5 text-sm text-[#7185A3]">
              Qualified referrals only. Terms and conditions apply.
            </p>

            <AffiliateStats />

            <div className="mt-10 grid gap-5 md:grid-cols-3">

              <div className="rounded-3xl border border-green-500/20 bg-[#071A33]/40 p-6 text-left">
                <div className="text-3xl sm:text-4xl">💸</div>
                <h3 className="mt-4 text-2xl font-black">
                  Earn Daily
                </h3>
                <p className="mt-3 text-[#9AAAC1]">
                  Earn up to GH₵100 every day by referring qualified players.
                </p>
              </div>

              <div className="rounded-3xl border border-green-500/20 bg-[#071A33]/40 p-6 text-left">
                <div className="text-3xl sm:text-4xl">📊</div>
                <h3 className="mt-4 text-2xl font-black">
                  Real-Time Dashboard
                </h3>
                <p className="mt-3 text-[#9AAAC1]">
                  Track referrals, commissions, withdrawals and your progress instantly.
                </p>
              </div>

              <div className="rounded-3xl border border-green-500/20 bg-[#071A33]/40 p-6 text-left">
                <div className="text-3xl sm:text-4xl">⚡</div>
                <h3 className="mt-4 text-2xl font-black">
                  Fast Withdrawals
                </h3>
                <p className="mt-3 text-[#9AAAC1]">
                  Withdraw your affiliate earnings directly to your Mobile Money account once you're eligible.
                </p>
              </div>

            </div>

            <div className="mt-10 flex flex-wrap justify-center gap-4">

              <a
                href="/affiliate/register"
                className="rounded-full bg-green-500 px-4 sm:px-6 lg:px-8 py-4 font-black text-black"
              >
                Start Earning
              </a>

              <a
                href="/affiliate/login"
                className="rounded-full border border-green-500 px-4 sm:px-6 lg:px-8 py-4 font-bold text-green-300"
              >
                Affiliate Login
              </a>

            </div>

          </div>

        </div>
      </section>



      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="rounded-[40px] border border-[#2A5688] bg-gradient-to-r from-blue-700/10 via-[#071A33] to-[#0B2345]/40 p-5 sm:p-7 lg:p-10 text-center">

          <h2 className="text-3xl sm:text-3xl sm:text-4xl lg:text-5xl font-black">
            Ready to Play?
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg text-[#9AAAC1]">
            Create your account, fund your wallet securely and enjoy exciting
            games with amazing prizes on Fortuna Play.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">

            <a
              href="/signup"
              className="rounded-full bg-[#3F82DD] px-4 sm:px-6 lg:px-8 py-4 font-black text-black"
            >
              Create Account
            </a>

            <a
              href="/skill-games"
              className="rounded-full border border-blue-500 px-4 sm:px-6 lg:px-8 py-4 font-bold"
            >
              Browse Games
            </a>

          </div>

        </div>
      </section>

    </main>
  );
}

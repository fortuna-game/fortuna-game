import Link from "next/link";

export default function ResponsibleGamingPage() {
  return (
    <main className="min-h-screen bg-[#071A33] px-4 py-10 text-white sm:px-6">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/"
          className="text-sm font-bold text-[#FFD54A] hover:underline"
        >
          ← Fortuna
        </Link>

        <div className="mt-8">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-green-400">
            PLAYER WELLBEING
          </p>

          <h1 className="mt-3 text-4xl font-black sm:text-5xl">
            Responsible Gaming
          </h1>

          <p className="mt-4 max-w-2xl text-[#9AAAC1]">
            Gaming should remain entertainment. Set limits, know your
            budget and take a break when you need one.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {[
            ["🎯", "Set a budget", "Only use money you can comfortably afford to spend."],
            ["⏸️", "Take breaks", "Step away regularly and never feel pressured to keep playing."],
            ["🚫", "Don't chase losses", "A previous loss does not mean you are due to win next."],
            ["🧠", "Stay in control", "Never play when you are upset, under pressure or trying to solve financial problems."],
          ].map(([icon, title, text]) => (
            <section
              key={title}
              className="rounded-3xl border border-white/10 bg-[#0B2545]/70 p-6"
            >
              <div className="text-4xl">{icon}</div>
              <h2 className="mt-4 text-xl font-black">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-[#9AAAC1]">
                {text}
              </p>
            </section>
          ))}
        </div>

        <section className="mt-6 rounded-3xl border border-red-400/20 bg-red-500/5 p-6">
          <p className="text-2xl font-black text-red-300">
            🔞 18+ ONLY
          </p>

          <p className="mt-3 text-sm leading-7 text-[#C4CFDE]">
            Fortuna is not for anyone under 18. Do not allow children or
            other underage persons to use your account.
          </p>
        </section>

        <section className="mt-6 rounded-3xl border border-[#32659D] bg-[#0B2545]/70 p-6">
          <h2 className="text-2xl font-black">
            Need to take a break?
          </h2>

          <p className="mt-3 text-sm leading-7 text-[#9AAAC1]">
            Stop using the platform and contact Fortuna Support if you need
            help restricting your account activity. We can provide
            information about available account restrictions and
            self-exclusion options.
          </p>

          <Link
            href="/support"
            className="mt-6 inline-block rounded-xl bg-[#FFD54A] px-6 py-3 font-black text-black"
          >
            Contact Support
          </Link>
        </section>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/terms"
            className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 font-bold"
          >
            Terms & Conditions
          </Link>

          <Link
            href="/skill-games"
            className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 font-bold"
          >
            Back to Games
          </Link>
        </div>
      </div>
    </main>
  );
}

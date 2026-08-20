import Link from "next/link";

export default function AffiliateLandingPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#071A33] px-5 py-10 text-white">
      <div className="w-full max-w-3xl rounded-3xl border border-green-500/20 bg-gradient-to-br from-green-500/10 via-[#071A33] to-blue-500/10 p-5 sm:p-6 lg:p-8 text-center">
        <div className="text-3xl sm:text-3xl sm:text-4xl lg:text-5xl sm:text-3xl sm:text-4xl sm:text-3xl sm:text-3xl sm:text-4xl lg:text-5xl lg:text-6xl lg:text-7xl">🤝</div>

        <h1 className="mt-5 text-3xl sm:text-4xl font-black text-green-400">
          Fortuna Affiliate Program
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-[#9AAAC1]">
          Share Fortuna Play with genuine players and earn GH₵5 when each
          referred player deposits and plays at least GH₵20.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Link
            href="/affiliate/register"
            className="rounded-xl bg-green-500 px-6 py-4 font-black text-black"
          >
            Become an Affiliate
          </Link>

          <Link
            href="/affiliate/login"
            className="rounded-xl border border-green-500/30 bg-[#0B2545]/70 px-6 py-4 font-black text-green-400"
          >
            Affiliate Login
          </Link>
        </div>

        <Link
          href="/"
          className="mt-7 inline-block text-sm text-[#7185A3]"
        >
          ← Back to Fortuna Play
        </Link>
      </div>
    </main>
  );
}

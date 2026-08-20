import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden py-24">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#FFD70022,transparent_65%)]" />

      <div className="relative mx-auto max-w-7xl px-6 text-center">
        <span className="rounded-full border border-[#32659D] bg-[#2C63B3]/10 px-4 py-2 text-sm font-semibold text-[#66A7FF]">
          Ghana's Skill Gaming Platform
        </span>

        <h1 className="mt-8 text-6xl font-black leading-tight md:text-8xl">
          PLAY.
          <br />
          WIN.
          <br />
          CELEBRATE.
        </h1>

        <p className="mx-auto mt-8 max-w-2xl text-lg text-[#B4C0D1]">
          Enjoy exciting games, compete fairly, and stand a chance to win amazing
          cash prizes on Fortuna Play.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="/signup"
            className="rounded-full bg-[#3F82DD] px-8 py-4 font-black text-black hover:bg-blue-400"
          >
            Start Playing
          </Link>

          <Link
            href="/skill-games"
            className="rounded-full border border-[#32659D] px-8 py-4 font-bold"
          >
            Explore Games
          </Link>
        </div>
      </div>
    </section>
  );
}

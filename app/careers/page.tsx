import Link from "next/link";

export default function CareersPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-green-700">
            CAREERS
          </p>

          <h1 className="mt-4 max-w-4xl text-4xl font-black tracking-tight sm:text-6xl">
            Build your future with Fortuna Play.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            We are building products, technology and experiences for our
            growing community. We are looking for people who are curious,
            ambitious and ready to make an impact.
          </p>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-green-700">
              OPEN POSITIONS
            </p>

            <h2 className="mt-3 text-3xl font-black sm:text-4xl">
              Current Opportunities
            </h2>

            <p className="mt-4 text-slate-600">
              We do not have any open positions at the moment. New
              opportunities will appear here as our team grows.
            </p>
          </div>

          <div className="mt-10 border-y border-slate-200 py-10">
            <p className="text-lg font-black">
              No current openings
            </p>

            <p className="mt-2 max-w-2xl text-slate-600">
              Check back later for new opportunities across our business,
              operations, marketing, customer experience and technology
              teams.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-green-50">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-green-700">
              TALENT NETWORK
            </p>

            <h2 className="mt-3 text-3xl font-black sm:text-4xl">
              Don't see a role for you?
            </h2>

            <p className="mt-4 text-slate-700 leading-7">
              We're always interested in meeting talented people. Tell us
              who you are, what you do and how you think you could
              contribute to Fortuna Play.
            </p>

            <Link
              href="/support"
              className="mt-8 inline-flex rounded-xl bg-green-700 px-6 py-3 font-black text-white transition hover:bg-green-800"
            >
              Send Your CV
            </Link>

            <p className="mt-3 text-xs text-slate-500">
              CV submissions can be sent through Fortuna Support until
              dedicated applications are introduced.
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-bold">
            <Link href="/" className="text-slate-600 hover:text-green-700">
              Home
            </Link>

            <Link
              href="/support"
              className="text-slate-600 hover:text-green-700"
            >
              Support
            </Link>

            <Link
              href="/terms"
              className="text-slate-600 hover:text-green-700"
            >
              Terms & Conditions
            </Link>

            <Link
              href="/privacy"
              className="text-slate-600 hover:text-green-700"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

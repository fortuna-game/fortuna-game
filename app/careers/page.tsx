import Link from "next/link";

const positions = [
  {
    slug: "social-media-growth",
    title: "Social Media Growth & Associate",
    details: "Remote · Part-time / Flexible · GH₵1,500–2,500/month + performance incentives",
    description:
      "Help us grow Fortuna Play through social media, creators, communities and engaging content.",
  },
  {
    slug: "customer-support",
    title: "Customer Support Representative",
    details: "Remote · Part-time / Flexible · GH₵1,200–2,000/month",
    description:
      "Help users with account questions, platform issues and general customer support.",
  },
  {
    slug: "digital-marketing",
    title: "Digital Marketing Associate",
    details: "Remote · Part-time / Flexible · GH₵1,500–2,500/month",
    description:
      "Support campaigns, promotions, audience growth, partnerships and digital marketing.",
  },

  {
    slug: "operations-assistant",
    title: "Operations Assistant",
    details: "Remote · Flexible · GH₵1,200–2,000/month",
    description:
      "Support day-to-day coordination, records, administration and business operations.",
  },
];

export default function CareersPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-green-700">
            CAREERS
          </p>

          <h1 className="mt-4 max-w-4xl text-4xl font-black tracking-tight sm:text-6xl">
            Build with Fortuna Play.
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
            We're building a growing company and looking for talented,
            reliable and ambitious people who want to grow with us.
          </p>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-green-700">
            OPEN POSITIONS
          </p>

          <h2 className="mt-3 text-3xl font-black sm:text-4xl">
            Join our remote team
          </h2>

          <div className="mt-10 divide-y divide-slate-200 border-y border-slate-200">
            {positions.map((position, index) => (
              <div
                key={position.slug}
                className="py-8"
              >
                <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
                  <div className="max-w-3xl">
                    {index === 0 && (
                      <span className="mb-3 inline-block text-xs font-black uppercase tracking-[0.18em] text-green-700">
                        Priority Hiring
                      </span>
                    )}

                    <h3 className="text-2xl font-black">
                      {position.title}
                    </h3>

                    <p className="mt-2 text-sm font-bold text-green-700">
                      {position.details}
                    </p>

                    <p className="mt-3 leading-7 text-slate-600">
                      {position.description}
                    </p>
                  </div>

                  <Link
                    href={`/careers/apply?position=${position.slug}`}
                    className="shrink-0 rounded-xl bg-green-700 px-6 py-3 text-center font-black text-white hover:bg-green-800"
                  >
                    Apply Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-green-50">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-green-700">
              SOCIAL GROWTH
            </p>

            <h2 className="mt-3 text-3xl font-black">
              Have an audience? We'd love to hear from you.
            </h2>

            <p className="mt-4 leading-7 text-slate-700">
              For our social media and community roles, we're especially
              interested in people with an active audience on TikTok,
              Instagram, Facebook, YouTube or other platforms.
            </p>

            <p className="mt-4 leading-7 text-slate-700">
              Follower count isn't everything. We care about genuine
              engagement, audience relevance, reach and your ability to
              turn attention into action.
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-6xl px-6 py-14">
          <Link
            href="/"
            className="font-bold text-green-700 hover:underline"
          >
            ← Back to Fortuna Play
          </Link>
        </div>
      </section>
    </main>
  );
}

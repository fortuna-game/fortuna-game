import Link from "next/link";

export default function PrivacyPage() {
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
          <p className="text-xs font-black uppercase tracking-[0.3em] text-[#FFD54A]">
            LEGAL
          </p>

          <h1 className="mt-3 text-4xl font-black sm:text-5xl">
            Privacy Policy
          </h1>

          <p className="mt-3 text-sm text-[#9AAAC1]">
            Last updated: 22 August 2026
          </p>
        </div>

        <div className="mt-10 space-y-8 text-sm leading-7 text-[#C4CFDE]">
          <section>
            <h2 className="text-xl font-black text-white">
              1. Information We Collect
            </h2>
            <p className="mt-3">
              We may collect information you provide when creating or using
              your Fortuna account, including your name, phone number,
              account details and information needed to support transactions,
              verification and customer support.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-white">
              2. Activity & Transaction Information
            </h2>
            <p className="mt-3">
              We may record information relating to wallet activity, entries,
              prizes, support requests, account activity and other actions
              taken through the platform. This information helps us operate
              the service, maintain records, detect abuse and provide
              support.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-white">
              3. How We Use Information
            </h2>
            <p className="mt-3">
              Information may be used to operate and secure your account,
              process transactions, provide services, communicate important
              account information, prevent fraud and comply with applicable
              legal or regulatory obligations.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-white">
              4. Communications
            </h2>
            <p className="mt-3">
              We may contact you about verification, purchases, account
              security, support requests, important platform updates and
              promotional communications where applicable.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-white">
              5. Security
            </h2>
            <p className="mt-3">
              We use reasonable technical and administrative safeguards to
              protect information. No internet service can guarantee absolute
              security, so you should also protect your password and account
              access information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-white">
              6. Information Sharing
            </h2>
            <p className="mt-3">
              We may share information with service providers or other
              parties where necessary to operate the platform, process
              services, protect users, investigate fraud or meet legal and
              regulatory requirements.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-white">
              7. Your Choices
            </h2>
            <p className="mt-3">
              You may contact Fortuna Support regarding your account or
              personal information. Some information may need to be retained
              where required for security, transaction records, legal
              obligations or dispute handling.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-white">
              8. Policy Updates
            </h2>
            <p className="mt-3">
              We may update this Privacy Policy when our services, practices
              or legal requirements change. The latest version will be
              published on this page with an updated date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-white">
              9. Contact
            </h2>
            <p className="mt-3">
              For privacy questions or requests, please contact Fortuna
              Support.
            </p>
          </section>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/terms"
            className="rounded-xl bg-[#FFD54A] px-5 py-3 font-black text-black"
          >
            Terms & Conditions
          </Link>

          <Link
            href="/responsible-gaming"
            className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 font-bold"
          >
            Responsible Gaming
          </Link>
        </div>
      </div>
    </main>
  );
}

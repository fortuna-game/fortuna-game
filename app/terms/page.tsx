import Link from "next/link";

export default function TermsPage() {
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
            Terms & Conditions
          </h1>

          <p className="mt-3 text-sm text-[#9AAAC1]">
            Last updated: 22 August 2026
          </p>
        </div>

        <div className="mt-10 space-y-8 text-sm leading-7 text-[#C4CFDE]">
          <section>
            <h2 className="text-xl font-black text-white">1. Acceptance</h2>
            <p className="mt-3">
              By creating an account or using Fortuna, you agree to these
              Terms & Conditions, our Responsible Gaming information and our
              Privacy Policy. Please read them carefully before using the
              platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-white">2. Eligibility</h2>
            <p className="mt-3">
              Fortuna is intended for persons aged 18 years and above.
              You must provide accurate information when creating and
              maintaining your account. We may request information needed
              to verify your identity, eligibility or account activity.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-white">3. Your Account</h2>
            <p className="mt-3">
              You are responsible for keeping your login details secure and
              for activity carried out through your account. One person must
              not use another person's account or create accounts for the
              purpose of abusing promotions, entry limits or platform
              systems.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-white">
              4. Lucky Draw Entries
            </h2>
            <p className="mt-3">
              Each Lucky Draw operates separately. When you purchase an
              entry, the ticket is tied to the specific Lucky Draw selected
              at the time of purchase. Your ticket number and draw identity
              may be shown in your account history and other relevant areas
              of the platform.
            </p>
            <p className="mt-3">
              A ticket is valid only for the Lucky Draw for which it was
              purchased. Entries are subject to the entry limit, ticket
              price, closing time and rules displayed for that specific draw.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-white">
              5. Winner Selection
            </h2>
            <p className="mt-3">
              Winner selection takes place after the applicable Lucky Draw
              has closed. Only eligible entries associated with that draw
              are considered. Winner-selection information may be displayed
              through Fortuna's live or recorded selection experience.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-white">
              6. Payments & Wallet
            </h2>
            <p className="mt-3">
              You must have sufficient available funds before purchasing an
              entry or using any paid feature. Transactions may be subject
              to verification, processing controls and fraud-prevention
              checks.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-white">
              7. Prizes & Claims
            </h2>
            <p className="mt-3">
              Prize details, eligibility and claim instructions are shown
              for the relevant promotion or draw. A winner may be required
              to complete reasonable verification before a prize is released.
              Prizes cannot be transferred unless Fortuna expressly permits
              it for that particular promotion.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-white">
              8. Cancellation, Suspension & Refunds
            </h2>
            <p className="mt-3">
              Fortuna may pause, suspend or cancel a draw where necessary,
              including for technical problems, suspected fraud, security
              concerns or regulatory or legal requirements. Where a
              cancellation requires refunds, eligible refunds will be
              handled according to the applicable draw rules and platform
              procedures.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-white">
              9. Fair Use & Fraud Prevention
            </h2>
            <p className="mt-3">
              Attempts to manipulate results, exploit technical defects,
              use automated systems, create fraudulent accounts, interfere
              with the platform or otherwise abuse Fortuna are prohibited.
              We may suspend accounts, reverse affected transactions or
              take other appropriate action where abuse is detected.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-white">
              10. Responsible Gaming
            </h2>
            <p className="mt-3">
              Fortuna is intended for entertainment. Do not spend money you
              cannot afford to lose, chase losses or use essential household
              funds for gaming. If gaming is becoming difficult to control,
              stop and use the responsible-gaming options available on the
              platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-white">
              11. Platform Availability
            </h2>
            <p className="mt-3">
              We work to keep Fortuna available and secure, but we do not
              guarantee uninterrupted access. Maintenance, technical
              failures, network issues and circumstances outside our
              reasonable control may temporarily affect the service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-white">
              12. Changes to These Terms
            </h2>
            <p className="mt-3">
              We may update these Terms & Conditions from time to time.
              Material changes will be reflected by updating the date shown
              at the top of this page. Your continued use of the platform
              after an applicable update means you accept the revised terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-white">13. Contact</h2>
            <p className="mt-3">
              Questions, complaints or requests relating to an account,
              transaction, draw or prize should be submitted through
              Fortuna Support.
            </p>
          </section>

          <section className="rounded-2xl border border-yellow-400/20 bg-yellow-400/5 p-5">
            <p className="font-black text-yellow-300">
              Important
            </p>
            <p className="mt-2 text-sm text-[#C4CFDE]">
              These Terms are platform terms and do not constitute a
              representation that Fortuna holds any particular licence,
              permit or regulatory approval. Fortuna should only operate
              promotions and gaming activities for which it has obtained
              all approvals required by applicable law.
            </p>
          </section>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/responsible-gaming"
            className="rounded-xl bg-[#FFD54A] px-5 py-3 font-black text-black"
          >
            Responsible Gaming
          </Link>

          <Link
            href="/support"
            className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 font-bold"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </main>
  );
}

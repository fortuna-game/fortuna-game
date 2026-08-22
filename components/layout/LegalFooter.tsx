import Link from "next/link";

export default function LegalFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#061326] px-4 py-8 text-center text-white/50 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-red-300">
          18+ Only
        </p>

        <p className="mx-auto mt-2 max-w-2xl text-xs leading-5">
          Play responsibly. Do not spend money you cannot afford to lose.
          Gaming should remain entertainment.
        </p>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs">
          <Link href="/responsible-gaming" className="hover:text-[#FFD54A]">
            Responsible Gaming
          </Link>

          <Link href="/terms" className="hover:text-[#FFD54A]">
            Terms & Conditions
          </Link>

          <Link href="/privacy" className="hover:text-[#FFD54A]">
            Privacy Policy
          </Link>

          <Link href="/support" className="hover:text-[#FFD54A]">
            Support
          </Link>

          <Link href="/careers" className="hover:text-[#FFD54A]">
            Careers
          </Link>
        </div>

        <p className="mt-5 text-[11px] text-white/30">
          © 2026 Fortuna Play. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

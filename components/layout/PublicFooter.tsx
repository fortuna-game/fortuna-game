"use client";

import { usePathname } from "next/navigation";
import LegalFooter from "@/components/layout/LegalFooter";

export default function PublicFooter() {
  const pathname = usePathname();

  if (
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname === "/affiliate" ||
    pathname.startsWith("/affiliate/")
  ) {
    return null;
  }

  return <LegalFooter />;
}

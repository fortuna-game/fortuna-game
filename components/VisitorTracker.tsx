"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function VisitorTracker() {
  const pathname = usePathname();

  useEffect(() => {
    async function trackVisit() {
      let visitorId = localStorage.getItem("fortuna_visitor_id");

      if (!visitorId) {
        visitorId = crypto.randomUUID();
        localStorage.setItem("fortuna_visitor_id", visitorId);
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      await fetch("/api/visitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitorId,
          userId: user?.id || null,
          path: pathname,
        }),
      });
    }

    void trackVisit();
  }, [pathname]);

  return null;
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const WARNING_AFTER_MS = 14 * 60 * 1000;
const LOGOUT_AFTER_WARNING_MS = 60 * 1000;

function getLoginPath(pathname: string) {
  if (pathname.startsWith("/affiliate")) {
    return "/affiliate/login";
  }

  if (pathname.startsWith("/admin")) {
    return "/admin/login";
  }

  return "/login";
}

export default function SessionTimeout() {
  const pathname = usePathname();
  const router = useRouter();

  const warningTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const logoutTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [showWarning, setShowWarning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [hasSession, setHasSession] = useState(false);

  const clearTimers = useCallback(() => {
    if (warningTimer.current) {
      clearTimeout(warningTimer.current);
      warningTimer.current = null;
    }

    if (logoutTimer.current) {
      clearTimeout(logoutTimer.current);
      logoutTimer.current = null;
    }
  }, []);

  const logout = useCallback(async () => {
    clearTimers();
    setShowWarning(false);

    await supabase.auth.signOut();

    router.replace(getLoginPath(pathname));
    router.refresh();
  }, [clearTimers, pathname, router]);

  const startTimers = useCallback(() => {
    clearTimers();

    if (!hasSession) return;

    warningTimer.current = setTimeout(() => {
      setSecondsLeft(60);
      setShowWarning(true);

      logoutTimer.current = setTimeout(() => {
        void logout();
      }, LOGOUT_AFTER_WARNING_MS);
    }, WARNING_AFTER_MS);
  }, [clearTimers, hasSession, logout]);

  const continueSession = useCallback(() => {
    setShowWarning(false);
    setSecondsLeft(60);
    startTimers();
  }, [startTimers]);

  useEffect(() => {
    async function checkSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setHasSession(Boolean(session));
    }

    void checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setHasSession(Boolean(session));

      if (!session) {
        clearTimers();
        setShowWarning(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [clearTimers]);

  useEffect(() => {
    if (!hasSession) {
      clearTimers();
      return;
    }

    startTimers();

    const activityEvents = [
      "mousedown",
      "keydown",
      "touchstart",
      "scroll",
      "mousemove",
    ] as const;

    let lastReset = 0;

    function handleActivity() {
      if (showWarning) return;

      const now = Date.now();

      if (now - lastReset < 1000) return;

      lastReset = now;
      startTimers();
    }

    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, handleActivity, {
        passive: true,
      });
    });

    return () => {
      clearTimers();

      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, handleActivity);
      });
    };
  }, [clearTimers, hasSession, showWarning, startTimers]);

  useEffect(() => {
    if (!showWarning) return;

    const countdown = setInterval(() => {
      setSecondsLeft((current) => Math.max(current - 1, 0));
    }, 1000);

    return () => clearInterval(countdown);
  }, [showWarning]);

  if (!showWarning || !hasSession) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#071A33]/80 px-5 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-[#FFD54A]/30 bg-zinc-950 p-7 text-center text-white shadow-2xl">
        <div className="text-5xl">⏳</div>

        <h2 className="mt-4 text-3xl font-black text-[#FFE08A]">
          Your session is about to expire
        </h2>

        <p className="mt-4 leading-7 text-[#9AAAC1]">
          You have been inactive for a while. For your security, you will be
          logged out in:
        </p>

        <p className="mt-4 text-5xl font-black text-[#FFE08A]">
          {secondsLeft}s
        </p>

        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          <button
            onClick={continueSession}
            className="rounded-xl bg-green-500 px-5 py-4 font-black text-black hover:bg-green-400"
          >
            Continue Session
          </button>

          <button
            onClick={() => void logout()}
            className="rounded-xl border border-white/15 bg-[#0B2545]/70 px-5 py-4 font-black text-white hover:bg-[#0F2F57]/80"
          >
            Log Out Now
          </button>
        </div>
      </div>
    </div>
  );
}

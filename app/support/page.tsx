"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const issues = [
  "Deposit Issue",
  "Withdrawal Issue",
  "Game Issue",
  "Account / Verification",
  "Password Reset",
  "Other Issue",
];

export default function SupportPage() {
  const [issueType, setIssueType] = useState("");
  const [reference, setReference] = useState("");
  const [message, setMessage] = useState("");
  const [username, setUsername] = useState("Player");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("username")
        .eq("user_id", user.id)
        .maybeSingle();

      setUsername(data?.username || "Player");
    }

    void loadProfile();
  }, []);

  async function submitTicket(e: React.FormEvent) {
    e.preventDefault();
    setStatus("");

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setStatus("Please login before contacting support.");
      return;
    }

    if (!issueType || !message.trim()) {
      setStatus("Please choose an issue and describe the problem.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("support_tickets").insert({
      user_id: user.id,
      issue_type: issueType,
      username,
      reference: reference || null,
      message,
      status: "open",
    });

    setLoading(false);

    if (error) {
      setStatus(error.message);
      return;
    }

    setStatus("✅ Support ticket sent. Our team will review it.");
    setIssueType("");
    setReference("");
    setMessage("");
  }

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-3xl border border-pink-500/20 bg-white/5 p-6 md:p-8">
          <p className="text-sm font-bold uppercase tracking-widest text-pink-400">
            Fortuna Play Support
          </p>

          <h1 className="mt-3 text-4xl font-black text-pink-500">
            Smart Support Assistant
          </h1>

          <p className="mt-3 text-white/60">
            Tell us what happened. Include your username, reference number, and clear details.
          </p>

          <div className="mt-8 rounded-3xl border border-white/10 bg-black/50 p-5">
            <div className="rounded-2xl bg-pink-500/10 p-4 text-pink-100">
              Hi @{username}, how can we help you today?
            </div>

            <form onSubmit={submitTicket} className="mt-6 space-y-5">
              <div>
                <label className="text-sm font-bold text-white/70">Choose issue</label>
                <select
                  value={issueType}
                  onChange={(e) => setIssueType(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black p-4 text-white outline-none focus:border-pink-500"
                >
                  <option value="">Select issue type</option>
                  {issues.map((issue) => (
                    <option key={issue} value={issue}>{issue}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-bold text-white/70">
                  Reference number, if any
                </label>
                <input
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="Example: FG-GAME-JAMES2026-Jul 8-26"
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-4 text-white outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-white/70">
                  Explain the issue
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write what happened..."
                  rows={6}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 p-4 text-white outline-none focus:border-pink-500"
                />
              </div>

              <button
                disabled={loading}
                className="w-full rounded-xl bg-pink-500 py-4 font-black text-white hover:bg-pink-400 disabled:opacity-60"
              >
                {loading ? "Sending..." : "Submit Support Ticket"}
              </button>

              {status && (
                <p className="rounded-xl bg-white/10 p-4 text-center text-sm text-white">
                  {status}
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}

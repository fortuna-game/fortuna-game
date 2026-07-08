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

type Ticket = {
  id: string;
  issue_type: string;
  reference: string | null;
  message: string;
  status: string;
  admin_reply: string | null;
  replied_at: string | null;
  screenshot_url: string | null;
  created_at: string;
};

export default function SupportPage() {
  const [issueType, setIssueType] = useState("");
  const [reference, setReference] = useState("");
  const [message, setMessage] = useState("");
  const [username, setUsername] = useState("Player");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);

  async function loadTickets() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("support_tickets")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    setTickets(data || []);
  }

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
      await loadTickets();
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

    let screenshotUrl: string | null = null;

    if (screenshot) {
      const fileExt = screenshot.name.split(".").pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("support-screenshots")
        .upload(filePath, screenshot);

      if (uploadError) {
        setStatus(uploadError.message);
        setLoading(false);
        return;
      }

      const { data: publicUrl } = supabase.storage
        .from("support-screenshots")
        .getPublicUrl(filePath);

      screenshotUrl = publicUrl.publicUrl;
    }

    const { error } = await supabase.from("support_tickets").insert({
      user_id: user.id,
      issue_type: issueType,
      username,
      reference: reference || null,
      message,
      screenshot_url: screenshotUrl,
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
    setScreenshot(null);
    await loadTickets();
  }

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-3xl border border-pink-500/20 bg-white/5 p-6 md:p-8">
          <p className="text-sm font-bold uppercase tracking-widest text-pink-400">
            Fortuna Play Support
          </p>

          <h1 className="mt-3 text-4xl font-black text-pink-500">
            Smart Support Assistant
          </h1>

          <p className="mt-3 text-white/60">
            Submit a ticket and attach a screenshot if needed.
          </p>

          <form onSubmit={submitTicket} className="mt-8 space-y-5">
            <select
              value={issueType}
              onChange={(e) => setIssueType(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black p-4 text-white outline-none focus:border-pink-500"
            >
              <option value="">Select issue type</option>
              {issues.map((issue) => (
                <option key={issue} value={issue}>{issue}</option>
              ))}
            </select>

            <input
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Reference number, if any"
              className="w-full rounded-xl border border-white/10 bg-white/5 p-4 text-white outline-none focus:border-pink-500"
            />

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Explain the issue..."
              rows={6}
              className="w-full rounded-xl border border-white/10 bg-white/5 p-4 text-white outline-none focus:border-pink-500"
            />

            <input
              type="file"
              accept="image/*"
              onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
              className="w-full rounded-xl border border-white/10 bg-white/5 p-4 text-white"
            />

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

        <section className="mt-10">
          <h2 className="text-3xl font-black text-pink-500">My Support Tickets</h2>

          <div className="mt-5 grid gap-5">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <div className="flex flex-wrap justify-between gap-3">
                  <div>
                    <p className="font-black text-pink-400">{ticket.issue_type}</p>
                    <p className="mt-1 text-sm text-white/50">
                      {new Date(ticket.created_at).toLocaleString()}
                    </p>
                  </div>

                  <span className="rounded-full bg-pink-500/20 px-4 py-2 text-sm font-bold capitalize text-pink-300">
                    {ticket.status.replaceAll("_", " ")}
                  </span>
                </div>

                {ticket.reference && (
                  <p className="mt-3 text-sm font-bold text-white/70">
                    Reference: {ticket.reference}
                  </p>
                )}

                <p className="mt-4 whitespace-pre-line text-white/80">{ticket.message}</p>

                {ticket.screenshot_url && (
                  <a
                    href={ticket.screenshot_url}
                    target="_blank"
                    className="mt-4 inline-block rounded-xl bg-white/10 px-4 py-2 font-bold text-pink-300"
                  >
                    View Screenshot
                  </a>
                )}

                {ticket.admin_reply && (
                  <div className="mt-5 rounded-2xl border border-pink-500/20 bg-pink-500/10 p-4">
                    <p className="font-black text-pink-300">Admin Update</p>
                    <p className="mt-2 whitespace-pre-line text-white/80">{ticket.admin_reply}</p>
                    {ticket.replied_at && (
                      <p className="mt-2 text-xs text-white/40">
                        {new Date(ticket.replied_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}

            {tickets.length === 0 && (
              <p className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white/60">
                No support tickets yet.
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

const labels: Record<string, string> = {
  "social-media-growth": "Social Media Growth & Associate",
  "customer-support": "Customer Support Representative",
  "digital-marketing": "Digital Marketing Associate",
  "operations-assistant": "Operations Assistant",
};

function ApplicationForm() {
  const params = useSearchParams();
  const slug = params.get("position") || "";
  const position = labels[slug] || "";

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    location: "",
    social_platform: "",
    social_primary_url: "",
    social_other_urls: "",
    followers: "",
    average_views: "",
    engagement: "",
    audience_location: "",
    portfolio_url: "",
    linkedin_url: "",
    cv_url: "",
    previous_promotion: "",
    why_fortuna: "",
    additional_information: "",
  });

  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  function update(key: string, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    if (!position) {
      setStatus("Please select a valid position.");
      return;
    }

    setLoading(true);
    setStatus("");

    try {
      const response = await fetch("/api/careers/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          position: slug,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Could not submit application.");
      }

      setStatus(
        "Application submitted successfully. Our team will review it and contact you if shortlisted."
      );
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : "Could not submit application."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto max-w-4xl px-6 py-14 sm:py-20">
        <a
          href="/careers"
          className="text-sm font-bold text-green-700 hover:underline"
        >
          ← Back to Careers
        </a>

        <p className="mt-10 text-sm font-black uppercase tracking-[0.2em] text-green-700">
          APPLICATION
        </p>

        <h1 className="mt-3 text-4xl font-black sm:text-5xl">
          {position || "Join Fortuna Play"}
        </h1>

        <p className="mt-4 max-w-2xl leading-7 text-slate-600">
          Tell us about yourself, your experience and what you could bring
          to Fortuna Play. We're hiring remotely.
        </p>

        <form onSubmit={submit} className="mt-10 space-y-8">
          <section className="space-y-5">
            <h2 className="text-xl font-black">Personal Information</h2>

            <div className="grid gap-5 md:grid-cols-2">
              <input
                required
                placeholder="Full Name"
                value={form.full_name}
                onChange={(e) => update("full_name", e.target.value)}
                className="border-b border-slate-300 bg-transparent px-1 py-3 outline-none focus:border-green-700"
              />

              <input
                required
                type="email"
                placeholder="Email Address"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                className="border-b border-slate-300 bg-transparent px-1 py-3 outline-none focus:border-green-700"
              />

              <input
                required
                placeholder="Phone Number"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                className="border-b border-slate-300 bg-transparent px-1 py-3 outline-none focus:border-green-700"
              />

              <input
                placeholder="Location"
                value={form.location}
                onChange={(e) => update("location", e.target.value)}
                className="border-b border-slate-300 bg-transparent px-1 py-3 outline-none focus:border-green-700"
              />
            </div>
          </section>

          <section className="space-y-5">
            <h2 className="text-xl font-black">Social Presence</h2>

            <select
              value={form.social_platform}
              onChange={(e) => update("social_platform", e.target.value)}
              className="w-full border-b border-slate-300 bg-white px-1 py-3 outline-none focus:border-green-700"
            >
              <option value="">Primary social platform</option>
              <option>TikTok</option>
              <option>Instagram</option>
              <option>Facebook</option>
              <option>YouTube</option>
              <option>X</option>
              <option>Other</option>
            </select>

            <input
              placeholder="Primary social profile URL"
              value={form.social_primary_url}
              onChange={(e) =>
                update("social_primary_url", e.target.value)
              }
              className="w-full border-b border-slate-300 bg-transparent px-1 py-3 outline-none focus:border-green-700"
            />

            <input
              placeholder="Other social profile links (optional)"
              value={form.social_other_urls}
              onChange={(e) =>
                update("social_other_urls", e.target.value)
              }
              className="w-full border-b border-slate-300 bg-transparent px-1 py-3 outline-none focus:border-green-700"
            />

            <div className="grid gap-5 md:grid-cols-3">
              <input
                placeholder="Followers / Subscribers"
                value={form.followers}
                onChange={(e) => update("followers", e.target.value)}
                className="border-b border-slate-300 bg-transparent px-1 py-3 outline-none focus:border-green-700"
              />

              <input
                placeholder="Average views / reach"
                value={form.average_views}
                onChange={(e) => update("average_views", e.target.value)}
                className="border-b border-slate-300 bg-transparent px-1 py-3 outline-none focus:border-green-700"
              />

              <input
                placeholder="Typical engagement"
                value={form.engagement}
                onChange={(e) => update("engagement", e.target.value)}
                className="border-b border-slate-300 bg-transparent px-1 py-3 outline-none focus:border-green-700"
              />
            </div>

            <input
              placeholder="Where is most of your audience located?"
              value={form.audience_location}
              onChange={(e) =>
                update("audience_location", e.target.value)
              }
              className="w-full border-b border-slate-300 bg-transparent px-1 py-3 outline-none focus:border-green-700"
            />
          </section>

          <section className="space-y-5">
            <h2 className="text-xl font-black">Experience</h2>

            <input
              placeholder="Portfolio URL"
              value={form.portfolio_url}
              onChange={(e) => update("portfolio_url", e.target.value)}
              className="w-full border-b border-slate-300 bg-transparent px-1 py-3 outline-none focus:border-green-700"
            />

            <input
              placeholder="LinkedIn URL"
              value={form.linkedin_url}
              onChange={(e) => update("linkedin_url", e.target.value)}
              className="w-full border-b border-slate-300 bg-transparent px-1 py-3 outline-none focus:border-green-700"
            />

            <input
              required
              placeholder="CV / Resume URL"
              value={form.cv_url}
              onChange={(e) => update("cv_url", e.target.value)}
              className="w-full border-b border-slate-300 bg-transparent px-1 py-3 outline-none focus:border-green-700"
            />

            <textarea
              placeholder="Have you previously promoted a product, service, brand or platform?"
              value={form.previous_promotion}
              onChange={(e) =>
                update("previous_promotion", e.target.value)
              }
              rows={4}
              className="w-full border border-slate-300 p-4 outline-none focus:border-green-700"
            />

            <textarea
              required
              placeholder="Why do you want to join Fortuna Play?"
              value={form.why_fortuna}
              onChange={(e) => update("why_fortuna", e.target.value)}
              rows={5}
              className="w-full border border-slate-300 p-4 outline-none focus:border-green-700"
            />

            <textarea
              placeholder="Anything else you'd like us to know?"
              value={form.additional_information}
              onChange={(e) =>
                update("additional_information", e.target.value)
              }
              rows={4}
              className="w-full border border-slate-300 p-4 outline-none focus:border-green-700"
            />
          </section>

          {status && (
            <div className="border border-green-200 bg-green-50 p-4 text-sm text-green-800">
              {status}
            </div>
          )}

          <button
            disabled={loading}
            className="rounded-xl bg-green-700 px-8 py-4 font-black text-white hover:bg-green-800 disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Application"}
          </button>
        </form>
      </div>
    </main>
  );
}

export default function ApplyPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-white p-10 text-slate-900">
          Loading application...
        </main>
      }
    >
      <ApplicationForm />
    </Suspense>
  );
}

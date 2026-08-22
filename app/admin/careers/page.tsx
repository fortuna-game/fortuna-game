"use client";

import AdminNav from "@/components/AdminNav";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

type Application = {
  id: string;
  position: string;
  full_name: string;
  email: string;
  phone: string;
  location?: string | null;
  social_platform?: string | null;
  social_primary_url?: string | null;
  social_other_urls?: string | null;
  followers?: string | null;
  average_views?: string | null;
  engagement?: string | null;
  audience_location?: string | null;
  portfolio_url?: string | null;
  linkedin_url?: string | null;
  cv_url?: string | null;
  previous_promotion?: string | null;
  why_fortuna: string;
  additional_information?: string | null;
  status: string;
  created_at: string;
  updated_at?: string;
};

const statusOptions = [
  "new",
  "reviewing",
  "shortlisted",
  "interview",
  "accepted",
  "rejected",
];

function statusLabel(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export default function AdminCareersPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [selected, setSelected] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [updating, setUpdating] = useState(false);

  async function loadApplications() {
    setLoading(true);
    setMessage("");

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const token = session?.access_token;

      const res = await fetch("/api/admin/careers", {
        headers: {
          Authorization: `Bearer ${token || ""}`,
        },
        cache: "no-store",
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json?.error || "Could not load applications.");
      }

      setApplications(json.applications || []);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not load applications."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadApplications();
  }, []);

  async function updateStatus(id: string, status: string) {
    setUpdating(true);
    setMessage("");

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const res = await fetch("/api/admin/careers", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${session?.access_token || ""}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, status }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json?.error || "Could not update status.");
      }

      setApplications((current) =>
        current.map((application) =>
          application.id === id ? json.application : application
        )
      );

      setSelected((current) =>
        current?.id === id ? json.application : current
      );

      setMessage("Application status updated.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not update status."
      );
    } finally {
      setUpdating(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#071A33] px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <AdminNav />

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-green-300">
              RECRUITMENT
            </p>

            <h1 className="mt-2 text-4xl font-black text-[#4D94F5]">
              Careers Applications
            </h1>

            <p className="mt-2 text-[#9AAAC1]">
              Review applicants, social reach, experience and hiring status.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadApplications()}
            className="rounded-xl bg-[#3F82DD] px-5 py-3 font-black text-black"
          >
            Refresh
          </button>
        </div>

        {message && (
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-[#C4CFDE]">
            {message}
          </div>
        )}

        {loading ? (
          <div className="mt-8 rounded-3xl border border-[#2A5688] bg-[#0B2545]/70 p-8 text-center">
            Loading applications...
          </div>
        ) : applications.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-[#2A5688] bg-[#0B2545]/70 p-8 text-center">
            No career applications yet.
          </div>
        ) : (
          <div className="mt-8 overflow-x-auto rounded-3xl border border-[#2A5688]">
            <table className="w-full min-w-[1250px] text-left">
              <thead className="bg-[#3F82DD] text-black">
                <tr>
                  <th className="p-4">Applicant</th>
                  <th className="p-4">Position</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Platform</th>
                  <th className="p-4">Followers</th>
                  <th className="p-4">Avg. Views</th>
                  <th className="p-4">Engagement</th>
                  <th className="p-4">Audience</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Applied</th>
                  <th className="p-4">Action</th>
                </tr>
              </thead>

              <tbody>
                {applications.map((application) => (
                  <tr
                    key={application.id}
                    className="border-t border-[#38BDF8]/15"
                  >
                    <td className="p-4">
                      <button
                        type="button"
                        onClick={() => setSelected(application)}
                        className="text-left"
                      >
                        <p className="font-black text-[#66A7FF] hover:underline">
                          {application.full_name}
                        </p>
                        <p className="text-xs text-[#8295B0]">
                          {application.email}
                        </p>
                      </button>
                    </td>

                    <td className="p-4 font-bold">
                      {application.position}
                    </td>

                    <td className="p-4">
                      {application.phone || "-"}
                    </td>

                    <td className="p-4">
                      {application.social_platform || "-"}
                    </td>

                    <td className="p-4">
                      {application.followers || "-"}
                    </td>

                    <td className="p-4">
                      {application.average_views || "-"}
                    </td>

                    <td className="p-4">
                      {application.engagement || "-"}
                    </td>

                    <td className="p-4">
                      {application.audience_location || "-"}
                    </td>

                    <td className="p-4">
                      <select
                        value={application.status}
                        disabled={updating}
                        onChange={(e) =>
                          void updateStatus(
                            application.id,
                            e.target.value
                          )
                        }
                        className="rounded-lg border border-white/10 bg-[#071A33] px-3 py-2 text-sm"
                      >
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>
                            {statusLabel(status)}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="p-4 text-sm text-[#8295B0]">
                      {new Date(
                        application.created_at
                      ).toLocaleDateString()}
                    </td>

                    <td className="p-4">
                      <button
                        type="button"
                        onClick={() => setSelected(application)}
                        className="rounded-lg border border-[#4D94F5]/30 px-3 py-2 text-sm font-black text-[#66A7FF]"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selected && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 p-4">
            <div className="mx-auto max-w-4xl rounded-3xl border border-[#2A5688] bg-[#071A33] p-6 shadow-2xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-green-300">
                    APPLICATION
                  </p>

                  <h2 className="mt-2 text-3xl font-black">
                    {selected.full_name}
                  </h2>

                  <p className="mt-1 text-[#9AAAC1]">
                    {selected.position}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="rounded-xl border border-white/10 px-4 py-2 font-black"
                >
                  Close
                </button>
              </div>

              <div className="mt-8 grid gap-8 md:grid-cols-2">
                <section>
                  <h3 className="text-lg font-black text-[#FFD54A]">
                    Personal Information
                  </h3>

                  <div className="mt-4 space-y-3 text-sm">
                    <p><b>Email:</b> {selected.email}</p>
                    <p><b>Phone:</b> {selected.phone}</p>
                    <p><b>Location:</b> {selected.location || "-"}</p>
                    <p><b>Status:</b> {statusLabel(selected.status)}</p>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-black text-[#FFD54A]">
                    Social Presence
                  </h3>

                  <div className="mt-4 space-y-3 text-sm">
                    <p><b>Platform:</b> {selected.social_platform || "-"}</p>
                    <p><b>Followers:</b> {selected.followers || "-"}</p>
                    <p><b>Average views/reach:</b> {selected.average_views || "-"}</p>
                    <p><b>Engagement:</b> {selected.engagement || "-"}</p>
                    <p><b>Audience:</b> {selected.audience_location || "-"}</p>

                    {selected.social_primary_url && (
                      <p>
                        <b>Primary:</b>{" "}
                        <a
                          href={selected.social_primary_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#66A7FF] hover:underline"
                        >
                          Open profile
                        </a>
                      </p>
                    )}

                    {selected.social_other_urls && (
                      <p className="whitespace-pre-wrap">
                        <b>Other profiles:</b>{" "}
                        {selected.social_other_urls}
                      </p>
                    )}
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-black text-[#FFD54A]">
                    Experience & Links
                  </h3>

                  <div className="mt-4 space-y-3 text-sm">
                    {selected.cv_url && (
                      <p>
                        <b>CV:</b>{" "}
                        <a
                          href={selected.cv_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#66A7FF] hover:underline"
                        >
                          Open CV
                        </a>
                      </p>
                    )}

                    {selected.portfolio_url && (
                      <p>
                        <b>Portfolio:</b>{" "}
                        <a
                          href={selected.portfolio_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#66A7FF] hover:underline"
                        >
                          Open portfolio
                        </a>
                      </p>
                    )}

                    {selected.linkedin_url && (
                      <p>
                        <b>LinkedIn:</b>{" "}
                        <a
                          href={selected.linkedin_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#66A7FF] hover:underline"
                        >
                          Open LinkedIn
                        </a>
                      </p>
                    )}
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-black text-[#FFD54A]">
                    Application
                  </h3>

                  <div className="mt-4 space-y-5 text-sm leading-6">
                    <div>
                      <p className="font-black">Why Fortuna Play?</p>
                      <p className="mt-1 whitespace-pre-wrap text-[#C4CFDE]">
                        {selected.why_fortuna}
                      </p>
                    </div>

                    <div>
                      <p className="font-black">
                        Previous Promotion Experience
                      </p>
                      <p className="mt-1 whitespace-pre-wrap text-[#C4CFDE]">
                        {selected.previous_promotion || "-"}
                      </p>
                    </div>

                    <div>
                      <p className="font-black">
                        Additional Information
                      </p>
                      <p className="mt-1 whitespace-pre-wrap text-[#C4CFDE]">
                        {selected.additional_information || "-"}
                      </p>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const positions: Record<string, string> = {
  "social-media-growth":
    "Social Media Growth & Associate",
  "customer-support":
    "Customer Support Representative",
  "digital-marketing":
    "Digital Marketing Associate",
  "community-manager":
    "Community Manager",
  "operations-assistant":
    "Operations Assistant",
};

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const position = positions[String(body.position || "")];

    const full_name = String(body.full_name || "").trim();
    const email = String(body.email || "").trim();
    const phone = String(body.phone || "").trim();
    const why_fortuna = String(body.why_fortuna || "").trim();

    if (!position || !full_name || !email || !phone || !why_fortuna) {
      return NextResponse.json(
        { error: "Please complete all required fields." },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from("career_applications")
      .insert({
        position,
        full_name,
        email,
        phone,
        location: String(body.location || "").trim(),
        social_platform: String(body.social_platform || "").trim(),
        social_primary_url: String(body.social_primary_url || "").trim(),
        social_other_urls: String(body.social_other_urls || "").trim(),
        followers: String(body.followers || "").trim(),
        average_views: String(body.average_views || "").trim(),
        engagement: String(body.engagement || "").trim(),
        audience_location: String(body.audience_location || "").trim(),
        portfolio_url: String(body.portfolio_url || "").trim(),
        linkedin_url: String(body.linkedin_url || "").trim(),
        cv_url: String(body.cv_url || "").trim(),
        previous_promotion: String(body.previous_promotion || "").trim(),
        why_fortuna,
        additional_information: String(
          body.additional_information || ""
        ).trim(),
      });

    if (error) {
      console.error("CAREER APPLICATION ERROR:", error);

      return NextResponse.json(
        { error: "Could not submit your application." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Application submitted successfully.",
    });
  } catch (error) {
    console.error("CAREERS APPLY ERROR:", error);

    return NextResponse.json(
      { error: "Could not submit your application." },
      { status: 500 }
    );
  }
}

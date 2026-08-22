import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

async function requireAdmin(req: Request) {
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return null;

  const {
    data: { user },
  } = await supabaseAdmin.auth.getUser(token);

  if (!user) return null;

  const { data: role } = await supabaseAdmin
    .from("admin_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!role || !["super_admin", "admin"].includes(role.role)) {
    return null;
  }

  return user;
}

export async function GET(req: Request) {
  try {
    const admin = await requireAdmin(req);

    if (!admin) {
      return NextResponse.json(
        { error: "Admin access denied." },
        { status: 403 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("career_applications")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      applications: data || [],
    });
  } catch (error) {
    console.error("ADMIN CAREERS GET ERROR:", error);

    return NextResponse.json(
      { error: "Could not load career applications." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const admin = await requireAdmin(req);

    if (!admin) {
      return NextResponse.json(
        { error: "Admin access denied." },
        { status: 403 }
      );
    }

    const body = await req.json();

    const id = String(body.id || "").trim();
    const status = String(body.status || "").trim().toLowerCase();

    const allowedStatuses = [
      "new",
      "reviewing",
      "shortlisted",
      "interview",
      "accepted",
      "rejected",
    ];

    if (!id || !allowedStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid application or status." },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("career_applications")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      application: data,
    });
  } catch (error) {
    console.error("ADMIN CAREERS PATCH ERROR:", error);

    return NextResponse.json(
      { error: "Could not update application status." },
      { status: 500 }
    );
  }
}

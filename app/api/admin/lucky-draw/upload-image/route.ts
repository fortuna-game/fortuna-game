import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

async function requireAdmin(req: Request) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");

  if (!token) return false;

  const {
    data: { user },
    error: userError,
  } = await supabaseAdmin.auth.getUser(token);

  if (userError || !user) return false;

  const { data: role, error: roleError } = await supabaseAdmin
    .from("admin_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (roleError) return false;

  return Boolean(
    role && ["super_admin", "admin"].includes(role.role)
  );
}

export async function POST(req: Request) {
  try {
    const ok = await requireAdmin(req);

    if (!ok) {
      return NextResponse.json(
        { error: "Admin access denied." },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Please select an image or video file." },
        { status: 400 }
      );
    }

    const isImage = file.type.startsWith("image/");
    const isVideo =
      file.type.startsWith("video/") ||
      ["video/mp4", "video/webm", "video/quicktime"].includes(file.type);

    if (!isImage && !isVideo) {
      return NextResponse.json(
        { error: "Only image and video files are allowed." },
        { status: 400 }
      );
    }

    const maxSize = isVideo
      ? 50 * 1024 * 1024
      : 10 * 1024 * 1024;

    if (file.size > maxSize) {
      return NextResponse.json(
        {
          error: `${isVideo ? "Video" : "Image"} must be smaller than ${
            isVideo ? "50MB" : "10MB"
          }.`,
        },
        { status: 400 }
      );
    }

    const extension =
      file.name.split(".").pop()?.toLowerCase() || "jpg";

    const fileName = `lucky-draw/${crypto.randomUUID()}.${extension}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabaseAdmin.storage
      .from("lucky-draw-images")
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("STORAGE UPLOAD ERROR:", uploadError);

      return NextResponse.json(
        { error: uploadError.message },
        { status: 500 }
      );
    }

    const {
      data: { publicUrl },
    } = supabaseAdmin.storage
      .from("lucky-draw-images")
      .getPublicUrl(fileName);

    return NextResponse.json({
      success: true,
      url: publicUrl,
      type: isVideo ? "video" : "image",
    });
  } catch (error) {
    console.error("LUCKY DRAW IMAGE UPLOAD ERROR:", error);

    return NextResponse.json(
      { error: "Could not upload image." },
      { status: 500 }
    );
  }
}

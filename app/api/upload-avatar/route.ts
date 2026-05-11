import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

// Maximum file size: 5 MB
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const BUCKET = "avatars"; // must match the bucket you create in Supabase

export async function POST(req: NextRequest) {
  const supabase = await createClient();

  // ── Auth check ─────────────────────────────────────────────────────────────
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── Parse multipart body ───────────────────────────────────────────────────
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("avatar");

  // ── Handle removal (null file) ─────────────────────────────────────────────
  if (!file || file === "null") {
    // Delete the existing avatar from storage
    const path = `${user.id}/avatar`;
    await supabase.storage.from(BUCKET).remove([path]);

    // Clear avatar_url in profiles
    const { error: dbError } = await supabase
      .from("profiles")
      .update({ avatar_url: null })
      .eq("id", user.id);

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({ avatarUrl: null });
  }

  // ── Validate file ──────────────────────────────────────────────────────────
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Expected a file" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Only JPEG, PNG, WebP, or GIF images are allowed" },
      { status: 400 }
    );
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "File must be under 5 MB" },
      { status: 400 }
    );
  }

  // ── Upload to Supabase Storage ─────────────────────────────────────────────
  // Path: avatars/{userId}/avatar.{ext}
  const ext = file.type.split("/")[1].replace("jpeg", "jpg");
  const storagePath = `${user.id}/avatar.${ext}`;

  const arrayBuffer = await file.arrayBuffer();

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, arrayBuffer, {
      contentType: file.type,
      upsert: true, // overwrite on re-upload
    });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  // ── Get public URL ─────────────────────────────────────────────────────────
  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);

  // Bust the CDN cache by appending a timestamp query param
  const avatarUrl = `${publicUrl}?t=${Date.now()}`;

  // ── Persist URL to profiles table ─────────────────────────────────────────
  const { error: dbError } = await supabase
    .from("profiles")
    .update({ avatar_url: avatarUrl })
    .eq("id", user.id);

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ avatarUrl });
}
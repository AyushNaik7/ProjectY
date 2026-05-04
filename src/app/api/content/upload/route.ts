import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { requireUser } from "@/lib/request-auth";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function POST(req: Request) {
  const auth = await requireUser(req as any);
  if (auth.error) return auth.error;

  const form = await (req as any).formData();
  const file = form.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "file is required" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const fileBuffer = Buffer.from(arrayBuffer);
  const ext = file.name.split(".").pop() || "bin";
  const objectPath = `${auth.user.id}/${Date.now()}-${randomUUID()}.${ext}`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from("creator-content")
    .upload(objectPath, fileBuffer, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data } = supabaseAdmin.storage.from("creator-content").getPublicUrl(objectPath);

  return NextResponse.json({
    success: true,
    content: {
      id: randomUUID(),
      fileName: file.name,
      fileUrl: data.publicUrl,
      mimeType: file.type,
      size: file.size,
    },
  });
}

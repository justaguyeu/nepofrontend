/**
 * Supabase client for direct-from-browser media uploads (avatars, post
 * images/video, reels, story media). Requires NEXT_PUBLIC_SUPABASE_URL and
 * NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local, plus a public "nepo-media"
 * storage bucket with a policy allowing authenticated inserts.
 *
 * For server-trusted uploads instead, use api.uploadMedia() in api.ts,
 * which proxies through Django using the service-role key.
 */
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const BUCKET = process.env.NEXT_PUBLIC_SUPABASE_MEDIA_BUCKET || "nepo-media";

export async function uploadToSupabase(file: File, folder: string, userId: string) {
  const ext = file.name.split(".").pop();
  const path = `${folder}/${userId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

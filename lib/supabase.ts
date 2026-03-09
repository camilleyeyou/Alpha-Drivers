import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Server-only Supabase client with service role key (bypasses RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

const BUCKET = "driver-documents";
const SIGNED_URL_EXPIRY = 3600; // 1 hour

/**
 * Upload a document to Supabase Storage.
 * Path format: {driverId}/{documentType}
 */
export async function uploadDocument(
  file: Buffer,
  path: string,
  contentType: string
) {
  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(path, file, {
      contentType,
      upsert: true,
    });

  if (error) throw new Error(`Upload failed: ${error.message}`);
  return data.path;
}

/**
 * Get a signed URL for a private document.
 */
export async function getSignedUrl(path: string) {
  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET)
    .createSignedUrl(path, SIGNED_URL_EXPIRY);

  if (error) throw new Error(`Signed URL failed: ${error.message}`);
  return data.signedUrl;
}

/**
 * Delete a document from Supabase Storage.
 */
export async function deleteDocument(path: string) {
  const { error } = await supabaseAdmin.storage.from(BUCKET).remove([path]);
  if (error) throw new Error(`Delete failed: ${error.message}`);
}

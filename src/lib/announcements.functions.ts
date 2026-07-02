import { createServerFn } from "@tanstack/react-start";

export type AnnouncementListItem = {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  signed_image_url: string;
  category: string | null;
  event_date: string | null;
  cta_label: string | null;
  cta_url: string | null;
  created_at: string;
};

// Public: list announcements with freshly-signed image URLs.
// Uses admin client server-side only to (a) read rows and (b) sign storage URLs if service role key is available.
// Otherwise, falls back to the public supabase client and public URLs to prevent local crashes.
export const listAnnouncements = createServerFn({ method: "GET" }).handler(
  async (): Promise<AnnouncementListItem[]> => {
    const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    const client = hasServiceKey
      ? (await import("@/integrations/supabase/client.server")).supabaseAdmin
      : (await import("@/integrations/supabase/client")).supabase;

    const { data, error } = await client
      .from("announcements")
      .select(
        "id, title, description, image_url, event_date, cta_label, cta_url, created_at, category",
      )
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    if (!data || data.length === 0) return [];

    const resolvedData = await Promise.all(data.map(async (r) => {
      if (!r.image_url) {
        return { ...r, signed_image_url: "" };
      }

      // 1. If it's already a full HTTP(S) URL, return it directly.
      if (r.image_url.startsWith("http://") || r.image_url.startsWith("https://")) {
        return { ...r, signed_image_url: r.image_url };
      }

      // 2. Determine which bucket to use based on path structure.
      // CmsTable uploads under "announcements/...", while the legacy posters uploader uses user UUID paths.
      const bucket = r.image_url.startsWith("announcements/") ? "media" : "posters";

      try {
        const { data: signed, error: signErr } = await client.storage
          .from(bucket)
          .createSignedUrl(r.image_url, 60 * 60 * 24); // 24h
        
        if (signErr || !signed?.signedUrl) {
          throw new Error(signErr?.message || "Failed to create signed URL");
        }
        return { ...r, signed_image_url: signed.signedUrl };
      } catch (err) {
        console.warn(`[Supabase] Failed to sign URL for path: ${r.image_url} in bucket: ${bucket}, falling back to public URL:`, err);
        const { data: { publicUrl } } = client.storage.from(bucket).getPublicUrl(r.image_url);
        return { ...r, signed_image_url: publicUrl };
      }
    }));

    return resolvedData;
  },
);

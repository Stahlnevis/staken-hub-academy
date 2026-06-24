import { createServerFn } from "@tanstack/react-start";

export type AnnouncementListItem = {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  signed_image_url: string;
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
        "id, title, description, image_url, event_date, cta_label, cta_url, created_at",
      )
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    if (!data || data.length === 0) return [];

    const paths = data.map((r) => r.image_url);
    const byPath = new Map<string, string>();

    try {
      const { data: signed, error: signErr } = await client.storage
        .from("posters")
        .createSignedUrls(paths, 60 * 60 * 24); // 24h

      if (signErr) {
        throw new Error(signErr.message);
      }

      signed?.forEach((s, i) => {
        if (s.signedUrl) byPath.set(paths[i], s.signedUrl);
      });
    } catch (err) {
      console.warn("[Supabase] Failed to create signed URLs, falling back to public URLs:", err);
      paths.forEach((p) => {
        const { data: { publicUrl } } = client.storage.from("posters").getPublicUrl(p);
        byPath.set(p, publicUrl);
      });
    }

    return data.map((r) => ({
      ...r,
      signed_image_url: byPath.get(r.image_url) ?? "",
    }));
  },
);

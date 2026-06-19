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
// Uses admin client server-side only to (a) read rows and (b) sign storage URLs.
export const listAnnouncements = createServerFn({ method: "GET" }).handler(
  async (): Promise<AnnouncementListItem[]> => {
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );

    const { data, error } = await supabaseAdmin
      .from("announcements")
      .select(
        "id, title, description, image_url, event_date, cta_label, cta_url, created_at",
      )
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    if (!data || data.length === 0) return [];

    const paths = data.map((r) => r.image_url);
    const { data: signed, error: signErr } = await supabaseAdmin.storage
      .from("posters")
      .createSignedUrls(paths, 60 * 60 * 24); // 24h

    if (signErr) throw new Error(signErr.message);

    const byPath = new Map<string, string>();
    signed?.forEach((s, i) => {
      if (s.signedUrl) byPath.set(paths[i], s.signedUrl);
    });

    return data.map((r) => ({
      ...r,
      signed_image_url: byPath.get(r.image_url) ?? "",
    }));
  },
);

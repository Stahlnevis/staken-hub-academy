import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Calendar, Megaphone, ExternalLink } from "lucide-react";

import { SiteLayout, PageHero } from "@/components/SiteLayout";
import { listAnnouncements } from "@/lib/announcements.functions";
import { supabase } from "@/integrations/supabase/client";

const announcementsQueryOptions = {
  queryKey: ["announcements"] as const,
  queryFn: () => listAnnouncements(),
};

export const Route = createFileRoute("/announcements")({
  head: () => ({
    meta: [
      { title: "Announcements & Posters — Staken Hub Academy" },
      {
        name: "description",
        content:
          "Latest bootcamp announcements, programme posters and event flyers from Staken Hub Academy.",
      },
      { property: "og:title", content: "Announcements — Staken Hub Academy" },
      {
        property: "og:description",
        content:
          "See our latest bootcamps, programming workshops and upcoming activities.",
      },
    ],
  }),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(
      announcementsQueryOptions(listAnnouncements),
    );
  },
  component: AnnouncementsPage,
});

function AnnouncementsPage() {
  const fn = useServerFn(listAnnouncements);
  const { data: posters } = useSuspenseQuery(announcementsQueryOptions(fn));
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", u.user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (mounted) setIsAdmin(!!roles);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <SiteLayout>
      <PageHero
        eyebrow="What's new"
        title="Announcements & Posters"
        subtitle="Bootcamps, programming workshops, scholarships and other activities — all the latest from Staken Hub Academy."
      />
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
        {isAdmin && (
          <div className="mb-8 flex justify-end">
            <Link
              to="/admin/posters"
              className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold hover:bg-teal-deep transition-colors"
            >
              <Megaphone className="size-4" /> Manage posters
            </Link>
          </div>
        )}

        {posters.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border rounded-2xl">
            <Megaphone className="size-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">
              No announcements yet. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {posters.map((p) => (
              <article
                key={p.id}
                className="group bg-card rounded-2xl overflow-hidden border border-border shadow-elegant hover:shadow-xl transition-all flex flex-col"
              >
                <div className="aspect-[3/4] bg-muted overflow-hidden">
                  <img
                    src={p.signed_image_url}
                    alt={p.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6 flex flex-col flex-1">
                  {p.event_date && (
                    <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary mb-2">
                      <Calendar className="size-3.5" />
                      {new Date(p.event_date).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                  )}
                  <h2 className="font-display font-bold text-lg text-foreground leading-tight mb-2">
                    {p.title}
                  </h2>
                  {p.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">
                      {p.description}
                    </p>
                  )}
                  {p.cta_url && p.cta_label && (
                    <a
                      href={p.cta_url}
                      target={p.cta_url.startsWith("http") ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      className="mt-auto inline-flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground px-4 py-2.5 text-sm font-semibold hover:bg-teal-deep transition-colors"
                    >
                      {p.cta_label}
                      {p.cta_url.startsWith("http") && (
                        <ExternalLink className="size-3.5" />
                      )}
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </SiteLayout>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Calendar, Megaphone, ExternalLink } from "lucide-react";

import { SiteLayout, PageHero } from "@/components/SiteLayout";
import { listAnnouncements, type AnnouncementListItem } from "@/lib/announcements.functions";
import { supabase } from "@/integrations/supabase/client";

const eventsQueryOptions = {
  queryKey: ["announcements"] as const,
  queryFn: () => listAnnouncements(),
};

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Events & Posters — Staken Hub Academy" },
      {
        name: "description",
        content:
          "Previous, current and upcoming events, workshops and bootcamp posters from Staken Hub Academy.",
      },
      { property: "og:title", content: "Events — Staken Hub Academy" },
      {
        property: "og:description",
        content:
          "See past, current and upcoming bootcamp posters and workshops at Staken Hub Academy.",
      },
      { property: "og:url", content: "/events" },
    ],
    links: [{ rel: "canonical", href: "/events" }],
  }),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(eventsQueryOptions);
  },
  component: EventsPage,
});

type Bucket = "previous" | "current" | "future";

const STATIC_PROGRAMME_EVENTS = [
  // Previous (completed) programmes
  {
    id: "prev-1",
    title: "Digital Literacy",
    description: "Foundational computer skills, workplace productivity software, and digital communication basics.",
    category: "previous" as const,
    event_date: "2026-04-10",
    signed_image_url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80",
    cta_url: "/apply",
    cta_label: "View Program Details"
  },
  {
    id: "prev-2",
    title: "Artificial Intelligence Awareness",
    description: "Introductory sessions on generative AI tools, prompt optimization, and AI applications in day-to-day work.",
    category: "previous" as const,
    event_date: "2026-05-15",
    signed_image_url: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=800&q=80",
    cta_url: "/apply",
    cta_label: "View Program Details"
  },
  {
    id: "prev-3",
    title: "Networking",
    description: "Overview of corporate networking architectures, switching/routing basics, and IP routing configuration.",
    category: "previous" as const,
    event_date: "2026-06-01",
    signed_image_url: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80",
    cta_url: "/apply",
    cta_label: "View Program Details"
  },

  // Current programmes
  {
    id: "curr-1",
    title: "Cybersecurity",
    description: "Intensive training in cyber defense strategies, threat detection, penetration testing, and ethical hacking protocols.",
    category: "current" as const,
    event_date: null,
    signed_image_url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80",
    cta_url: "/apply",
    cta_label: "Apply to Join"
  },
  {
    id: "curr-2",
    title: "Programming Languages",
    description: "Foundational programming bootcamp training in logical design, algorithm setup, and program testing.",
    category: "current" as const,
    event_date: null,
    signed_image_url: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80",
    cta_url: "/apply",
    cta_label: "Apply to Join"
  },
  {
    id: "curr-3",
    title: "Software Engineering",
    description: "Full-stack software construction bootcamp covering modern front-end/back-end libraries, databases, and APIs.",
    category: "current" as const,
    event_date: null,
    signed_image_url: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80",
    cta_url: "/apply",
    cta_label: "Apply to Join"
  },

  // Future programmes
  {
    id: "fut-1",
    title: "Programming Languages (C++ & Python)",
    description: "Upcoming 4-week cohort launching July 01, 2026. Get hands-on with basic logic, algorithm layout, and programming concepts in Python and C++.",
    category: "future" as const,
    event_date: "2026-07-01",
    signed_image_url: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80",
    cta_url: "/apply",
    cta_label: "Apply Now"
  },
  {
    id: "fut-2",
    title: "Robotics and Coding for Kids",
    description: "Weekday workshops starting August Holiday, 2026. A creative course introducing youth to Scratch coding, computational logic, and basic electronics.",
    category: "future" as const,
    event_date: "2026-08-01",
    signed_image_url: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80",
    cta_url: "/apply",
    cta_label: "Apply Now"
  }
];

function bucketFor(eventDate: string | null): Bucket {
  if (!eventDate) return "current";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(eventDate);
  d.setHours(0, 0, 0, 0);
  if (d.getTime() === today.getTime()) return "current";
  return d.getTime() < today.getTime() ? "previous" : "future";
}

function EventsPage() {
  const { data: posters } = useSuspenseQuery(eventsQueryOptions);
  const [tab, setTab] = useState<Bucket>("future");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", u.user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (mounted) setIsAdmin(!!data);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const grouped = useMemo(() => {
    const g: Record<Bucket, AnnouncementListItem[]> = {
      previous: [],
      current: [],
      future: [],
    };

    // Add static default events first
    STATIC_PROGRAMME_EVENTS.forEach((item) => {
      g[item.category].push({
        id: item.id,
        title: item.title,
        description: item.description,
        event_date: item.event_date,
        signed_image_url: item.signed_image_url,
        cta_url: item.cta_url,
        cta_label: item.cta_label,
      } as any);
    });

    // Merge in dynamic posters
    posters.forEach((p) => {
      const bucket = bucketFor(p.event_date);
      g[bucket].push(p);
    });

    // future: earliest first; previous: most recent first; current: newest first
    g.future.sort(
      (a, b) =>
        new Date(a.event_date ?? 0).getTime() -
        new Date(b.event_date ?? 0).getTime(),
    );
    g.previous.sort(
      (a, b) =>
        new Date(b.event_date ?? 0).getTime() -
        new Date(a.event_date ?? 0).getTime(),
    );
    g.current.sort(
      (a, b) =>
        new Date(b.event_date ?? 0).getTime() -
        new Date(a.event_date ?? 0).getTime(),
    );
    return g;
  }, [posters]);

  const current = grouped[tab];

  return (
    <SiteLayout>
      <PageHero
        eyebrow="Events & Posters"
        title="Build, learn and connect"
        subtitle="Previous, current and upcoming bootcamps, workshops and activities at Staken Hub Academy."
      />
      <section className="mx-auto w-full max-w-none px-6 md:px-12 lg:px-16 py-12">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
          <div role="tablist" className="inline-flex rounded-full bg-muted p-1 border border-border">
            {(
              [
                { id: "previous", label: "Previous", count: grouped.previous.length },
                { id: "current", label: "Current", count: grouped.current.length },
                { id: "future", label: "Future", count: grouped.future.length },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
                className={`px-4 sm:px-5 py-2 text-xs sm:text-sm font-semibold rounded-full transition-colors ${
                  tab === t.id
                    ? "bg-primary text-primary-foreground shadow-elegant"
                    : "text-muted-foreground hover:text-primary"
                }`}
              >
                {t.label}
                <span className="ml-1.5 opacity-70">({t.count})</span>
              </button>
            ))}
          </div>

          {isAdmin && (
            <Link
              to="/admin/posters"
              className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold hover:bg-teal-deep transition-colors"
            >
              <Megaphone className="size-4" /> Manage posters
            </Link>
          )}
        </div>

        {current.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border rounded-2xl">
            <Megaphone className="size-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">
              {tab === "previous" && "No past events yet."}
              {tab === "current" && "Nothing happening today."}
              {tab === "future" && "No upcoming events posted yet. Check back soon!"}
            </p>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {current.map((p) => (
              <article
                key={p.id}
                className="group bg-card rounded-2xl overflow-hidden border border-border shadow-elegant hover:shadow-xl transition-all flex flex-col"
              >
                <div className="aspect-[16/10] bg-muted overflow-hidden">
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
                  {p.cta_url && p.cta_label && tab !== "previous" && (
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

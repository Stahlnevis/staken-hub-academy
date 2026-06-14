import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageHero } from "@/components/SiteLayout";
import { EVENTS } from "@/lib/programmes";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Events & Workshops — Staken Hub Academy" },
      { name: "description", content: "Upcoming hackathons, workshops, webinars and AI seminars at Staken Hub Academy." },
      { property: "og:title", content: "Events — Staken Hub Academy" },
      { property: "og:description", content: "Hackathons, workshops and webinars." },
      { property: "og:url", content: "/events" },
    ],
    links: [{ rel: "canonical", href: "/events" }],
  }),
  component: EventsPage,
});

function EventsPage() {
  return (
    <SiteLayout>
      <PageHero
        eyebrow="Events & Workshops"
        title="Build, learn and connect"
        subtitle="Hackathons, workshops, cybersecurity awareness sessions and AI seminars across Africa."
      />
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 grid md:grid-cols-2 gap-6">
          {EVENTS.map((e) => (
            <article
              key={e.title}
              className="bg-card border border-border rounded-2xl p-8 hover:border-mint/40 hover:shadow-soft transition-all"
            >
              <div className="flex flex-wrap items-center gap-3 mb-4 text-xs">
                <span className="px-2.5 py-1 rounded-full bg-mint/20 text-primary font-semibold uppercase tracking-wider">
                  {e.type}
                </span>
                <span className="text-muted-foreground">{e.date}</span>
                <span className="text-muted-foreground">• {e.location}</span>
              </div>
              <h3 className="text-xl font-semibold text-primary mb-2">{e.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{e.description}</p>
            </article>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}

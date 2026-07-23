import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout, PageHero } from "@/components/SiteLayout";
import * as LucideIcons from "lucide-react";
import { BookOpen } from "lucide-react";
import { useCmsRows } from "@/lib/useCmsRows";
import { DynamicIcon } from "@/components/DynamicIcon";

type Programme = {
  id: string;
  slug: string;
  title: string;
  category: string | null;
  duration: string | null;
  level: string | null;
  summary: string | null;
  description: string | null;
  cover_image: string | null;
};

export const Route = createFileRoute("/programmes/")({
  head: () => ({
    meta: [
      { title: "Programmes — Staken Hub Academy" },
      {
        name: "description",
        content:
          "Explore our specialised programmes in Cybersecurity, Networking, Programming, AI, Digital Literacy, and Robotics for Kids.",
      },
      { property: "og:title", content: "Programmes — Staken Hub Academy" },
      { property: "og:description", content: "Specialised tracks for the digital economy." },
      { property: "og:url", content: "/programmes" },
    ],
    links: [{ rel: "canonical", href: "/programmes" }],
  }),
  component: ProgrammesPage,
});

function ProgrammesPage() {
  const { rows, loading } = useCmsRows<Programme>("programmes", { orderBy: "sort_order" });
  return (
    <SiteLayout>
      <PageHero
        eyebrow="Programmes"
        title="Specialised tracks for the digital economy"
        subtitle="Practical, hands-on training to equip youth with the real-world skills needed for today's digital economy."
      />
      <section className="py-20">
        <div className="mx-auto w-full max-w-none px-6 md:px-12 lg:px-16">
          {loading ? (
            <p className="text-center text-muted-foreground">Loading programmes…</p>
          ) : rows.length === 0 ? (
            <EmptyState label="programmes" />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
              {rows.map((p) => (
                <article
                  key={p.id}
                  className="group bg-card border border-border rounded-2xl overflow-hidden hover:border-mint/50 hover:shadow-elegant hover:-translate-y-1 transition-all"
                >
                  {p.cover_image && (
                    <div className="aspect-[16/10] bg-primary-soft overflow-hidden">
                      <img src={p.cover_image} alt={p.title} className="size-full object-cover group-hover:scale-105 transition-transform" />
                    </div>
                  )}
                  <div className="p-7">
                    {p.category && (p.category in LucideIcons) && (
                      <div className="size-11 bg-primary-soft text-primary rounded-xl grid place-items-center mb-4 group-hover:bg-mint transition-colors">
                        <DynamicIcon name={p.category} className="size-5" />
                      </div>
                    )}
                    <h3 className="text-xl font-semibold text-primary mb-2">{p.title}</h3>
                    <p className="text-sm text-muted-foreground mb-5 leading-relaxed">{p.summary ?? p.description}</p>
                    <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground mb-6">
                      {p.duration && (
                        <span className="inline-flex items-center gap-1.5">
                          <span className="size-1.5 rounded-full bg-mint" /> {p.duration}
                        </span>
                      )}
                      {p.level && (
                        <span className="inline-flex items-center gap-1.5">
                          <span className="size-1.5 rounded-full bg-amber-warm" /> {p.level}
                        </span>
                      )}
                    </div>
                    <Link
                      to="/programmes/$slug"
                      params={{ slug: p.slug }}
                      className="inline-flex items-center justify-center w-full py-3 rounded-lg border border-primary/15 font-semibold text-primary hover:bg-primary hover:text-primary-foreground transition-colors text-sm"
                    >
                      Learn More
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="text-center py-16 max-w-md mx-auto">
      <BookOpen className="mx-auto size-10 text-mint mb-4" />
      <p className="text-muted-foreground">
        No {label} published yet. Check back soon — we're preparing exciting new offerings.
      </p>
    </div>
  );
}

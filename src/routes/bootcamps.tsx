import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout, PageHero } from "@/components/SiteLayout";
import { ArrowUpRight, Rocket } from "lucide-react";
import { useCmsRows } from "@/lib/useCmsRows";

type Bootcamp = {
  id: string;
  slug: string;
  title: string;
  duration: string | null;
  level: string | null;
  price: string | null;
  summary: string | null;
  start_date: string | null;
  end_date: string | null;
  seats: number | null;
};

export const Route = createFileRoute("/bootcamps")({
  head: () => ({
    meta: [
      { title: "Bootcamps — Staken Hub Academy" },
      { name: "description", content: "Intensive bootcamps to launch your career in tech in weeks, not years." },
      { property: "og:title", content: "Bootcamps — Staken Hub Academy" },
      { property: "og:description", content: "Career-launch bootcamps in cybersecurity, code and AI." },
      { property: "og:url", content: "/bootcamps" },
    ],
    links: [{ rel: "canonical", href: "/bootcamps" }],
  }),
  component: BootcampsPage,
});

function BootcampsPage() {
  const { rows, loading } = useCmsRows<Bootcamp>("bootcamps", { orderBy: "start_date" });
  return (
    <SiteLayout>
      <PageHero
        eyebrow="Bootcamps"
        title="Career-launch bootcamps"
        subtitle="Intensive cohorts with mentor support, capstone projects and placement coaching."
      />
      <section className="py-20">
        <div className="mx-auto w-full max-w-none px-6 md:px-12 lg:px-16">
          {loading ? (
            <p className="text-center text-muted-foreground">Loading bootcamps…</p>
          ) : rows.length === 0 ? (
            <div className="text-center py-16 max-w-md mx-auto">
              <Rocket className="mx-auto size-10 text-mint mb-4" />
              <p className="text-muted-foreground">
                No bootcamps scheduled at the moment. Follow us for the next intake announcement.
              </p>
            </div>
          ) : (
            <div className="bg-card rounded-2xl border border-border overflow-hidden divide-y divide-border">
              {rows.map((c) => (
                <div
                  key={c.id}
                  className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_auto] gap-4 md:gap-6 items-center px-5 md:px-7 py-5 md:py-6 hover:bg-primary-soft/40 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-primary text-lg">{c.title}</p>
                    {c.summary && <p className="text-sm text-muted-foreground mt-1">{c.summary}</p>}
                    {c.level && (
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">{c.level}</p>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {c.start_date ? new Date(c.start_date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "TBA"}
                  </p>
                  <p className="text-sm text-muted-foreground">{c.duration ?? "—"}</p>
                  <Link
                    to="/apply"
                    className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full border border-primary/15 text-sm font-semibold text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    Apply <ArrowUpRight className="size-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout, PageHero } from "@/components/SiteLayout";
import { COHORTS } from "@/lib/programmes";
import { ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/bootcamps")({
  head: () => ({
    meta: [
      { title: "Bootcamps — Staken Hub Academy" },
      {
        name: "description",
        content:
          "Intensive bootcamps to launch your career in tech in weeks, not years.",
      },
      { property: "og:title", content: "Bootcamps — Staken Hub Academy" },
      { property: "og:description", content: "Career-launch bootcamps in cybersecurity, code and AI." },
      { property: "og:url", content: "/bootcamps" },
    ],
    links: [{ rel: "canonical", href: "/bootcamps" }],
  }),
  component: BootcampsPage,
});

function BootcampsPage() {
  return (
    <SiteLayout>
      <PageHero
        eyebrow="Bootcamps"
        title="Career-launch bootcamps"
        subtitle="Intensive cohorts with mentor support, capstone projects and placement coaching."
      />
      <section className="py-20">
        <div className="mx-auto w-full max-w-none px-6 md:px-12 lg:px-16">
          <div className="bg-card rounded-2xl border border-border overflow-hidden divide-y divide-border">
            {COHORTS.map((c) => (
              <div
                key={c.programme}
                className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_auto] gap-4 md:gap-6 items-center px-5 md:px-7 py-5 md:py-6 hover:bg-primary-soft/40 transition-colors"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-primary text-lg">{c.programme}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">{c.mode}</p>
                </div>
                <p className="text-sm text-muted-foreground">{c.date}</p>
                <p className="text-sm text-muted-foreground">{c.duration}</p>
                <Link
                  to="/apply"
                  className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full border border-primary/15 text-sm font-semibold text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  Apply <ArrowUpRight className="size-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

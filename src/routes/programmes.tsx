import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout, PageHero } from "@/components/SiteLayout";
import { PROGRAMMES } from "@/lib/programmes";

export const Route = createFileRoute("/programmes")({
  head: () => ({
    meta: [
      { title: "Programmes — Staken Hub Academy" },
      {
        name: "description",
        content:
          "Explore our specialised programmes in Cybersecurity, Networking, Programming Languages, AI Awareness, Digital Literacy, and Robotics & Coding for Kids.",
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
  return (
    <SiteLayout>
      <PageHero
        eyebrow="Programmes"
        title="Specialised tracks for the digital economy"
        subtitle="Practical, hands-on training to equip youth with the real-world skills needed for today's digital economy."
      />
      <section className="py-20">
        <div className="mx-auto w-full max-w-none px-6 md:px-12 lg:px-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {PROGRAMMES.map((p) => (
            <article
              key={p.slug}
              className="group bg-card border border-border rounded-2xl p-7 hover:border-mint/50 hover:shadow-elegant hover:-translate-y-1 transition-all"
            >
              <div className="size-12 bg-primary-soft text-primary rounded-xl grid place-items-center mb-5 group-hover:bg-mint group-hover:text-primary transition-colors">
                <p.icon className="size-5" />
              </div>
              <h3 className="text-xl font-semibold text-primary mb-2">{p.title}</h3>
              <p className="text-sm text-muted-foreground mb-5 leading-relaxed">{p.description}</p>
              <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground mb-6">
                <span className="inline-flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-mint" /> {p.duration}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-amber-warm" /> {p.level}
                </span>
              </div>
              <Link
                to="/apply"
                className="inline-flex items-center justify-center w-full py-3 rounded-lg border border-primary/15 font-semibold text-primary hover:bg-primary hover:text-primary-foreground transition-colors text-sm"
              >
                Learn More
              </Link>
            </article>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}

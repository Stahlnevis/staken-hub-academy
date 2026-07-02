import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout, PageHero } from "@/components/SiteLayout";
import { Target, Eye, Users } from "lucide-react";
import { useCmsRows } from "@/lib/useCmsRows";
import { DynamicIcon } from "@/components/DynamicIcon";

type Value = { id: string; icon: string | null; title: string; description: string | null };
type TeamMember = { id: string; name: string; role: string | null; bio: string | null; photo_url: string | null; linkedin_url: string | null };

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — Staken Hub Academy" },
      {
        name: "description",
        content:
          "Staken Hub Academy is a digital skills academy equipping Africa's youth with practical, industry-relevant technology skills.",
      },
      { property: "og:title", content: "About Staken Hub Academy" },
      { property: "og:description", content: "Our vision, mission and approach." },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: AboutPage,
});

function AboutPage() {
  const { rows: values } = useCmsRows<Value>("about_values", { orderBy: "sort_order" });
  const { rows: team } = useCmsRows<TeamMember>("team_members", { orderBy: "sort_order" });
  return (
    <SiteLayout>
      <PageHero
        eyebrow="About Us"
        title="A new generation of African digital talent"
        subtitle="We provide hands-on, project-based learning and mentorship in emerging technologies and digital careers."
      />

      <section className="py-20">
        <div className="mx-auto w-full max-w-none px-6 md:px-12 lg:px-16 grid md:grid-cols-2 gap-8">
          <div className="bg-card border border-border rounded-2xl p-8 shadow-soft">
            <div className="size-12 rounded-xl bg-primary-soft text-primary grid place-items-center mb-5">
              <Eye className="size-5" />
            </div>
            <h2 className="font-display font-bold text-2xl text-primary mb-3">Our Vision</h2>
            <p className="text-muted-foreground leading-relaxed">
              To empower African youth with future-ready digital skills and create pathways to employment, entrepreneurship and innovation.
            </p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-8 shadow-soft">
            <div className="size-12 rounded-xl bg-mint/20 text-primary grid place-items-center mb-5">
              <Target className="size-5" />
            </div>
            <h2 className="font-display font-bold text-2xl text-primary mb-3">Our Mission</h2>
            <p className="text-muted-foreground leading-relaxed">
              To provide accessible, practical and high-quality technology education that transforms learners into globally competitive professionals.
            </p>
          </div>
        </div>
      </section>

      {values.length > 0 && (
        <section className="py-20 bg-surface">
          <div className="mx-auto w-full max-w-none px-6 md:px-12 lg:px-16 text-center">
            <h2 className="font-display font-bold text-3xl md:text-4xl text-primary mb-12">What we stand for</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {values.map((v) => (
                <div key={v.id} className="bg-card p-7 rounded-2xl border border-border text-left">
                  <DynamicIcon name={v.icon} className="size-6 text-mint mb-4" />
                  <h3 className="font-semibold text-primary mb-2">{v.title}</h3>
                  <p className="text-sm text-muted-foreground">{v.description}</p>
                </div>
              ))}
            </div>
            <Link
              to="/apply"
              className="inline-flex mt-12 items-center gap-2 bg-primary text-primary-foreground px-7 py-4 rounded-xl font-semibold hover:bg-teal-deep transition-colors shadow-elegant"
            >
              Join the next cohort
            </Link>
          </div>
        </section>
      )}

      {team.length > 0 && (
        <section className="py-20">
          <div className="mx-auto w-full max-w-none px-6 md:px-12 lg:px-16">
            <div className="text-center mb-12">
              <span className="text-mint font-semibold uppercase tracking-wider text-sm">Our Team</span>
              <h2 className="font-display font-bold text-3xl md:text-4xl text-primary mt-2">Meet the people behind Staken Hub</h2>
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {team.map((m) => (
                <div key={m.id} className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-elegant transition-all">
                  <div className="aspect-square bg-primary-soft overflow-hidden">
                    {m.photo_url ? (
                      <img src={m.photo_url} alt={m.name} className="size-full object-cover" />
                    ) : (
                      <div className="size-full grid place-items-center text-primary">
                        <Users className="size-10 opacity-50" />
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-primary">{m.name}</h3>
                    {m.role && <p className="text-xs text-mint font-semibold uppercase tracking-wider mt-1">{m.role}</p>}
                    {m.bio && <p className="text-sm text-muted-foreground mt-3 leading-relaxed line-clamp-3">{m.bio}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </SiteLayout>
  );
}

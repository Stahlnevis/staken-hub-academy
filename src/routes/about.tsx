import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout, PageHero } from "@/components/SiteLayout";
import { Target, Eye, Heart, Award } from "lucide-react";

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

      <section className="py-20 bg-surface">
        <div className="mx-auto w-full max-w-none px-6 md:px-12 lg:px-16 text-center">
          <h2 className="font-display font-bold text-3xl md:text-4xl text-primary mb-12">What we stand for</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { Icon: Heart, t: "Practical First", d: "Every concept we teach is paired with a real project." },
              { Icon: Award, t: "Mentor-led", d: "Active practitioners guide every cohort." },
              { Icon: Target, t: "Outcome focused", d: "We measure success by jobs, products and impact." },
            ].map(({ Icon, t, d }) => (
              <div key={t} className="bg-card p-7 rounded-2xl border border-border">
                <Icon className="size-6 text-mint mx-auto mb-4" />
                <h3 className="font-semibold text-primary mb-2">{t}</h3>
                <p className="text-sm text-muted-foreground">{d}</p>
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
    </SiteLayout>
  );
}

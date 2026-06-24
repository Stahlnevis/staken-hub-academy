import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout, PageHero } from "@/components/SiteLayout";
import { Target, Eye, Heart, Award } from "lucide-react";
import kensabLogo from "@/assets/kensab-logo.jpg";

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

      <section className="py-20 bg-background border-t border-border/40">
        <div className="mx-auto w-full max-w-none px-6 md:px-12 lg:px-16 text-center">
          <span className="text-mint font-semibold uppercase tracking-wider text-sm">Partnerships</span>
          <h2 className="font-display font-bold text-3xl md:text-4xl text-primary mt-2 mb-4">Our Collaborators</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-12">
            We partner with industry-leading organizations to provide our students with practical internship opportunities, collaborative projects, and industry placement.
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8">
            <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-soft hover:shadow-medium hover:border-primary/25 transition-all duration-300 group max-w-sm flex flex-col items-center">
              <div className="h-28 w-64 flex items-center justify-center mb-4 overflow-hidden rounded-xl bg-white p-3 border border-border/40 shadow-sm">
                <img
                  src={kensabLogo}
                  alt="Kensab Collection Logo"
                  className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <h3 className="font-display font-bold text-lg text-primary">Kensab Collection</h3>
              <p className="text-xs text-mint font-semibold uppercase tracking-wider mt-1">E-Commerce & Placement Partner</p>
              <p className="text-sm text-muted-foreground text-center mt-3 leading-relaxed">
                A strategic partnership providing our graduates with direct pathways to remote online employment, digital trade coordination, and global dropshipping operations.
              </p>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout, PageHero } from "@/components/SiteLayout";
import { ArrowRight, ShieldCheck, Brain, Code2, Sparkles } from "lucide-react";

export const Route = createFileRoute("/corporate")({
  head: () => ({
    meta: [
      { title: "Corporate Training — Staken Hub Academy" },
      {
        name: "description",
        content:
          "Customised corporate training in cybersecurity awareness, AI literacy, programming and digital upskilling.",
      },
      { property: "og:title", content: "Corporate Training — Staken Hub Academy" },
      { property: "og:description", content: "Upskill your team for the AI era." },
      { property: "og:url", content: "/corporate" },
    ],
    links: [{ rel: "canonical", href: "/corporate" }],
  }),
  component: CorporatePage,
});

const OFFERINGS = [
  { Icon: ShieldCheck, t: "Cybersecurity Awareness", d: "Train every employee to recognise phishing, social engineering and account takeover." },
  { Icon: Brain, t: "AI Literacy", d: "Teams learn to use LLMs responsibly and productively in everyday work." },
  { Icon: Code2, t: "Programming", d: "Foundational and advanced coding tracks for technical and semi-technical staff." },
  { Icon: Sparkles, t: "Digital Upskilling", d: "Modern productivity, collaboration and data literacy at scale." },
];

function CorporatePage() {
  return (
    <SiteLayout>
      <PageHero
        eyebrow="Corporate Training"
        title="Upskill your team for the AI era"
        subtitle="Customised programmes for organisations across Africa — delivered online, on-site or hybrid."
      />
      <section className="py-20">
        <div className="mx-auto w-full max-w-none px-6 md:px-12 lg:px-16 grid sm:grid-cols-2 gap-6">
          {OFFERINGS.map(({ Icon, t, d }) => (
            <div key={t} className="bg-card border border-border rounded-2xl p-8">
              <div className="size-12 rounded-xl bg-primary-soft text-primary grid place-items-center mb-5">
                <Icon className="size-5" />
              </div>
              <h3 className="text-xl font-semibold text-primary mb-2">{t}</h3>
              <p className="text-muted-foreground leading-relaxed">{d}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-14">
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-7 py-4 rounded-xl font-semibold hover:bg-teal-deep transition-colors shadow-elegant"
          >
            Request a Proposal <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}

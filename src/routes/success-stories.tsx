import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageHero } from "@/components/SiteLayout";
import { TESTIMONIALS } from "@/lib/programmes";
import { Quote } from "lucide-react";
import alumni1 from "@/assets/alumni-1.jpg";
import alumni2 from "@/assets/alumni-2.jpg";
import alumni3 from "@/assets/alumni-3.jpg";

const IMG: Record<string, string> = { "alumni-1": alumni1, "alumni-2": alumni2, "alumni-3": alumni3 };

export const Route = createFileRoute("/success-stories")({
  head: () => ({
    meta: [
      { title: "Success Stories — Staken Hub Academy" },
      { name: "description", content: "Alumni stories: career outcomes, growth and impact from Staken Hub graduates." },
      { property: "og:title", content: "Success Stories — Staken Hub Academy" },
      { property: "og:description", content: "Real career outcomes from our alumni." },
      { property: "og:url", content: "/success-stories" },
    ],
    links: [{ rel: "canonical", href: "/success-stories" }],
  }),
  component: StoriesPage,
});

function StoriesPage() {
  return (
    <SiteLayout>
      <PageHero
        eyebrow="Success Stories"
        title="Our alumni are shaping the future"
        subtitle="Hear from graduates who transformed their careers through Staken Hub Academy."
      />
      <section className="py-20">
        <div className="mx-auto w-full max-w-none px-6 md:px-12 lg:px-16 grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <figure
              key={t.name}
              className="bg-card border border-border rounded-2xl p-7 hover:shadow-elegant hover:-translate-y-1 transition-all relative"
            >
              <Quote className="absolute top-5 right-5 size-8 text-mint/30" />
              <blockquote className="text-foreground/85 leading-relaxed mb-6 text-[15px]">"{t.quote}"</blockquote>
              <figcaption className="flex items-center gap-3 pt-5 border-t border-border">
                <img src={IMG[t.img]} alt={t.name} width={48} height={48} loading="lazy" className="size-12 rounded-full object-cover" />
                <div>
                  <div className="font-semibold text-primary text-sm">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}

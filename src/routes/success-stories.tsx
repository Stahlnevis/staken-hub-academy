import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageHero } from "@/components/SiteLayout";
import { Quote, Star } from "lucide-react";
import { useCmsRows } from "@/lib/useCmsRows";

type Story = {
  id: string;
  name: string;
  role: string | null;
  company: string | null;
  photo_url: string | null;
  quote: string | null;
};

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
  const { rows, loading } = useCmsRows<Story>("success_stories", { orderBy: "sort_order" });
  return (
    <SiteLayout>
      <PageHero
        eyebrow="Success Stories"
        title="Our alumni are shaping the future"
        subtitle="Hear from graduates who transformed their careers through Staken Hub Academy."
      />
      <section className="py-20">
        <div className="mx-auto w-full max-w-none px-6 md:px-12 lg:px-16">
          {loading ? (
            <p className="text-center text-muted-foreground">Loading stories…</p>
          ) : rows.length === 0 ? (
            <div className="text-center py-16 max-w-md mx-auto">
              <Star className="mx-auto size-10 text-mint mb-4" />
              <p className="text-muted-foreground">Alumni stories will appear here soon.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {rows.map((t) => (
                <figure
                  key={t.id}
                  className="bg-card border border-border rounded-2xl p-7 hover:shadow-elegant hover:-translate-y-1 transition-all relative"
                >
                  <Quote className="absolute top-5 right-5 size-8 text-mint/30" />
                  {t.quote && (
                    <blockquote className="text-foreground/85 leading-relaxed mb-6 text-[15px]">
                      "{t.quote}"
                    </blockquote>
                  )}
                  <figcaption className="flex items-center gap-3 pt-5 border-t border-border">
                    {t.photo_url ? (
                      <img src={t.photo_url} alt={t.name} width={48} height={48} loading="lazy" className="size-12 rounded-full object-cover" />
                    ) : (
                      <div className="size-12 rounded-full bg-primary-soft grid place-items-center text-primary font-bold">
                        {t.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-primary text-sm">{t.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {[t.role, t.company].filter(Boolean).join(" · ")}
                      </div>
                    </div>
                  </figcaption>
                </figure>
              ))}
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}

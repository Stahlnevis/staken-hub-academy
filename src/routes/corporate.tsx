import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout, PageHero } from "@/components/SiteLayout";
import { ArrowRight, Wrench } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { useCmsRows } from "@/lib/useCmsRows";
import { DynamicIcon } from "@/components/DynamicIcon";

type Service = { id: string; icon: string | null; title: string; description: string | null };

export const Route = createFileRoute("/corporate")({
  head: () => ({
    meta: [
      { title: "Corporate Training — Staken Hub Academy" },
      {
        name: "description",
        content: "Customised corporate training in cybersecurity awareness, AI literacy, and digital upskilling.",
      },
      { property: "og:title", content: "Corporate Training — Staken Hub Academy" },
      { property: "og:description", content: "Upskill your team for the AI era." },
      { property: "og:url", content: "/corporate" },
    ],
    links: [{ rel: "canonical", href: "/corporate" }],
  }),
  component: CorporatePage,
});

function CorporatePage() {
  const { rows: services, loading } = useCmsRows<Service>("corporate_services", { orderBy: "sort_order" });
  return (
    <SiteLayout>
      <PageHero
        eyebrow="Corporate Training"
        title="Upskill your team for the AI era"
        subtitle="Customised programmes for organisations across Africa — delivered online, on-site or hybrid."
      />
      <section className="py-20">
        <div className="mx-auto w-full max-w-none px-6 md:px-12 lg:px-16">
          {loading ? (
            <p className="text-center text-muted-foreground">Loading services…</p>
          ) : services.length === 0 ? (
            <div className="text-center py-16 max-w-md mx-auto">
              <Wrench className="mx-auto size-10 text-mint mb-4" />
              <p className="text-muted-foreground">Corporate training offerings coming soon.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((s) => (
                <div key={s.id} className="bg-card border border-border rounded-2xl p-8">
                    {s.icon && (s.icon in LucideIcons) && (
                      <div className="size-12 rounded-xl bg-primary-soft text-primary grid place-items-center mb-5">
                        <DynamicIcon name={s.icon} className="size-5" />
                      </div>
                    )}
                  <h3 className="text-xl font-semibold text-primary mb-2">{s.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{s.description}</p>
                </div>
              ))}
            </div>
          )}
          <div className="text-center mt-14">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-7 py-4 rounded-xl font-semibold hover:bg-teal-deep transition-colors shadow-elegant"
            >
              Request a Proposal <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

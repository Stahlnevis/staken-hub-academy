import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout, PageHero } from "@/components/SiteLayout";
import { PROGRAMMES } from "@/lib/programmes";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/apply")({
  head: () => ({
    meta: [
      { title: "Apply Now — Staken Hub Academy" },
      { name: "description", content: "Apply to join the next cohort at Staken Hub Academy." },
      { property: "og:title", content: "Apply — Staken Hub Academy" },
      { property: "og:description", content: "Start your application today." },
      { property: "og:url", content: "/apply" },
    ],
    links: [{ rel: "canonical", href: "/apply" }],
  }),
  component: ApplyPage,
});

function ApplyPage() {
  return (
    <SiteLayout>
      <PageHero
        eyebrow="Apply Now"
        title="Start your tech journey"
        subtitle="Tell us a little about yourself and the programme you want to join."
      />
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert("Thanks! Our admissions team will reach out shortly.");
            }}
            className="bg-card border border-border rounded-2xl p-7 lg:p-9 space-y-5 shadow-soft"
          >
            <div className="grid sm:grid-cols-2 gap-5">
              <Input name="firstName" label="First name" />
              <Input name="lastName" label="Last name" />
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              <Input name="email" type="email" label="Email" />
              <Input name="phone" type="tel" label="Phone" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-primary mb-2">Programme of interest</label>
              <select
                name="programme"
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-mint focus:ring-2 focus:ring-mint/30"
              >
                {PROGRAMMES.map((p) => (
                  <option key={p.slug} value={p.slug}>{p.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-primary mb-2">Preferred learning mode</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                {["Online", "Physical", "Hybrid", "Weekend"].map((m) => (
                  <label key={m} className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-border cursor-pointer hover:border-mint hover:bg-primary-soft/40">
                    <input type="radio" name="mode" value={m} className="accent-primary" />
                    {m}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-primary mb-2">Tell us about your goals</label>
              <textarea
                name="goals"
                rows={4}
                maxLength={1500}
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-mint focus:ring-2 focus:ring-mint/30"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-7 py-3.5 rounded-xl font-semibold hover:bg-teal-deep transition-colors shadow-elegant"
            >
              <CheckCircle2 className="size-4" /> Submit Application
            </button>
            <p className="text-xs text-muted-foreground">
              Prefer to talk first? <Link to="/contact" className="text-primary font-semibold hover:underline">Contact admissions</Link>.
            </p>
          </form>
        </div>
      </section>
    </SiteLayout>
  );
}

function Input({ name, label, type = "text" }: { name: string; label: string; type?: string }) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-semibold text-primary mb-2">{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        maxLength={255}
        required
        className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-mint focus:ring-2 focus:ring-mint/30"
      />
    </div>
  );
}

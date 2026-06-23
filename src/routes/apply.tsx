import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout, PageHero } from "@/components/SiteLayout";
import { PROGRAMMES } from "@/lib/programmes";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { useState } from "react";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    // Use environment variable or fallback to placeholder
    const accessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY || "";

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: accessKey || "YOUR_WEB3FORMS_ACCESS_KEY_HERE",
          subject: "New Student Application - Staken Hub Academy",
          from_name: "Staken Hub Admissions Alert",
          ...data,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setSubmitStatus("success");
      } else {
        console.error("Web3Forms submission failed:", result);
        setSubmitStatus("error");
      }
    } catch (err) {
      console.error("Submission error:", err);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SiteLayout>
      <PageHero
        eyebrow="Apply Now"
        title="Start your tech journey"
        subtitle="Tell us a little about yourself and the programme you want to join."
      />
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          {submitStatus === "success" ? (
            <div className="bg-card border border-mint/30 rounded-2xl p-8 lg:p-12 text-center space-y-6 shadow-elegant animate-fade-in max-w-2xl mx-auto">
              <div className="size-16 bg-mint/15 text-primary rounded-full grid place-items-center mx-auto">
                <CheckCircle2 className="size-8" />
              </div>
              <div className="space-y-2">
                <h3 className="font-display font-bold text-2xl sm:text-3xl text-primary">Application Submitted!</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Thank you for applying. We have received your application and sent a copy to our admissions team at <span className="font-semibold text-primary">admissions@stakenhub.com</span>. We will reach out to you shortly.
                </p>
              </div>
              <div className="pt-4">
                <Link
                  to="/"
                  className="inline-flex items-center justify-center bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:bg-teal-deep transition-colors shadow-elegant"
                >
                  Return to Home
                </Link>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="bg-card border border-border rounded-2xl p-7 lg:p-9 space-y-5 shadow-soft"
            >
              {submitStatus === "error" && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 text-sm">
                  <AlertCircle className="size-5 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Submission failed</p>
                    <p className="mt-0.5 opacity-90">
                      There was a problem sending your application. Please check your internet connection and verify that the Web3Forms Access Key is set.
                    </p>
                  </div>
                </div>
              )}
              <div className="grid sm:grid-cols-2 gap-5">
                <Input name="firstName" label="First name" disabled={isSubmitting} />
                <Input name="lastName" label="Last name" disabled={isSubmitting} />
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                <Input name="email" type="email" label="Email" disabled={isSubmitting} />
                <Input name="phone" type="tel" label="Phone" disabled={isSubmitting} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-primary mb-2">Programme of interest</label>
                <select
                  name="programme"
                  disabled={isSubmitting}
                  className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-mint focus:ring-2 focus:ring-mint/30 disabled:opacity-50"
                >
                  {PROGRAMMES.map((p) => (
                    <option key={p.slug} value={p.title}>{p.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-primary mb-2">Preferred learning mode</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                  {["Online", "Physical", "Hybrid", "Weekend"].map((m) => (
                    <label key={m} className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-border cursor-pointer hover:border-mint hover:bg-primary-soft/40">
                      <input type="radio" name="mode" value={m} defaultChecked={m === "Online"} disabled={isSubmitting} className="accent-primary" />
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
                  disabled={isSubmitting}
                  required
                  className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-mint focus:ring-2 focus:ring-mint/30 disabled:opacity-50"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-7 py-3.5 rounded-xl font-semibold hover:bg-teal-deep transition-colors shadow-elegant disabled:opacity-75 min-w-[200px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="size-4" /> Submit Application
                  </>
                )}
              </button>
              <p className="text-xs text-muted-foreground">
                Prefer to talk first? <Link to="/contact" className="text-primary font-semibold hover:underline">Contact admissions</Link>.
              </p>
            </form>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}

function Input({
  name,
  label,
  type = "text",
  disabled,
}: {
  name: string;
  label: string;
  type?: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-semibold text-primary mb-2">{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        maxLength={255}
        required
        disabled={disabled}
        className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-mint focus:ring-2 focus:ring-mint/30 disabled:opacity-50"
      />
    </div>
  );
}

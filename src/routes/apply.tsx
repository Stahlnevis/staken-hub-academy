import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout, PageHero } from "@/components/SiteLayout";
import { COHORTS } from "@/lib/programmes";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useCmsRows } from "@/lib/useCmsRows";

export const Route = createFileRoute("/apply")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      programme: (search.programme as string) || undefined,
    };
  },
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
  const [hasCoupon, setHasCoupon] = useState<"yes" | "no">("no");
  const [couponError, setCouponError] = useState<string | null>(null);

  const { rows: dbProgrammes, loading: loadingProgrammes } = useCmsRows<any>("programmes", { orderBy: "sort_order" });
  const search = Route.useSearch();
  const [selectedProgramme, setSelectedProgramme] = useState("");

  // Update selected program if URL query param matches
  useEffect(() => {
    if (search.programme) {
      const match = dbProgrammes.find(
        (p: any) => p.title.toLowerCase() === search.programme?.toLowerCase()
      ) || COHORTS.find(
        (c) => c.programme.toLowerCase() === search.programme?.toLowerCase()
      );
      if (match) {
        setSelectedProgramme("title" in match ? match.title : match.programme);
      }
    } else if (dbProgrammes.length > 0 && !selectedProgramme) {
      setSelectedProgramme(dbProgrammes[0].title);
    } else if (COHORTS.length > 0 && !selectedProgramme) {
      setSelectedProgramme(COHORTS[0].programme);
    }
  }, [search.programme, dbProgrammes, selectedProgramme]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    if (hasCoupon === "yes" && selectedProgramme !== "Robotics and Coding for Kids") {
      const code = String(data.couponCode || "").trim();
      if (code !== "SKH-0110-2026/^#$") {
        setCouponError("Invalid coupon code. You will not be able to submit this application without the correct coupon code.");
        setIsSubmitting(false);
        return;
      }
    }
    setCouponError(null);

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
                  Thank you for applying. We have received your application. Your login credentials will be sent to your email address shortly so you can log into your{" "}
                  <a
                    href="https://academy.stakenhub.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-primary hover:underline"
                  >
                    academy portal
                  </a>
                  . Our admissions team at <span className="font-semibold text-primary">admissions@stakenhub.com</span> will also reach out to you soon.
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
                  value={selectedProgramme}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedProgramme(val);
                    if (val === "Robotics and Coding for Kids") {
                      setHasCoupon("no");
                      setCouponError(null);
                    }
                  }}
                  disabled={isSubmitting || loadingProgrammes}
                  className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-mint focus:ring-2 focus:ring-mint/30 disabled:opacity-50"
                >
                  {loadingProgrammes ? (
                    <option value="">Loading programmes...</option>
                  ) : (
                    <>
                      {dbProgrammes.map((p: any) => (
                        <option key={p.id} value={p.title}>
                          {p.title}
                        </option>
                      ))}
                      {COHORTS.filter(
                        (c) =>
                          !dbProgrammes.some(
                            (p: any) => p.title.toLowerCase() === c.programme.toLowerCase()
                          )
                      ).map((c) => (
                        <option key={c.programme} value={c.programme}>
                          {c.programme}
                        </option>
                      ))}
                    </>
                  )}
                </select>
              </div>


              {selectedProgramme === "Robotics and Coding for Kids" && (
                <div className="animate-fade-in space-y-5">
                  <div className="p-4 rounded-xl bg-primary-soft/30 border border-primary/10 text-sm">
                    <p className="font-semibold text-primary mb-1">Scratch Coding & Robotics Info</p>
                    <p className="text-muted-foreground leading-relaxed text-xs">
                      This 2-week weekday course is designed specifically for kids (using Scratch coding, logical thinking, and building simple interactive robots).
                    </p>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <Input
                      name="childName"
                      label="Child's Name"
                      placeholder="Enter child's full name"
                      disabled={isSubmitting}
                      required={true}
                    />
                    <Input
                      name="childAge"
                      label="Child's Age"
                      placeholder="e.g. 10 years"
                      disabled={isSubmitting}
                      required={true}
                    />
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-primary mb-2">Preferred learning mode</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                  {["Online", "Hybrid", "Bootcamp"].map((m) => (
                    <label key={m} className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-border cursor-pointer hover:border-mint hover:bg-primary-soft/40">
                      <input type="radio" name="mode" value={m} defaultChecked={m === "Online"} disabled={isSubmitting} className="accent-primary" />
                      {m}
                    </label>
                  ))}
                </div>
              </div>
              {selectedProgramme !== "Robotics and Coding for Kids" && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-primary mb-2">Applying with a coupon code?</label>
                    <div className="grid grid-cols-2 gap-3 text-sm max-w-xs">
                      {[
                        { label: "No", value: "no" },
                        { label: "Yes", value: "yes" },
                      ].map((opt) => (
                        <label key={opt.value} className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-border cursor-pointer hover:border-mint hover:bg-primary-soft/40">
                          <input
                            type="radio"
                            name="hasCoupon"
                            value={opt.value}
                            checked={hasCoupon === opt.value}
                            onChange={() => {
                              setHasCoupon(opt.value as "yes" | "no");
                              setCouponError(null);
                            }}
                            className="accent-primary"
                          />
                          {opt.label}
                        </label>
                      ))}
                    </div>
                  </div>

                  {hasCoupon === "yes" && (
                    <div className="animate-fade-in space-y-2">
                      <Input
                        name="couponCode"
                        label="Coupon Code"
                        placeholder="Enter your coupon code"
                        disabled={isSubmitting}
                        required={true}
                        onChange={() => setCouponError(null)}
                      />
                      {couponError && (
                        <p className="text-destructive text-xs font-semibold flex items-center gap-1.5 mt-1.5 animate-fade-in">
                          <AlertCircle className="size-4 shrink-0" />
                          {couponError}
                        </p>
                      )}
                    </div>
                  )}
                </>
              )}
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
  required = true,
  placeholder,
  ...props
}: {
  name: string;
  label: string;
  type?: string;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  [key: string]: any;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-semibold text-primary mb-2">{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        maxLength={255}
        required={required}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-mint focus:ring-2 focus:ring-mint/30 disabled:opacity-50"
        {...props}
      />
    </div>
  );
}

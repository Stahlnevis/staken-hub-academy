import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { SiteLayout, PageHero } from "@/components/SiteLayout";
import { Mail, Phone, MapPin, MessageCircle, Send, Loader2 } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us — Staken Hub Academy" },
      { name: "description", content: "Get in touch with Staken Hub Academy — admissions, partnerships and corporate training." },
      { property: "og:title", content: "Contact — Staken Hub Academy" },
      { property: "og:description", content: "Talk to admissions or request corporate training." },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: ContactPage,
});

const ContactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  subject: z.string().trim().min(1, "Subject is required").max(150),
  message: z.string().trim().min(10, "Tell us a little more").max(1500),
});

function ContactPage() {
  const [status, setStatus] = useState<null | "ok" | "err">(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formElement = e.currentTarget;
    const form = new FormData(formElement);
    const parsed = ContactSchema.safeParse(Object.fromEntries(form));
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const issue of parsed.error.issues) errs[String(issue.path[0])] = issue.message;
      setErrors(errs);
      setStatus("err");
      return;
    }
    setErrors({});
    setIsSubmitting(true);
    setStatus(null);

    const accessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY || "";

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          ...parsed.data,
          access_key: accessKey || "YOUR_WEB3FORMS_ACCESS_KEY_HERE",
          subject: `New Contact Enquiry - ${parsed.data.subject}`,
          from_name: "Staken Hub Contact Alert",
        }),
      });

      const result = await response.json();
      if (result.success) {
        setStatus("ok");
        formElement.reset();
      } else {
        console.error("Web3Forms submission failed:", result);
        setStatus("err");
      }
    } catch (err) {
      console.error("Submission error:", err);
      setStatus("err");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SiteLayout>
      <PageHero
        eyebrow="Contact"
        title="Let's start the conversation"
        subtitle="Reach out for admissions, partnerships, corporate training or general enquiries."
      />

      <section className="py-20">
        <div className="mx-auto w-full max-w-none px-6 md:px-12 lg:px-16 grid lg:grid-cols-[1fr_1.2fr] gap-10">
          <div className="space-y-6">
            {[
              { Icon: Mail, t: "Email", v: "admissions@stakenhub.com", href: "mailto:admissions@stakenhub.com" },
              { Icon: Phone, t: "Phone", v: "0795209002 / 0759111854" },
              { Icon: MessageCircle, t: "WhatsApp", v: "0795209002 / 0759111854", href: "https://wa.me/254795209002" },
              { Icon: MapPin, t: "Visit", v: "Nairobi, Kenya" },
            ].map(({ Icon, t, v, href }) => (
              <a
                key={t}
                href={href ?? "#"}
                target={href ? "_blank" : undefined}
                rel={href ? "noreferrer" : undefined}
                className="flex items-start gap-4 bg-card border border-border rounded-2xl p-5 hover:border-mint/50 transition-colors"
              >
                <div className="size-11 shrink-0 rounded-xl bg-primary-soft text-primary grid place-items-center">
                  <Icon className="size-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">{t}</p>
                  <p className="font-semibold text-primary truncate">{v}</p>
                </div>
              </a>
            ))}

            <div className="rounded-2xl overflow-hidden border border-border shadow-soft aspect-[16/10]">
              <iframe
                title="Staken Hub Academy location"
                src="https://www.google.com/maps?q=Nairobi%2C%20Kenya&output=embed"
                loading="lazy"
                className="w-full h-full border-0"
              />
            </div>
          </div>

          <form onSubmit={onSubmit} className="bg-card border border-border rounded-2xl p-7 lg:p-9 space-y-5 shadow-soft" noValidate>
            <h2 className="font-display font-bold text-2xl text-primary">Send us a message</h2>

            <div className="grid sm:grid-cols-2 gap-5">
              <Field name="name" label="Full name" error={errors.name} disabled={isSubmitting} />
              <Field name="email" label="Email" type="email" error={errors.email} disabled={isSubmitting} />
            </div>
            <Field name="subject" label="Subject" error={errors.subject} disabled={isSubmitting} />
            <div>
              <label className="block text-sm font-semibold text-primary mb-2" htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                rows={5}
                maxLength={1500}
                disabled={isSubmitting}
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-mint focus:ring-2 focus:ring-mint/30 disabled:opacity-50"
              />
              {errors.message && <p className="mt-1 text-xs text-destructive">{errors.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3.5 rounded-xl font-semibold hover:bg-teal-deep transition-colors shadow-elegant disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  Sending... <Loader2 className="size-4 animate-spin" />
                </>
              ) : (
                <>
                  Send Message <Send className="size-4" />
                </>
              )}
            </button>
            {status === "ok" && (
              <p className="text-sm text-primary font-medium">Thanks — your message has been sent. We'll be in touch within one business day.</p>
            )}
            {status === "err" && Object.keys(errors).length === 0 && (
              <p className="text-sm text-destructive font-medium">Failed to send message. Please verify your connection and try again.</p>
            )}
          </form>
        </div>
      </section>
    </SiteLayout>
  );
}

function Field({
  name,
  label,
  type = "text",
  error,
  disabled,
}: {
  name: string;
  label: string;
  type?: string;
  error?: string;
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
        disabled={disabled}
        className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-mint focus:ring-2 focus:ring-mint/30 disabled:opacity-50"
      />
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}

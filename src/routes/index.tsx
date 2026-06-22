import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight, CheckCircle2, Users, GraduationCap, Sparkles,
  Laptop, Building2, CalendarRange, Sun, Quote, ArrowUpRight,
} from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { COHORTS, EVENTS, TESTIMONIALS } from "@/lib/programmes";
import heroImage from "@/assets/hero-students.jpg";
import alumni1 from "@/assets/alumni-1.jpg";
import alumni2 from "@/assets/alumni-2.jpg";
import alumni3 from "@/assets/alumni-3.jpg";

const ALUMNI_IMG: Record<string, string> = {
  "alumni-1": alumni1,
  "alumni-2": alumni2,
  "alumni-3": alumni3,
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Staken Hub Academy — Empowering Africa Through Digital Skills" },
      {
        name: "description",
        content:
          "Learn practical technology skills in cybersecurity, programming, AI, data science and design. Project-based training, industry mentors, and career support.",
      },
      { property: "og:title", content: "Staken Hub Academy" },
      { property: "og:description", content: "Empowering Africa through digital skills." },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: HomePage,
});

function useCountUp(target: number, durationMs = 1600) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement | null>(null);
  const started = useRef(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const tick = (now: number) => {
            const t = Math.min(1, (now - start) / durationMs);
            const eased = 1 - Math.pow(1 - t, 3);
            setValue(Math.round(eased * target));
            if (t < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.4 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [target, durationMs]);
  return { value, ref };
}

function StatItem({ end, suffix = "", label }: { end: number; suffix?: string; label: string }) {
  const { value, ref } = useCountUp(end);
  return (
    <div className="text-center">
      <div className="font-display font-bold text-4xl md:text-5xl text-mint mb-2">
        <span ref={ref}>{value.toLocaleString()}</span>
        {suffix}
      </div>
      <div className="text-primary-foreground/70 text-xs uppercase tracking-[0.18em]">{label}</div>
    </div>
  );
}

function HomePage() {
  return (
    <SiteLayout>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-14 pb-20 lg:pt-20 lg:pb-28 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-mint/15 border border-mint/30 text-primary text-xs font-bold uppercase tracking-widest mb-6">
              <span className="size-2 bg-mint rounded-full animate-pulse" />
              Enrollment Open — Q3 2026 Cohorts
            </div>
            <h1 className="font-display font-bold text-5xl md:text-6xl lg:text-7xl text-primary leading-[1.05] mb-6 text-balance">
              Empowering Africa <br className="hidden sm:block" />
              <span className="text-mint">Through Digital</span> Skills
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mb-10 leading-relaxed">
              Learn practical technology skills, build real-world projects, and prepare for high-impact careers in the global digital economy.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link
                to="/programmes"
                className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-7 py-4 rounded-xl font-semibold hover:bg-teal-deep transition-colors shadow-elegant"
              >
                Explore Programmes <ArrowRight className="size-4" />
              </Link>
              <Link
                to="/apply"
                className="inline-flex items-center justify-center bg-card border-2 border-primary/15 text-primary px-7 py-4 rounded-xl font-semibold hover:bg-primary-soft transition-colors"
              >
                Apply Now
              </Link>
            </div>
          </div>

          <div className="relative animate-fade-in-up">
            <div className="absolute -top-12 -right-12 size-56 bg-mint/30 rounded-full blur-3xl" />
            <div className="absolute -bottom-12 -left-12 size-56 bg-primary/15 rounded-full blur-3xl" />
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden ring-1 ring-primary/10 shadow-elegant">
              <img
                src={heroImage}
                alt="African tech students collaborating in a modern Staken Hub Academy lab"
                width={1280}
                height={1280}
                className="size-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 sm:-left-10 bg-card p-4 sm:p-5 rounded-2xl shadow-elegant border border-border max-w-[220px] animate-float-slow">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-mint/20 grid place-items-center text-primary">
                  <Sparkles className="size-5" />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Next cohort</p>
                  <p className="text-sm font-semibold text-primary">Sept 15, 2026</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-primary py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          <StatItem end={2500} suffix="+" label="Students Trained" />
          <StatItem end={18} suffix="+" label="Courses Offered" />
          <StatItem end={45} suffix="+" label="Industry Mentors" />
          <StatItem end={92} suffix="%" label="Graduates Certified" />
        </div>
      </section>

      {/* PROGRAMMES */}
      <section id="programmes" className="py-24 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-14">
            <div className="max-w-2xl">
              <span className="inline-block text-xs font-bold uppercase tracking-[0.18em] text-primary mb-3">
                Our Programmes
              </span>
              <h2 className="font-display font-bold text-3xl md:text-4xl lg:text-5xl text-primary leading-tight">
                Specialized tracks for the digital economy
              </h2>
              <p className="mt-4 text-muted-foreground">
                Industry-vetted curricula designed to take you from beginner to professional in months — not years.
              </p>
            </div>
            <Link to="/programmes" className="text-primary font-semibold hover:underline inline-flex items-center gap-2">
              View all programmes <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
            {PROGRAMMES.map((p) => (
              <article
                key={p.slug}
                className="group bg-card border border-border rounded-2xl p-7 hover:border-mint/50 hover:shadow-elegant hover:-translate-y-1 transition-all"
              >
                <div className="size-12 bg-primary-soft text-primary rounded-xl grid place-items-center mb-5 group-hover:bg-mint group-hover:text-primary transition-colors">
                  <p.icon className="size-5" />
                </div>
                <h3 className="text-xl font-semibold text-primary mb-2">{p.title}</h3>
                <p className="text-sm text-muted-foreground mb-5 leading-relaxed">{p.description}</p>
                <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground mb-6">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="size-1.5 rounded-full bg-mint" /> {p.duration}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="size-1.5 rounded-full bg-amber-warm" /> {p.level}
                  </span>
                </div>
                <Link
                  to="/programmes"
                  className="inline-flex items-center justify-center w-full py-3 rounded-lg border border-primary/15 font-semibold text-primary hover:bg-primary hover:text-primary-foreground transition-colors text-sm"
                >
                  Learn More
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE */}
      <section className="py-24 lg:py-28 bg-surface">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 grid lg:grid-cols-[1fr_1.4fr] gap-12 lg:gap-20">
          <div>
            <span className="inline-block text-xs font-bold uppercase tracking-[0.18em] text-primary mb-3">
              Why Staken Hub
            </span>
            <h2 className="font-display font-bold text-3xl md:text-4xl lg:text-5xl text-primary leading-tight mb-5">
              Built for outcomes, not just certificates
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Every programme is designed around real-world projects, mentor support, and clear career pathways.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              { t: "Hands-on Learning", d: "Build production-grade projects from week one." },
              { t: "Industry Mentors", d: "1:1 access to senior engineers and designers." },
              { t: "Flexible Modes", d: "Online, physical, hybrid and weekend bootcamps." },
              { t: "Career Guidance", d: "Mock interviews, portfolio reviews, and placement." },
              { t: "Practical Projects", d: "Live client briefs and capstone case studies." },
              { t: "Certified Graduates", d: "Industry-recognised certification on completion." },
            ].map((f) => (
              <div key={f.t} className="flex gap-4">
                <div className="shrink-0 size-10 rounded-xl bg-mint/15 text-primary grid place-items-center">
                  <CheckCircle2 className="size-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold text-primary mb-1">{f.t}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LEARNING MODES */}
      <section className="py-24 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="inline-block text-xs font-bold uppercase tracking-[0.18em] text-primary mb-3">
              Learning Modes
            </span>
            <h2 className="font-display font-bold text-3xl md:text-4xl lg:text-5xl text-primary leading-tight">
              Learning that fits your life
            </h2>
            <p className="mt-4 text-muted-foreground">
              Choose how you study based on your schedule, location, and learning goals.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
            {[
              { Icon: Laptop, t: "Online Classes", d: "Live, interactive sessions from anywhere on the continent." },
              { Icon: Building2, t: "Physical Classes", d: "On-campus immersion at our hubs in Nairobi and Eldoret." },
              { Icon: Users, t: "Hybrid Learning", d: "Mix online theory with in-person labs and team projects." },
              { Icon: Sun, t: "Weekend Bootcamps", d: "Intensive upskilling for working professionals." },
            ].map((m, i) => (
              <div
                key={m.t}
                className={`p-7 rounded-2xl border transition-all ${
                  i === 1
                    ? "bg-primary text-primary-foreground border-primary shadow-elegant"
                    : "bg-card border-border hover:border-mint/50 hover:shadow-soft"
                }`}
              >
                <div
                  className={`size-11 rounded-xl grid place-items-center mb-5 ${
                    i === 1 ? "bg-mint text-primary" : "bg-primary-soft text-primary"
                  }`}
                >
                  <m.Icon className="size-5" />
                </div>
                <h4 className={`text-lg font-semibold mb-2 ${i === 1 ? "" : "text-primary"}`}>{m.t}</h4>
                <p className={`text-sm leading-relaxed ${i === 1 ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                  {m.d}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* UPCOMING COHORTS */}
      <section className="py-24 lg:py-28 bg-surface">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
            <div>
              <span className="inline-block text-xs font-bold uppercase tracking-[0.18em] text-primary mb-3">
                Upcoming Cohorts
              </span>
              <h2 className="font-display font-bold text-3xl md:text-4xl lg:text-5xl text-primary leading-tight">
                Next intakes opening soon
              </h2>
            </div>
            <CalendarRange className="size-10 text-primary/30 hidden md:block" />
          </div>

          <div className="bg-card rounded-2xl border border-border overflow-hidden divide-y divide-border">
            {COHORTS.map((c) => (
              <div
                key={c.programme}
                className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_auto] gap-4 md:gap-6 items-center px-5 md:px-7 py-5 md:py-6 hover:bg-primary-soft/40 transition-colors"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-primary text-base md:text-lg">{c.programme}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">{c.mode}</p>
                </div>
                <p className="text-sm text-muted-foreground">{c.date}</p>
                <p className="text-sm text-muted-foreground">{c.duration}</p>
                <Link
                  to="/apply"
                  className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full border border-primary/15 text-sm font-semibold text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  Apply <ArrowUpRight className="size-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SUCCESS STORIES */}
      <section className="py-24 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="inline-block text-xs font-bold uppercase tracking-[0.18em] text-primary mb-3">
              Success Stories
            </span>
            <h2 className="font-display font-bold text-3xl md:text-4xl lg:text-5xl text-primary leading-tight">
              Our alumni are shaping the future
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5 lg:gap-6">
            {TESTIMONIALS.map((t) => (
              <figure
                key={t.name}
                className="bg-card border border-border rounded-2xl p-7 hover:shadow-elegant hover:-translate-y-1 transition-all relative"
              >
                <Quote className="absolute top-5 right-5 size-8 text-mint/30" />
                <blockquote className="text-foreground/85 leading-relaxed mb-6 text-[15px]">"{t.quote}"</blockquote>
                <figcaption className="flex items-center gap-3 pt-5 border-t border-border">
                  <img
                    src={ALUMNI_IMG[t.img]}
                    alt={t.name}
                    width={48}
                    height={48}
                    loading="lazy"
                    className="size-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold text-primary text-sm">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* EVENTS */}
      <section className="py-24 lg:py-28 bg-surface">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
            <div className="max-w-xl">
              <span className="inline-block text-xs font-bold uppercase tracking-[0.18em] text-primary mb-3">
                Events & Workshops
              </span>
              <h2 className="font-display font-bold text-3xl md:text-4xl lg:text-5xl text-primary leading-tight">
                Build, learn and connect
              </h2>
            </div>
            <Link to="/events" className="text-primary font-semibold hover:underline inline-flex items-center gap-2">
              See all events <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-5 lg:gap-6">
            {EVENTS.map((e) => (
              <article
                key={e.title}
                className="bg-card border border-border rounded-2xl p-7 hover:border-mint/40 hover:shadow-soft transition-all"
              >
                <div className="flex items-center gap-3 mb-4 text-xs">
                  <span className="px-2.5 py-1 rounded-full bg-mint/20 text-primary font-semibold uppercase tracking-wider">
                    {e.type}
                  </span>
                  <span className="text-muted-foreground">{e.date}</span>
                  <span className="text-muted-foreground">• {e.location}</span>
                </div>
                <h3 className="text-xl font-semibold text-primary mb-2">{e.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{e.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>


      {/* FINAL CTA */}
      <section className="py-24 lg:py-28">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <GraduationCap className="mx-auto size-12 text-mint mb-6" />
          <h2 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl text-primary leading-[1.05] mb-5 text-balance">
            Start your tech journey today
          </h2>
          <p className="text-lg text-muted-foreground mb-9 max-w-2xl mx-auto">
            Join Staken Hub Academy and gain the skills needed to thrive in the digital economy.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/apply"
              className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-xl font-semibold hover:bg-teal-deep transition-colors shadow-elegant"
            >
              Apply Now <ArrowRight className="size-4" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center bg-card border-2 border-primary/15 text-primary px-8 py-4 rounded-xl font-semibold hover:bg-primary-soft transition-colors"
            >
              Talk to Admissions
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

// silence unused import warnings if any
void BookOpen;
void Award;

import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight, CheckCircle2, Users, GraduationCap, Sparkles,
  Laptop, Sun, Quote,
} from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { useCmsRows } from "@/lib/useCmsRows";
import heroImage from "@/assets/hero-students.jpg";
import { TESTIMONIALS } from "@/lib/programmes";
import alumni1 from "@/assets/alumni-1.jpg";
import alumni2 from "@/assets/alumni-2.jpg";
import alumni3 from "@/assets/alumni-3.jpg";

const ALUMNI_IMG: Record<string, string> = {
  "alumni-1": alumni1,
  "alumni-2": alumni2,
  "alumni-3": alumni3,
};

type Story = {
  id: string;
  name: string;
  role: string | null;
  company: string | null;
  photo_url: string | null;
  quote: string | null;
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

type Stat = { id: string; label: string; value: number; suffix: string };

function HomePage() {
  const { rows: stories } = useCmsRows<Story>("success_stories", { orderBy: "sort_order", limit: 3 });
  const { rows: stats } = useCmsRows<Stat>("stats", { orderBy: "sort_order" });
  return (
    <SiteLayout>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="mx-auto w-full max-w-none px-6 md:px-12 lg:px-16 pt-14 pb-20 lg:pt-20 lg:pb-28 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-mint/15 border border-mint/30 text-primary text-xs font-bold uppercase tracking-widest mb-6">
              <span className="size-2 bg-mint rounded-full animate-pulse" />
              Enrollment Open — Q3 2026 Cohorts
            </div>
            <h1 className="font-display font-black text-4xl md:text-5xl lg:text-6xl text-primary leading-tight mb-6 tracking-tight">
              Empowering Africa through digital skills
            </h1>
            <p className="text-muted-foreground text-base md:text-lg mb-8 leading-relaxed max-w-lg">
              Staken Hub Academy equips you with the practical technology skills needed to build global careers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/programmes"
                className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-7 py-4 rounded-full font-semibold hover:bg-teal-deep transition-colors shadow-elegant"
              >
                Explore Programmes <ArrowRight className="size-4" />
              </Link>
              <Link
                to="/corporate"
                className="inline-flex items-center justify-center gap-2 border border-primary/20 text-primary px-7 py-4 rounded-full font-semibold hover:bg-primary-soft hover:border-transparent transition-all"
              >
                Corporate Training
              </Link>
            </div>
          </div>
          <div className="relative animate-fade-in lg:mt-0 mt-8">
            <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-primary-soft shadow-elegant border border-border">
              <img
                src={heroImage}
                alt="African tech students collaborating in a modern Staken Hub Academy lab"
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
        <div className="mx-auto w-full max-w-none px-6 md:px-12 lg:px-16 grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {stats.length > 0 ? (
            stats.map((s) => (
              <StatItem key={s.id} end={s.value} suffix={s.suffix} label={s.label} />
            ))
          ) : (
            <>
              <StatItem end={2500} suffix="+" label="Students Trained" />
              <StatItem end={18} suffix="+" label="Courses Offered" />
              <StatItem end={45} suffix="+" label="Industry Mentors" />
              <StatItem end={92} suffix="%" label="Graduates Certified" />
            </>
          )}
        </div>
      </section>

      {/* WHY CHOOSE */}
      <section className="py-24 lg:py-28 bg-surface">
        <div className="mx-auto w-full max-w-none px-6 md:px-12 lg:px-16 grid lg:grid-cols-[1fr_1.4fr] gap-12 lg:gap-20">
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
              { t: "Flexible Modes", d: "Online, hybrid and bootcamps." },
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
        <div className="mx-auto w-full max-w-none px-6 md:px-12 lg:px-16">
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

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
            {[
              { Icon: Laptop, t: "Online Classes", d: "Live, interactive sessions from anywhere on the continent." },
              { Icon: Users, t: "Hybrid Learning", d: "Mix online theory with in-person labs and team projects." },
              { Icon: Sun, t: "Bootcamps", d: "Intensive upskilling for working professionals." },
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



      {/* SUCCESS STORIES */}
      <section className="py-24 lg:py-28">
        <div className="mx-auto w-full max-w-none px-6 md:px-12 lg:px-16">
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


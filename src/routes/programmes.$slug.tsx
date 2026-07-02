import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Clock, BarChart, CheckCircle2, AlertTriangle, DollarSign } from "lucide-react";

type Programme = {
  id: string;
  slug: string;
  title: string;
  category: string | null;
  duration: string | null;
  level: string | null;
  price: string | null;
  summary: string | null;
  description: string | null;
  outcomes: string[] | null;
  syllabus: string[] | null;
  cover_image: string | null;
};

export const Route = createFileRoute("/programmes/$slug")({
  head: ({ loaderData }) => {
    const title = loaderData?.programme?.title || "Programme Details";
    return {
      meta: [
        { title: `${title} — Staken Hub Academy` },
        { name: "description", content: loaderData?.programme?.summary || "Specialised digital skills training." },
      ],
    };
  },
  loader: async ({ params }) => {
    const { data } = await supabase
      .from("programmes")
      .select("*")
      .eq("slug", params.slug)
      .single();
    return { programme: data as Programme | null };
  },
  component: ProgrammeDetailPage,
});

function ProgrammeDetailPage() {
  const { programme } = Route.useLoaderData();

  if (!programme) {
    return (
      <SiteLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
          <AlertTriangle className="size-12 text-destructive mb-4" />
          <h1 className="text-2xl font-bold text-primary mb-2">Programme Not Found</h1>
          <p className="text-muted-foreground mb-6">The course you are looking for does not exist or has been removed.</p>
          <Link
            to="/programmes"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-semibold hover:bg-teal-deep transition-colors"
          >
            <ArrowLeft className="size-4" /> Return to Programmes
          </Link>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="bg-primary/5 border-b border-border py-12 md:py-16">
        <div className="mx-auto w-full max-w-none px-6 md:px-12 lg:px-16">
          <Link
            to="/programmes"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors"
          >
            <ArrowLeft className="size-4" /> Back to Programmes
          </Link>
          <div className="max-w-3xl">
            {programme.category && (
              <span className="inline-block text-xs font-bold uppercase tracking-wider text-mint mb-3">
                {programme.category}
              </span>
            )}
            <h1 className="font-display font-bold text-3xl md:text-4xl lg:text-5xl text-primary leading-tight mb-4">
              {programme.title}
            </h1>
            {programme.summary && (
              <p className="text-lg text-muted-foreground leading-relaxed">
                {programme.summary}
              </p>
            )}
          </div>
        </div>
      </div>

      <section className="py-16 md:py-20">
        <div className="mx-auto w-full max-w-none px-6 md:px-12 lg:px-16 grid md:grid-cols-3 gap-10 lg:gap-12">
          {/* Main Info (Left) */}
          <div className="md:col-span-2 space-y-10">
            {programme.description && (
              <div className="space-y-4">
                <h2 className="font-display font-bold text-2xl text-primary">About the Programme</h2>
                <div className="text-muted-foreground leading-relaxed whitespace-pre-line text-[15px]">
                  {programme.description}
                </div>
              </div>
            )}

            {programme.outcomes && programme.outcomes.length > 0 && (
              <div className="space-y-4 pt-6 border-t border-border">
                <h2 className="font-display font-bold text-2xl text-primary">What You Will Learn</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {programme.outcomes.map((o, idx) => (
                    <div key={idx} className="flex gap-3 text-muted-foreground text-sm leading-relaxed">
                      <CheckCircle2 className="size-5 text-mint shrink-0 mt-0.5" />
                      <span>{o}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {programme.syllabus && programme.syllabus.length > 0 && (
              <div className="space-y-4 pt-6 border-t border-border">
                <h2 className="font-display font-bold text-2xl text-primary">Course Syllabus</h2>
                <div className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border shadow-soft">
                  {programme.syllabus.map((s, idx) => (
                    <div key={idx} className="p-5 flex gap-4 items-start">
                      <div className="size-8 rounded-lg bg-primary-soft text-primary font-bold text-sm grid place-items-center shrink-0">
                        {idx + 1}
                      </div>
                      <div>
                        <h4 className="font-semibold text-primary text-[15px]">{s}</h4>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Card (Right) */}
          <div className="md:col-span-1">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-elegant sticky top-24 space-y-6">
              {programme.cover_image && (
                <div className="aspect-[16/10] rounded-xl overflow-hidden bg-primary-soft">
                  <img
                    src={programme.cover_image}
                    alt={programme.title}
                    className="size-full object-cover"
                  />
                </div>
              )}

              <div className="space-y-4">
                <h3 className="font-bold text-lg text-primary">Programme Details</h3>
                <div className="divide-y divide-border text-sm">
                  {programme.duration && (
                    <div className="py-3 flex justify-between gap-4">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Clock className="size-4 text-mint" /> Duration
                      </span>
                      <span className="font-semibold text-primary">{programme.duration}</span>
                    </div>
                  )}
                  {programme.level && (
                    <div className="py-3 flex justify-between gap-4">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <BarChart className="size-4 text-mint" /> Skill Level
                      </span>
                      <span className="font-semibold text-primary">{programme.level}</span>
                    </div>
                  )}
                  {programme.price && (
                    <div className="py-3 flex justify-between gap-4">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <DollarSign className="size-4 text-mint" /> Price / Tuition
                      </span>
                      <span className="font-semibold text-primary">{programme.price}</span>
                    </div>
                  )}
                </div>
              </div>

              <Link
                to="/apply"
                search={{ programme: programme.title }}
                className="w-full inline-flex items-center justify-center bg-primary text-primary-foreground py-3.5 px-6 rounded-xl font-semibold hover:bg-teal-deep transition-all shadow-elegant text-center text-sm"
              >
                Apply Now
              </Link>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

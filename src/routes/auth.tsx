import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { SiteLayout } from "@/components/SiteLayout";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Staken Hub Academy" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedInstitution, setSelectedInstitution] = useState<{ id: string; name: string; slug: string; logo_url?: string | null; primary_color?: string | null } | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const instSlug = params.get("institution") || params.get("inst") || localStorage.getItem("staken_selected_institution");
    if (instSlug) {
      const cleanSlug = instSlug.trim().toLowerCase();
      localStorage.setItem("staken_selected_institution", cleanSlug);
      (async () => {
        const { data: exact } = await supabase
          .from("institutions" as any)
          .select("*")
          .eq("slug", cleanSlug)
          .maybeSingle();
        if (exact) setSelectedInstitution(exact as any);
      })();
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        if (selectedInstitution?.id) {
          (async () => {
            const { data: userProf } = await supabase
              .from("profiles" as any)
              .select("institution_id")
              .eq("id", data.session.user.id)
              .maybeSingle();
            if (userProf?.institution_id && userProf.institution_id !== selectedInstitution.id) {
              await supabase.auth.signOut();
              toast.error(`Access Denied: Your account belongs to another institution. You cannot log into ${selectedInstitution.name}.`);
              return;
            }
            navigate({ to: "/admin/posters" });
          })();
        } else {
          navigate({ to: "/admin/posters" });
        }
      }
    });
  }, [navigate, selectedInstitution]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (data?.session && selectedInstitution?.id) {
        const { data: userProf } = await supabase
          .from("profiles" as any)
          .select("institution_id")
          .eq("id", data.session.user.id)
          .maybeSingle();
        if (userProf?.institution_id && userProf.institution_id !== selectedInstitution.id) {
          await supabase.auth.signOut();
          toast.error(`Access Denied: Your account belongs to another institution. You cannot log into ${selectedInstitution.name}.`);
          return;
        }
      }
      navigate({ to: "/admin/posters" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SiteLayout>
      <section className="mx-auto max-w-md px-4 sm:px-6 py-20">
        <div className="bg-card border border-border rounded-2xl p-8 shadow-elegant">
          {selectedInstitution && (
            <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border"
              style={{
                backgroundColor: selectedInstitution.primary_color ? `${selectedInstitution.primary_color}15` : undefined,
                color: selectedInstitution.primary_color || undefined,
                borderColor: selectedInstitution.primary_color ? `${selectedInstitution.primary_color}35` : undefined,
              }}
            >
              <span className="size-2 rounded-full animate-pulse shrink-0" style={{ backgroundColor: selectedInstitution.primary_color || '#0d9488' }} />
              <span>{selectedInstitution.name}</span>
            </div>
          )}
          <h1 className="font-display font-bold text-2xl text-primary mb-2">
            {selectedInstitution ? `${selectedInstitution.name} Sign in` : "Admin sign in"}
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            {selectedInstitution ? `Sign in to access ${selectedInstitution.name}` : "Sign in to post and manage posters."}
          </p>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-3 text-sm font-semibold hover:bg-teal-deep transition-colors disabled:opacity-60"
            >
              {loading && <Loader2 className="size-4 animate-spin" />}
              Sign in
            </button>
          </form>
        </div>
      </section>
    </SiteLayout>
  );
}

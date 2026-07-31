import React, { useState, useEffect, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Building2, ChevronDown, ExternalLink, GraduationCap, Sparkles, UserCheck } from "lucide-react";
import { Link } from "@tanstack/react-router";

// Connect to LMS & Portal Supabase backend (xsuktootskxsanncmbtd)
const LMS_SUPABASE_URL = "https://xsuktootskxsanncmbtd.supabase.co";
const LMS_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhzdWt0b290c2t4c2FubmNtYnRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4Nzg3MTgsImV4cCI6MjA5NjQ1NDcxOH0.DoMXLGWnew1QZxRNpjTX2BlhKRkqWpp4Ij3_LaltL20";
const lmsSupabase = createClient(LMS_SUPABASE_URL, LMS_SUPABASE_ANON_KEY);

export interface InstitutionItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo_url?: string;
  is_active?: boolean;
}

export const DEFAULT_INSTITUTIONS: InstitutionItem[] = [
  {
    id: "1",
    name: "Staken Hub Academy",
    slug: "stakenhub",
    description: "Primary Digital & Technology Academy powering the future of African software engineers.",
  },
  {
    id: "2",
    name: "Girls i Save Academy",
    slug: "girls-i-save",
    description: "Empowerment & digital skills portal for young women in technology and innovation.",
  },
  {
    id: "3",
    name: "Daitan Consultancy Academy",
    slug: "daitan",
    description: "Specialized corporate tech training, enterprise development, and consultancy hub.",
  },
];

interface InstitutionsMenuProps {
  compact?: boolean;
}

export function InstitutionsMenu({ compact }: InstitutionsMenuProps) {
  const [selectedInst, setSelectedInst] = useState<InstitutionItem | null>(null);
  const [dbInstitutions, setDbInstitutions] = useState<InstitutionItem[] | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data, error } = await lmsSupabase
          .from("institutions")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: false });

        if (!alive) return;
        if (!error && data) {
          setDbInstitutions(data as InstitutionItem[]);
        }
      } catch (err) {
        console.error("Error fetching institutions from LMS backend:", err);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const institutionsList = useMemo(() => {
    if (dbInstitutions !== null) {
      return dbInstitutions;
    }
    return DEFAULT_INSTITUTIONS;
  }, [dbInstitutions]);

  // URLs for LMS and Portal (detects local development vs production)
  const isLocal = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

  const getAcademyUrl = (slug: string) => 
    isLocal 
      ? `${window.location.origin}/login?institution=${encodeURIComponent(slug)}`
      : `https://academy.stakenhub.com/login?institution=${encodeURIComponent(slug)}`;

  const getPortalUrl = (slug: string) => 
    isLocal 
      ? `${window.location.protocol}//${window.location.hostname}:8082/login?institution=${encodeURIComponent(slug)}`
      : `https://portal.stakenhub.com/login?institution=${encodeURIComponent(slug)}`;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs xl:text-sm font-bold text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
          >
            <Building2 className="size-4 text-primary" />
            <span>Institutions</span>
            <ChevronDown className="size-3.5 opacity-70" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64 p-2">
          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Partner Academies
          </div>
          {institutionsList.map((inst) => (
            <DropdownMenuItem
              key={inst.slug}
              onClick={() => setSelectedInst(inst)}
              className="cursor-pointer flex flex-col items-start gap-0.5 p-2.5 rounded-lg hover:bg-primary/5 transition-colors"
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-semibold text-sm text-foreground">{inst.name}</span>
                <Sparkles className="size-3.5 text-primary opacity-60" />
              </div>
              <span className="text-xs text-muted-foreground line-clamp-1">{inst.description}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Selected Institution Detail Modal */}
      <Dialog open={!!selectedInst} onOpenChange={(open) => !open && setSelectedInst(null)}>
        <DialogContent className="sm:max-w-md p-6 rounded-2xl border border-border bg-card shadow-xl">
          {selectedInst && (
            <div className="space-y-6">
              <DialogHeader className="space-y-2 text-center sm:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold w-fit">
                  <Building2 className="size-3.5" />
                  Partner Institution Academy
                </div>
                <DialogTitle className="text-2xl font-bold tracking-tight text-foreground">
                  {selectedInst.name}
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
                  {selectedInst.description}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 pt-2">
                <a
                  href={getAcademyUrl(selectedInst.slug)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between w-full p-4 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary font-semibold text-sm transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold">
                      <GraduationCap className="size-5" />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-foreground">Online Academy</div>
                      <div className="text-xs text-muted-foreground font-normal">Access learning modules & courses</div>
                    </div>
                  </div>
                  <ExternalLink className="size-4 opacity-70 group-hover:translate-x-0.5 transition-transform" />
                </a>

                <a
                  href={getPortalUrl(selectedInst.slug)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between w-full p-4 rounded-xl border border-border bg-muted/40 hover:bg-muted text-foreground font-semibold text-sm transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-lg bg-secondary text-secondary-foreground flex items-center justify-center font-bold">
                      <UserCheck className="size-5" />
                    </div>
                    <div className="text-left">
                      <div className="font-bold">Student Portal</div>
                      <div className="text-xs text-muted-foreground font-normal">Manage fees, records & profile</div>
                    </div>
                  </div>
                  <ExternalLink className="size-4 opacity-70 group-hover:translate-x-0.5 transition-transform" />
                </a>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-border">
                <Link
                  to="/apply"
                  search={{ programme: undefined }}
                  onClick={() => setSelectedInst(null)}
                  className="inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground px-5 h-10 text-sm font-semibold hover:bg-primary/90 transition-colors"
                >
                  Apply to {selectedInst.name}
                </Link>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

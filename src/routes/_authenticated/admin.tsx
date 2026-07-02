import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  LayoutDashboard,
  BookOpen,
  Rocket,
  Users,
  Star,
  Building2,
  Heart,
  Sparkles,
  Wrench,
  Megaphone,
  Mail,
  Palette,
  LogOut,
  ImageIcon,
  KeyRound,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { CmsTable, type TableConfig } from "@/components/admin/CmsTable";
import stakenHubLogo from "@/assets/staken-hub-logo-teal.png";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin CMS — Staken Hub Academy" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

type SectionKey =
  | "dashboard"
  | "programmes"
  | "bootcamps"
  | "team"
  | "stories"
  | "corp_clients"
  | "corp_services"
  | "why"
  | "modes"
  | "values"
  | "announcements"
  | "messages"
  | "posters"
  | "password";

const SECTIONS: { key: SectionKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "programmes", label: "Programmes", icon: BookOpen },
  { key: "bootcamps", label: "Bootcamps", icon: Rocket },
  { key: "announcements", label: "Event Posters", icon: Megaphone },
  { key: "posters", label: "Poster Uploader", icon: ImageIcon },
  { key: "team", label: "Team", icon: Users },
  { key: "stories", label: "Success Stories", icon: Star },
  { key: "corp_services", label: "Corporate Services", icon: Wrench },
  { key: "corp_clients", label: "Corporate Clients", icon: Building2 },
  { key: "why", label: "Why Choose Us", icon: Sparkles },
  { key: "modes", label: "Learning Modes", icon: Palette },
  { key: "values", label: "About Values", icon: Heart },
  { key: "messages", label: "Contact Messages", icon: Mail },
  { key: "password", label: "Change Password", icon: KeyRound },
];

const CONFIGS: Partial<Record<SectionKey, TableConfig>> = {
  programmes: {
    table: "programmes",
    title: "Programmes",
    description: "Long-form specialised tracks (Cybersecurity, Networking, AI, etc.)",
    orderBy: { column: "sort_order", ascending: true },
    displayColumns: [
      { key: "title", label: "Title" },
      { key: "category", label: "Category" },
      { key: "duration", label: "Duration" },
      { key: "level", label: "Level" },
      { key: "published", label: "Live" },
    ],
    fields: [
      { key: "slug", label: "Slug", type: "text", required: true, placeholder: "cybersecurity" },
      { key: "title", label: "Title", type: "text", required: true },
      { key: "category", label: "Category", type: "text" },
      { key: "duration", label: "Duration", type: "text", placeholder: "12 weeks" },
      { key: "level", label: "Level", type: "text", placeholder: "Beginner / Intermediate" },
      { key: "price", label: "Price", type: "text" },
      { key: "summary", label: "Short Summary", type: "textarea" },
      { key: "description", label: "Full Description", type: "textarea" },
      { key: "outcomes", label: "Learning Outcomes", type: "list", helper: "One per line" },
      { key: "syllabus", label: "Syllabus", type: "list", helper: "One module per line" },
      { key: "cover_image", label: "Cover Image", type: "image" },
      { key: "featured", label: "Featured", type: "boolean" },
      { key: "sort_order", label: "Sort Order", type: "number" },
      { key: "published", label: "Published (visible on site)", type: "boolean" },
    ],
  },
  bootcamps: {
    table: "bootcamps",
    title: "Bootcamps",
    description: "Short intensive cohorts.",
    orderBy: { column: "start_date", ascending: true },
    displayColumns: [
      { key: "title", label: "Title" },
      { key: "duration", label: "Duration" },
      { key: "start_date", label: "Starts" },
      { key: "seats", label: "Seats" },
      { key: "published", label: "Live" },
    ],
    fields: [
      { key: "slug", label: "Slug", type: "text", required: true },
      { key: "title", label: "Title", type: "text", required: true },
      { key: "duration", label: "Duration", type: "text" },
      { key: "level", label: "Level", type: "text" },
      { key: "price", label: "Price", type: "text" },
      { key: "summary", label: "Summary", type: "textarea" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "start_date", label: "Start Date", type: "date" },
      { key: "end_date", label: "End Date", type: "date" },
      { key: "seats", label: "Seats", type: "number" },
      { key: "cover_image", label: "Cover Image", type: "image" },
      { key: "syllabus", label: "Syllabus", type: "list" },
      { key: "sort_order", label: "Sort Order", type: "number" },
      { key: "published", label: "Published", type: "boolean" },
    ],
  },
  announcements: {
    table: "announcements",
    title: "Event Posters",
    description: "Posters shown in the Events navigation (Previous / Current / Future).",
    orderBy: { column: "event_date", ascending: false },
    displayColumns: [
      { key: "image_url", label: "Poster" },
      { key: "title", label: "Title" },
      { key: "event_date", label: "Event Date" },
      { key: "cta_label", label: "CTA" },
    ],
    fields: [
      { key: "title", label: "Title", type: "text", required: true },
      { key: "description", label: "Description", type: "textarea" },
      { key: "image_url", label: "Poster Image", type: "image", required: true },
      { key: "event_date", label: "Event Date", type: "date", helper: "Determines Previous / Current / Future placement" },
      { key: "cta_label", label: "Call-to-action Label", type: "text", placeholder: "Register now" },
      { key: "cta_url", label: "Call-to-action URL", type: "url" },
    ],
  },
  team: {
    table: "team_members",
    title: "Team",
    orderBy: { column: "sort_order", ascending: true },
    displayColumns: [
      { key: "photo_url", label: "Photo" },
      { key: "name", label: "Name" },
      { key: "role", label: "Role" },
      { key: "published", label: "Live" },
    ],
    fields: [
      { key: "name", label: "Name", type: "text", required: true },
      { key: "role", label: "Role", type: "text" },
      { key: "bio", label: "Bio", type: "textarea" },
      { key: "photo_url", label: "Photo", type: "image" },
      { key: "linkedin_url", label: "LinkedIn URL", type: "url" },
      { key: "sort_order", label: "Sort Order", type: "number" },
      { key: "published", label: "Published", type: "boolean" },
    ],
  },
  stories: {
    table: "success_stories",
    title: "Success Stories",
    orderBy: { column: "sort_order", ascending: true },
    displayColumns: [
      { key: "photo_url", label: "Photo" },
      { key: "name", label: "Name" },
      { key: "role", label: "Role" },
      { key: "cohort", label: "Cohort" },
      { key: "published", label: "Live" },
    ],
    fields: [
      { key: "name", label: "Name", type: "text", required: true },
      { key: "role", label: "Role / Title", type: "text" },
      { key: "company", label: "Company", type: "text" },
      { key: "cohort", label: "Cohort", type: "text" },
      { key: "photo_url", label: "Photo", type: "image" },
      { key: "quote", label: "Short Quote", type: "textarea" },
      { key: "story", label: "Full Story", type: "textarea" },
      { key: "linkedin_url", label: "LinkedIn URL", type: "url" },
      { key: "sort_order", label: "Sort Order", type: "number" },
      { key: "published", label: "Published", type: "boolean" },
    ],
  },
  corp_clients: {
    table: "corporate_clients",
    title: "Corporate Clients",
    orderBy: { column: "sort_order", ascending: true },
    displayColumns: [
      { key: "logo_url", label: "Logo" },
      { key: "name", label: "Name" },
      { key: "website_url", label: "Website" },
    ],
    fields: [
      { key: "name", label: "Name", type: "text", required: true },
      { key: "logo_url", label: "Logo", type: "image" },
      { key: "website_url", label: "Website URL", type: "url" },
      { key: "sort_order", label: "Sort Order", type: "number" },
    ],
  },
  corp_services: {
    table: "corporate_services",
    title: "Corporate Services",
    orderBy: { column: "sort_order", ascending: true },
    displayColumns: [
      { key: "title", label: "Title" },
      { key: "icon", label: "Icon" },
    ],
    fields: [
      { key: "icon", label: "Icon Name", type: "text", helper: "lucide-react icon name e.g. ShieldCheck, Brain, Sparkles" },
      { key: "title", label: "Title", type: "text", required: true },
      { key: "description", label: "Description", type: "textarea" },
      { key: "sort_order", label: "Sort Order", type: "number" },
    ],
  },
  why: {
    table: "why_choose_items",
    title: "Why Choose Us",
    orderBy: { column: "sort_order", ascending: true },
    displayColumns: [
      { key: "title", label: "Title" },
      { key: "icon", label: "Icon" },
    ],
    fields: [
      { key: "icon", label: "Icon Name", type: "text", helper: "lucide-react icon name" },
      { key: "title", label: "Title", type: "text", required: true },
      { key: "description", label: "Description", type: "textarea" },
      { key: "sort_order", label: "Sort Order", type: "number" },
    ],
  },
  modes: {
    table: "learning_modes",
    title: "Learning Modes",
    orderBy: { column: "sort_order", ascending: true },
    displayColumns: [
      { key: "title", label: "Title" },
      { key: "icon", label: "Icon" },
    ],
    fields: [
      { key: "icon", label: "Icon Name", type: "text" },
      { key: "title", label: "Title", type: "text", required: true },
      { key: "description", label: "Description", type: "textarea" },
      { key: "sort_order", label: "Sort Order", type: "number" },
    ],
  },
  values: {
    table: "about_values",
    title: "About Values",
    orderBy: { column: "sort_order", ascending: true },
    displayColumns: [
      { key: "title", label: "Title" },
      { key: "icon", label: "Icon" },
    ],
    fields: [
      { key: "icon", label: "Icon Name", type: "text" },
      { key: "title", label: "Title", type: "text", required: true },
      { key: "description", label: "Description", type: "textarea" },
      { key: "sort_order", label: "Sort Order", type: "number" },
    ],
  },
  messages: {
    table: "contact_messages",
    title: "Contact Messages",
    description: "Submissions from the public contact form.",
    orderBy: { column: "created_at", ascending: false },
    displayColumns: [
      { key: "name", label: "Name" },
      { key: "email", label: "Email" },
      { key: "subject", label: "Subject" },
      { key: "is_read", label: "Read" },
      { key: "created_at", label: "Received" },
    ],
    fields: [
      { key: "name", label: "Name", type: "text", required: true },
      { key: "email", label: "Email", type: "text", required: true },
      { key: "phone", label: "Phone", type: "text" },
      { key: "subject", label: "Subject", type: "text" },
      { key: "message", label: "Message", type: "textarea", required: true },
      { key: "is_read", label: "Marked as Read", type: "boolean" },
    ],
  },
};

function AdminPage() {
  const [section, setSection] = useState<SectionKey>("dashboard");

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    window.location.href = "/auth";
  };

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-primary text-primary-foreground flex flex-col sticky top-0 h-screen">
        <div className="p-5 border-b border-white/10 flex items-center gap-2.5">
          <div className="size-9 bg-white rounded-lg p-1 grid place-items-center">
            <img src={stakenHubLogo} alt="Staken Hub" className="size-full object-contain" />
          </div>
          <div>
            <div className="text-sm font-display font-bold leading-tight">STAKEN HUB</div>
            <div className="text-[10px] uppercase tracking-widest opacity-70">Admin CMS</div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto py-3">
          {SECTIONS.map((s) => {
            const Icon = s.icon;
            const active = section === s.key;
            return (
              <button
                key={s.key}
                onClick={() => setSection(s.key)}
                className={`w-full flex items-center gap-3 px-5 py-2.5 text-sm font-medium transition-colors ${
                  active ? "bg-white/10 border-l-2 border-mint" : "hover:bg-white/5 border-l-2 border-transparent"
                }`}
              >
                <Icon className="size-4" />
                <span>{s.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-white/10 space-y-2">
          <Link
            to="/"
            className="w-full text-xs opacity-80 hover:opacity-100 block text-center py-2 rounded-md bg-white/5"
          >
            View Site →
          </Link>
          <Button variant="ghost" size="sm" onClick={signOut} className="w-full text-primary-foreground hover:bg-white/10">
            <LogOut className="size-4 mr-1.5" /> Sign out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 p-8">
        {section === "dashboard" ? (
          <Dashboard onNavigate={setSection} />
        ) : section === "posters" ? (
          <div>
            <h2 className="text-2xl font-display font-bold text-primary mb-2">Poster Uploader</h2>
            <p className="text-sm text-muted-foreground mb-6">
              For quick poster uploads with the legacy tool, use the dedicated poster manager.
            </p>
            <Link to="/admin/posters" className="text-primary underline">
              Open the poster upload page →
            </Link>
          </div>
        ) : section === "password" ? (
          <ChangePassword />
        ) : CONFIGS[section] ? (
          <CmsTable config={CONFIGS[section]!} />
        ) : null}
      </main>
    </div>
  );
}

function Dashboard({ onNavigate }: { onNavigate: (s: SectionKey) => void }) {
  return (
    <div>
      <h1 className="text-3xl font-display font-bold text-primary mb-2">Welcome, Admin</h1>
      <p className="text-muted-foreground mb-8">
        Use the sidebar to manage every piece of content on the Staken Hub Academy website.
        All changes go live instantly.
      </p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {SECTIONS.filter((s) => s.key !== "dashboard").map((s) => {
          const Icon = s.icon;
          return (
            <button
              key={s.key}
              onClick={() => onNavigate(s.key)}
              className="text-left bg-card border border-border rounded-2xl p-6 hover:border-primary/40 hover:shadow-elegant transition-all"
            >
              <div className="size-11 bg-primary-soft text-primary rounded-xl grid place-items-center mb-4">
                <Icon className="size-5" />
              </div>
              <h3 className="font-semibold text-primary">{s.label}</h3>
              <p className="text-xs text-muted-foreground mt-1">Manage {s.label.toLowerCase()}.</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ChangePassword() {
  const [newPassword, setNewPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== repeatPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success("Password updated successfully!");
      setNewPassword("");
      setRepeatPassword("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md">
      <h1 className="text-3xl font-display font-bold text-primary mb-2">Change Password</h1>
      <p className="text-muted-foreground mb-8">
        Update your administrative account password. For security, make sure it is strong and unique.
      </p>

      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 shadow-elegant space-y-4">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5">
            New Password
          </label>
          <input
            type="password"
            required
            minLength={6}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Min 6 characters"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5">
            Repeat New Password
          </label>
          <input
            type="password"
            required
            minLength={6}
            value={repeatPassword}
            onChange={(e) => setRepeatPassword(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Repeat new password"
          />
        </div>
        <Button type="submit" disabled={loading} className="w-full mt-2">
          {loading ? "Updating..." : "Update Password"}
        </Button>
      </form>
    </div>
  );
}

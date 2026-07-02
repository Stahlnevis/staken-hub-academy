import { useState, useEffect } from "react";
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
  UserPlus,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Trash2,
  Loader2,
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { CmsTable, type TableConfig } from "@/components/admin/CmsTable";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
  | "password"
  | "create_admin";

const SECTIONS: { key: SectionKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "programmes", label: "Programmes", icon: BookOpen },
  { key: "bootcamps", label: "Bootcamps", icon: Rocket },
  { key: "announcements", label: "Event Posters", icon: Megaphone },
  { key: "posters", label: "Poster Uploader", icon: ImageIcon },
  { key: "team", label: "Team", icon: Users },
  { key: "stories", label: "Success Stories", icon: Star },
  { key: "corp_services", label: "Corporate Services", icon: Wrench },
  { key: "corp_clients", label: "Collaborators", icon: Building2 },
  { key: "why", label: "Why Choose Us", icon: Sparkles },
  { key: "modes", label: "Learning Modes", icon: Palette },
  { key: "values", label: "About Values", icon: Heart },
  { key: "messages", label: "Contact Messages", icon: Mail },
  { key: "password", label: "Change Password", icon: KeyRound },
  { key: "create_admin", label: "Create Admin", icon: UserPlus },
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
      { key: "category", label: "Category" },
      { key: "event_date", label: "Event Date" },
      { key: "cta_label", label: "CTA" },
    ],
    fields: [
      { key: "title", label: "Title", type: "text", required: true },
      { key: "description", label: "Description", type: "textarea" },
      { key: "image_url", label: "Poster Image", type: "image", required: true },
      {
        key: "category",
        label: "Category",
        type: "select",
        required: true,
        options: [
          { label: "Previous", value: "previous" },
          { label: "Current", value: "current" },
          { label: "Future", value: "future" },
        ],
      },
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
    title: "Collaborators",
    orderBy: { column: "sort_order", ascending: true },
    displayColumns: [
      { key: "logo_url", label: "Logo" },
      { key: "name", label: "Name" },
      { key: "description", label: "Description" },
      { key: "website_url", label: "Website" },
    ],
    fields: [
      { key: "name", label: "Name", type: "text", required: true },
      { key: "description", label: "Description", type: "textarea" },
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
  const [isCollapsed, setIsCollapsed] = useState(false);

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    window.location.href = "/auth";
  };

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Sidebar */}
      <aside className={`shrink-0 bg-primary text-primary-foreground flex flex-col sticky top-0 h-screen transition-all duration-300 ${isCollapsed ? "w-16" : "w-64"}`}>
        {isCollapsed ? (
          <div className="p-4 border-b border-white/10 flex flex-col items-center gap-4">
            <div className="size-9 bg-white rounded-lg p-1 grid place-items-center">
              <img src={stakenHubLogo} alt="Staken Hub" className="size-full object-contain" />
            </div>
            <button
              onClick={() => setIsCollapsed(false)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-primary-foreground/80 hover:text-primary-foreground cursor-pointer"
              title="Expand Sidebar"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        ) : (
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="size-9 bg-white rounded-lg p-1 grid place-items-center">
                <img src={stakenHubLogo} alt="Staken Hub" className="size-full object-contain" />
              </div>
              <div>
                <div className="text-sm font-display font-bold leading-tight">STAKEN HUB</div>
                <div className="text-[10px] uppercase tracking-widest opacity-70">Admin CMS</div>
              </div>
            </div>
            <button
              onClick={() => setIsCollapsed(true)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-primary-foreground/80 hover:text-primary-foreground cursor-pointer"
              title="Collapse Sidebar"
            >
              <ChevronLeft className="size-4" />
            </button>
          </div>
        )}

        <nav className="flex-1 overflow-y-auto py-3">
          {SECTIONS.map((s) => {
            const Icon = s.icon;
            const active = section === s.key;
            return (
              <button
                key={s.key}
                onClick={() => setSection(s.key)}
                className={`w-full flex items-center gap-3 py-2.5 text-sm font-medium transition-colors ${
                  isCollapsed ? "justify-center px-0" : "px-5"
                } ${
                  active ? "bg-white/10 border-l-2 border-mint" : "hover:bg-white/5 border-l-2 border-transparent"
                }`}
                title={isCollapsed ? s.label : undefined}
              >
                <Icon className="size-4 shrink-0" />
                {!isCollapsed && <span>{s.label}</span>}
              </button>
            );
          })}
        </nav>

        {isCollapsed ? (
          <div className="p-4 border-t border-white/10 flex flex-col items-center gap-4">
            <Link
              to="/"
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-primary-foreground/80 hover:text-primary-foreground"
              title="View Site"
            >
              <ExternalLink className="size-4" />
            </Link>
            <button
              onClick={signOut}
              className="p-2 rounded-lg hover:bg-white/10 text-primary-foreground/80 hover:text-primary-foreground cursor-pointer"
              title="Sign out"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        ) : (
          <div className="p-4 border-t border-white/10 space-y-2">
            <Link
              to="/"
              className="w-full text-xs opacity-80 hover:opacity-100 block text-center py-2 rounded-md bg-white/5"
            >
              View Site →
            </Link>
            <Button variant="ghost" size="sm" onClick={signOut} className="w-full text-primary-foreground hover:bg-white/10 justify-start">
              <LogOut className="size-4 mr-1.5" /> Sign out
            </Button>
          </div>
        )}
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
        ) : section === "create_admin" ? (
          <CreateAdmin />
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

function CreateAdmin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<{ id: string; email: string; created_at: string }[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{ id: string; email: string } | null>(null);

  const loadUsers = async () => {
    setLoadingUsers(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setUsers(data ?? []);
    setLoadingUsers(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      // Initialize temporary client to avoid modifying the current session
      const signUpClient = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
          },
        }
      );

      // Sign up the new user
      const { data, error } = await signUpClient.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      if (!data.user) throw new Error("User creation failed");

      // Assign the 'admin' role to the newly created user using the current admin's session
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({
          user_id: data.user.id,
          role: "admin",
        });

      if (roleError) throw roleError;

      toast.success("Admin account created successfully!");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      loadUsers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  const startDelete = (user: { id: string; email: string }) => {
    setUserToDelete(user);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", userToDelete.id);
      if (error) throw error;
      toast.success("User deleted successfully!");
      setDeleteOpen(false);
      setUserToDelete(null);
      loadUsers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12">
      <div className="grid md:grid-cols-12 gap-8 items-start">
        <div className="md:col-span-5 bg-card border border-border rounded-2xl p-6 shadow-elegant">
          <h2 className="text-xl font-display font-bold text-primary mb-2">Create Admin Account</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Register a new administrator account. The new user will be granted administrator access automatically.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="admin@stakenhub.com"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Min 6 characters"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5">
                Confirm Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Confirm password"
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full mt-2">
              {loading ? <Loader2 className="size-4 animate-spin mr-1" /> : <UserPlus className="size-4 mr-1" />}
              Create Admin
            </Button>
          </form>
        </div>

        <div className="md:col-span-7 bg-card border border-border rounded-2xl p-6 shadow-elegant">
          <h2 className="text-xl font-display font-bold text-primary mb-2">Administrators</h2>
          <p className="text-sm text-muted-foreground mb-6">
            A list of all users with administrative access. Deleting a user here immediately revokes their sign-in capability.
          </p>

          {loadingUsers ? (
            <div className="flex justify-center py-12">
              <Loader2 className="size-8 animate-spin text-mint" />
            </div>
          ) : users.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center border border-dashed border-border rounded-xl">
              No administrator accounts found.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-primary-soft/40 text-left">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-primary">Email</th>
                    <th className="px-4 py-3 font-semibold text-primary">Created At</th>
                    <th className="px-4 py-3 text-right font-semibold text-primary">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3 align-middle font-medium text-primary">{u.email}</td>
                      <td className="px-4 py-3 align-middle text-muted-foreground">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 align-middle text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => startDelete(u)}
                          className="hover:bg-destructive/10 text-destructive cursor-pointer"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Revoke Admin Access</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-sm text-muted-foreground">
            Are you sure you want to delete the administrator <b>{userToDelete?.email}</b>? This action will permanently revoke their dashboard access and delete their account.
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setDeleteOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={loading}>
              {loading ? <Loader2 className="size-4 animate-spin mr-1" /> : <Trash2 className="size-4 mr-1" />}
              Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Trash2, Upload, LogOut, ArrowLeft } from "lucide-react";

import { SiteLayout, PageHero } from "@/components/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin/posters")({
  head: () => ({
    meta: [
      { title: "Manage posters — Staken Hub Academy" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPostersPage,
});

type Row = {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  category: string | null;
  event_date: string | null;
  cta_label: string | null;
  cta_url: string | null;
  signedUrl?: string;
};

function AdminPostersPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [loadingRows, setLoadingRows] = useState(true);

  // form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("current");
  const [eventDate, setEventDate] = useState("");
  const [ctaLabel, setCtaLabel] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState<Row | null>(null);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", u.user.id)
        .eq("role", "admin")
        .maybeSingle();
      setIsAdmin(!!data);
    })();
  }, []);

  async function loadRows() {
    setLoadingRows(true);
    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) {
      toast.error(error.message);
      setLoadingRows(false);
      return;
    }

    const resolved = await Promise.all((data ?? []).map(async (r) => {
      if (!r.image_url) {
        return { ...r, signedUrl: "" };
      }
      if (r.image_url.startsWith("http://") || r.image_url.startsWith("https://")) {
        return { ...r, signedUrl: r.image_url };
      }
      const bucket = r.image_url.startsWith("announcements/") ? "media" : "posters";
      try {
        const { data: signed, error: signErr } = await supabase.storage
          .from(bucket)
          .createSignedUrl(r.image_url, 60 * 60 * 4);
        if (signErr || !signed?.signedUrl) {
          throw new Error(signErr?.message || "Failed to create signed URL");
        }
        return { ...r, signedUrl: signed.signedUrl };
      } catch (err) {
        const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(r.image_url);
        return { ...r, signedUrl: publicUrl };
      }
    }));

    setRows(resolved);
    setLoadingRows(false);
  }

  useEffect(() => {
    if (isAdmin) loadRows();
  }, [isAdmin]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      toast.error("Please choose a poster image");
      return;
    }
    setSubmitting(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Not signed in");

      const ext = file.name.split(".").pop() || "jpg";
      const path = `${u.user.id}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("posters")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (upErr) throw upErr;

      const { error: insErr } = await supabase.from("announcements").insert({
        title,
        description: description || null,
        image_url: path,
        category,
        event_date: eventDate || null,
        cta_label: ctaLabel || null,
        cta_url: ctaUrl || null,
        created_by: u.user.id,
      });
      if (insErr) throw insErr;

      toast.success("Poster published");
      setTitle("");
      setDescription("");
      setCategory("current");
      setEventDate("");
      setCtaLabel("");
      setCtaUrl("");
      setFile(null);
      (document.getElementById("poster-file") as HTMLInputElement | null)?.value &&
        ((document.getElementById("poster-file") as HTMLInputElement).value = "");
      await loadRows();
      qc.invalidateQueries({ queryKey: ["announcements"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setSubmitting(false);
    }
  }

  function startDelete(row: Row) {
    setRowToDelete(row);
    setDeleteConfirmOpen(true);
  }

  async function confirmDelete() {
    if (!rowToDelete) return;
    setSubmitting(true);
    const { error: delObj } = await supabase.storage
      .from("posters")
      .remove([rowToDelete.image_url]);
    if (delObj) toast.error(delObj.message);
    const { error } = await supabase.from("announcements").delete().eq("id", rowToDelete.id);
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Deleted");
    setDeleteConfirmOpen(false);
    setRowToDelete(null);
    await loadRows();
    qc.invalidateQueries({ queryKey: ["announcements"] });
  }

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  }

  if (isAdmin === null) {
    return (
      <SiteLayout>
        <div className="flex items-center justify-center py-32">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
      </SiteLayout>
    );
  }

  if (!isAdmin) {
    return (
      <SiteLayout>
        <PageHero title="Admin access required" />
        <section className="mx-auto max-w-2xl px-4 sm:px-6 py-16 text-center">
          <p className="text-muted-foreground mb-6">
            Your account is signed in but doesn't yet have admin permission to
            post posters. Share the email below with the site owner so they can
            grant you access.
          </p>
          <p className="font-mono text-sm bg-muted inline-block rounded-lg px-4 py-2 mb-8">
            (open the Cloud dashboard → user_roles → insert your user_id with role
            "admin")
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              to="/events"
              className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold hover:bg-muted"
            >
              <ArrowLeft className="size-4" /> Back
            </Link>
            <button
              onClick={signOut}
              className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold"
            >
              <LogOut className="size-4" /> Sign out
            </button>
          </div>
        </section>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <PageHero
        eyebrow="Admin"
        title="Manage posters"
        subtitle="Post new bootcamps, programming workshops, scholarships and other activities."
      />
      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-12 grid gap-10 lg:grid-cols-[1fr_1.2fr]">
        <form
          onSubmit={onSubmit}
          className="bg-card border border-border rounded-2xl p-6 shadow-elegant space-y-4 h-fit"
        >
          <h2 className="font-display font-bold text-lg text-primary mb-2">
            New poster
          </h2>

          <Field label="Title *">
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Python Bootcamp — July 2026"
              className={inputCls}
            />
          </Field>

          <Field label="Description">
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short paragraph about the activity"
              className={inputCls}
            />
          </Field>

          <Field label="Category *">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={inputCls}
            >
              <option value="current">Current</option>
              <option value="previous">Previous</option>
              <option value="future">Future</option>
            </select>
          </Field>

          <Field label="Poster image *">
            <input
              id="poster-file"
              type="file"
              accept="image/*"
              required
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-full file:border-0 file:bg-primary file:text-primary-foreground file:px-4 file:py-2 file:text-xs file:font-semibold hover:file:bg-teal-deep"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Event date">
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="CTA label">
              <input
                value={ctaLabel}
                onChange={(e) => setCtaLabel(e.target.value)}
                placeholder="Apply now"
                className={inputCls}
              />
            </Field>
          </div>

          <Field label="CTA link">
            <input
              value={ctaUrl}
              onChange={(e) => setCtaUrl(e.target.value)}
              placeholder="/apply or https://..."
              className={inputCls}
            />
          </Field>

          <button
            type="submit"
            disabled={submitting}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-3 text-sm font-semibold hover:bg-teal-deep disabled:opacity-60"
          >
            {submitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Upload className="size-4" />
            )}
            Publish poster
          </button>

          <button
            type="button"
            onClick={signOut}
            className="w-full text-xs text-muted-foreground hover:text-primary inline-flex items-center justify-center gap-1.5 mt-2"
          >
            <LogOut className="size-3" /> Sign out
          </button>
        </form>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-lg text-primary">
              Published ({rows.length})
            </h2>
            <Link
              to="/events"
              className="text-sm text-primary hover:underline"
            >
              View public page →
            </Link>
          </div>
          {loadingRows ? (
            <div className="py-16 text-center">
              <Loader2 className="size-6 mx-auto animate-spin text-primary" />
            </div>
          ) : rows.length === 0 ? (
            <p className="text-sm text-muted-foreground py-12 text-center border border-dashed border-border rounded-xl">
              No posters yet. Create your first one!
            </p>
          ) : (
            <ul className="space-y-3">
              {rows.map((r) => (
                <li
                  key={r.id}
                  className="flex gap-4 bg-card border border-border rounded-xl p-3"
                >
                  {r.signedUrl && (
                    <img
                      src={r.signedUrl}
                      alt={r.title}
                      className="w-20 h-24 object-cover rounded-lg shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm truncate">{r.title}</p>
                      <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-bold bg-primary-soft text-primary">
                        {r.category || "current"}
                      </span>
                    </div>
                    {r.event_date && (
                      <p className="text-xs text-muted-foreground">
                        {new Date(r.event_date).toLocaleDateString()}
                      </p>
                    )}
                    {r.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {r.description}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => startDelete(r)}
                    aria-label="Delete"
                    className="self-start p-2 rounded-lg text-destructive hover:bg-destructive/10 cursor-pointer"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-sm text-muted-foreground">
            Are you sure you want to delete the poster "{rowToDelete?.title}"? This action cannot be undone.
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setDeleteConfirmOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={submitting}>
              {submitting ? <Loader2 className="size-4 animate-spin mr-1" /> : <Trash2 className="size-4 mr-1" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SiteLayout>
  );
}

const inputCls =
  "mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}

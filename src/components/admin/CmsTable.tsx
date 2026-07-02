import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Pencil, Trash2, X, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "boolean"
  | "date"
  | "url"
  | "image"
  | "list"
  | "select"; // drop-down

export type Field = {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  helper?: string;
  options?: { label: string; value: string }[];
};

export type TableConfig = {
  table: string;
  title: string;
  description?: string;
  displayColumns: { key: string; label: string }[];
  fields: Field[];
  orderBy?: { column: string; ascending: boolean };
  storageBucket?: string; // for image uploads
};

type Row = Record<string, unknown> & { id: string };

function defaultValues(fields: Field[]): Record<string, unknown> {
  const v: Record<string, unknown> = {};
  for (const f of fields) {
    switch (f.type) {
      case "boolean":
        v[f.key] = true;
        break;
      case "number":
        v[f.key] = 0;
        break;
      case "list":
        v[f.key] = [];
        break;
      case "select":
        v[f.key] = f.options?.[0]?.value ?? "";
        break;
      default:
        v[f.key] = "";
    }
  }
  return v;
}

export function CmsTable({ config }: { config: TableConfig }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>(
    defaultValues(config.fields),
  );

  const load = async () => {
    setLoading(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let q: any = (supabase as any).from(config.table).select("*");
    if (config.orderBy) q = q.order(config.orderBy.column, { ascending: config.orderBy.ascending });
    const { data, error } = await q;
    if (error) toast.error(error.message);
    else setRows((data as Row[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.table]);

  const startCreate = () => {
    setEditing(null);
    setForm(defaultValues(config.fields));
    setOpen(true);
  };
  const startEdit = (row: Row) => {
    setEditing(row);
    const f: Record<string, unknown> = {};
    for (const field of config.fields) {
      const v = row[field.key];
      if (field.type === "list") f[field.key] = Array.isArray(v) ? v : [];
      else f[field.key] = v ?? (field.type === "boolean" ? false : field.type === "number" ? 0 : "");
    }
    setForm(f);
    setOpen(true);
  };

  const setField = (k: string, v: unknown) => setForm((prev) => ({ ...prev, [k]: v }));

  const uploadImage = async (fieldKey: string, file: File) => {
    const bucket = config.storageBucket ?? "media";
    const ext = file.name.split(".").pop();
    const path = `${config.table}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });
    if (error) return toast.error(error.message);
    // Bucket is private: create a long-lived signed URL (~100 years)
    const { data, error: signErr } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, 60 * 60 * 24 * 365 * 100);
    if (signErr || !data) return toast.error(signErr?.message ?? "Failed to sign URL");
    setField(fieldKey, data.signedUrl);
    toast.success("Image uploaded");
  };

  const save = async () => {
    setSaving(true);
    const payload: Record<string, unknown> = { ...form };
    // Clean empty strings for nullable text fields
    for (const f of config.fields) {
      if (f.type === "number") payload[f.key] = Number(payload[f.key]) || 0;
      if ((f.type === "text" || f.type === "textarea" || f.type === "url" || f.type === "date" || f.type === "image") && payload[f.key] === "") {
        if (!f.required) payload[f.key] = null;
      }
    }
    let err;
    if (editing) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = await (supabase as any).from(config.table).update(payload).eq("id", editing.id);
      err = res.error;
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = await (supabase as any).from(config.table).insert(payload);
      err = res.error;
    }
    setSaving(false);
    if (err) return toast.error(err.message);
    toast.success(editing ? "Updated" : "Created");
    setOpen(false);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this record?")) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from(config.table).delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Deleted");
      load();
    }
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-display font-bold text-primary">{config.title}</h2>
          {config.description && (
            <p className="text-sm text-muted-foreground mt-1">{config.description}</p>
          )}
        </div>
        <Button onClick={startCreate} className="gap-1.5">
          <Plus className="size-4" /> New
        </Button>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="size-5 animate-spin mr-2" /> Loading…
          </div>
        ) : rows.length === 0 ? (
          <div className="text-center py-16 text-sm text-muted-foreground">
            No records yet. Click <b>New</b> to add one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-primary-soft/40 text-left">
                <tr>
                  {config.displayColumns.map((c) => (
                    <th key={c.key} className="px-4 py-3 font-semibold text-primary">{c.label}</th>
                  ))}
                  <th className="px-4 py-3 text-right font-semibold text-primary">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((row) => (
                  <tr key={row.id} className="hover:bg-muted/30">
                    {config.displayColumns.map((c) => (
                      <td key={c.key} className="px-4 py-3 align-top max-w-[300px] truncate">
                        {renderCell(row[c.key])}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => startEdit(row)}>
                          <Pencil className="size-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => remove(row.id)}>
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit" : "New"} — {config.title}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            {config.fields.map((f) => (
              <FieldInput
                key={f.key}
                field={f}
                value={form[f.key]}
                onChange={(v) => setField(f.key, v)}
                onUpload={(file) => uploadImage(f.key, file)}
              />
            ))}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              <X className="size-4 mr-1" /> Cancel
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving ? <Loader2 className="size-4 animate-spin mr-1" /> : <Save className="size-4 mr-1" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function renderCell(v: unknown) {
  if (v === null || v === undefined) return <span className="text-muted-foreground">—</span>;
  if (typeof v === "boolean") return v ? "✓" : "✗";
  if (Array.isArray(v)) return `${v.length} items`;
  if (typeof v === "string" && (v.startsWith("http") && (v.includes(".png") || v.includes(".jpg") || v.includes(".jpeg") || v.includes(".webp")))) {
    return <img src={v} alt="" className="size-10 rounded object-cover" />;
  }
  const s = String(v);
  return s.length > 60 ? s.slice(0, 60) + "…" : s;
}

function FieldInput({
  field,
  value,
  onChange,
  onUpload,
}: {
  field: Field;
  value: unknown;
  onChange: (v: unknown) => void;
  onUpload: (file: File) => void;
}) {
  const id = `f-${field.key}`;
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id} className="text-sm font-medium">
        {field.label} {field.required && <span className="text-destructive">*</span>}
      </Label>
      {field.type === "textarea" ? (
        <Textarea id={id} rows={4} value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder} />
      ) : field.type === "boolean" ? (
        <Switch id={id} checked={!!value} onCheckedChange={onChange} />
      ) : field.type === "list" ? (
        <Textarea
          id={id}
          rows={5}
          value={Array.isArray(value) ? (value as string[]).join("\n") : ""}
          onChange={(e) => onChange(e.target.value.split("\n").map((s) => s.trim()).filter(Boolean))}
          placeholder={field.placeholder || "One item per line"}
        />
      ) : field.type === "image" ? (
        <div className="flex flex-col gap-2">
          <Input id={id} value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} placeholder="Paste image URL or upload below" />
          <Input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])} />
          {typeof value === "string" && value.startsWith("http") && (
            <img src={value} alt="" className="h-24 object-contain rounded border border-border" />
          )}
        </div>
      ) : field.type === "select" ? (
        <select
          id={id}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary border-border"
        >
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <Input
          id={id}
          type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
          value={(value as string | number) ?? ""}
          onChange={(e) => onChange(field.type === "number" ? Number(e.target.value) : e.target.value)}
          placeholder={field.placeholder}
        />
      )}
      {field.helper && <p className="text-xs text-muted-foreground">{field.helper}</p>}
    </div>
  );
}

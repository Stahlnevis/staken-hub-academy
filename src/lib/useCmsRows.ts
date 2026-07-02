import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useCmsRows<T = Record<string, unknown>>(
  table: string,
  opts?: { orderBy?: string; ascending?: boolean; limit?: number },
) {
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let alive = true;
    (async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let q: any = (supabase as any).from(table).select("*");
      if (opts?.orderBy) q = q.order(opts.orderBy, { ascending: opts.ascending ?? true });
      if (opts?.limit) q = q.limit(opts.limit);
      const { data } = await q;
      if (!alive) return;
      setRows((data as T[]) ?? []);
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table]);
  return { rows, loading };
}

"use client";

import AppFrame from "@/components/app-frame";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/primitives";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export default function FinanceiroClient() {
  const supabase = createClient();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      // troque para sua view real se houver
      const { data } = await supabase.from("v_financeiro_resumo").select("*").limit(100);
      setRows(data ?? []);
      setLoading(false);
    })();
  }, [supabase]);

  return (
    <AppFrame>
      <Card>
        <CardHeader>
          <CardTitle>Financeiro</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Carregando…</div>
          ) : rows.length === 0 ? (
            <div className="text-sm text-gray-500">Sem dados.</div>
          ) : (
            <pre className="text-sm bg-gray-50 p-4 rounded">{JSON.stringify(rows, null, 2)}</pre>
          )}
        </CardContent>
      </Card>
    </AppFrame>
  );
}
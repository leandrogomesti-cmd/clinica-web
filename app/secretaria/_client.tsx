"use client";

import AppFrame from "@/components/app-frame";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/primitives";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export default function SecretariaClient() {
  const supabase = createClient();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("vw_pacientes_intake_ui")
        .select("*")
        .order("created_at", { ascending: true });

      if (!error) setRows(data ?? []);
      setLoading(false);
    })();
  }, [supabase]);

  return (
    <AppFrame>
      <Card>
        <CardHeader>
          <CardTitle>Pendências de cadastro</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Carregando…</div>
          ) : rows.length === 0 ? (
            <div className="text-sm text-gray-500">Sem pendências.</div>
          ) : (
            <pre className="text-sm bg-gray-50 p-4 rounded">{JSON.stringify(rows, null, 2)}</pre>
          )}
        </CardContent>
      </Card>
    </AppFrame>
  );
}
"use client";

import AppFrame from "@/components/app-frame";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/primitives";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export default function PacientesClient() {
  const supabase = createClient();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("patients").select("*").limit(50);
      setItems(data ?? []);
      setLoading(false);
    })();
  }, [supabase]);

  return (
    <AppFrame>
      <Card>
        <CardHeader>
          <CardTitle>Pacientes</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Carregando…</div>
          ) : items.length === 0 ? (
            <div className="text-sm text-gray-500">Nenhum paciente encontrado.</div>
          ) : (
            <pre className="text-sm bg-gray-50 p-4 rounded">{JSON.stringify(items, null, 2)}</pre>
          )}
        </CardContent>
      </Card>
    </AppFrame>
  );
}
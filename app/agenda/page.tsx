// app/agenda/page.tsx
import AppFrame from "@/components/app-frame";
import { Card, CardHeader, CardTitle, CardContent, Button } from "@/components/ui/primitives";
import requireRole from "@/lib/auth/requireRole";

export default async function Page() {
  const { supabase } = await requireRole(["staff", "doctor", "admin"]);

  // appointments: start_time (timestamp), end_time, patient_name
  const { data: appts = [] } = await supabase
    .from("appointments")
    .select("id, start_time, end_time, patient_name");

  // Monta semana (Seg–Sex 08h–17h) com blocos
  const days = ["Seg", "Ter", "Qua", "Qui", "Sex"];
  const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17];

  const events = (appts ?? []).map((a: any) => {
    const start = new Date(a.start_time);
    const end = new Date(a.end_time);
    return {
      day: Math.max(0, Math.min(4, (start.getDay() + 6) % 7)), // transforma: 1=Seg ... 5=Sex
      start: start.getHours(),
      end: end.getHours(),
      title: `Consulta — ${a.patient_name || "Paciente"}`
    };
  });

  return (
    <AppFrame>
      <Card>
        <CardHeader className="flex items-center justify-between">
          <div>
            <CardTitle>Agenda Semanal</CardTitle>
            <p className="text-sm text-gray-500">Arraste para reagendar (prévia)</p>
          </div>
          <div className="flex gap-2 items-center">
            <Button variant="outline" size="sm">Hoje</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-2xl border overflow-hidden">
            <div className="grid grid-cols-[64px_repeat(5,1fr)]">
              <div className="bg-gray-50 p-2 text-xs" />
              {days.map((d, i) => <div key={i} className="bg-gray-50 p-2 text-sm font-medium">{d}</div>)}
            </div>

            <div className="grid grid-cols-[64px_repeat(5,1fr)]">
              <div className="flex flex-col">
                {hours.map(h => (
                  <div key={h} className="h-16 text-xs text-gray-500 pl-2 border-b flex items-start pt-1">
                    {String(h).padStart(2, "0")}:00
                  </div>
                ))}
              </div>

              {days.map((_, dayIdx) => (
                <div key={dayIdx} className="relative">
                  {hours.map(h => <div key={h} className="h-16 border-l border-b" />)}
                  {events.filter(e => e.day === dayIdx).map((e, idx) => (
                    <div
                      key={idx}
                      className="absolute left-2 right-2 rounded-xl shadow-sm border bg-white p-2 text-sm"
                      style={{ top: (e.start - 8) * 64 + 8, height: (e.end - e.start) * 64 - 16 }}
                    >
                      <div className="font-medium">{e.title}</div>
                      <div className="text-xs text-gray-500">
                        {String(e.start).padStart(2, "0")}:00–{String(e.end).padStart(2, "0")}:00
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {events.length === 0 && (
              <div className="p-4 text-sm text-gray-500">Nenhum agendamento.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </AppFrame>
  );
}
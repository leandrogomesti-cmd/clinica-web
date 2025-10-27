// lib/server/demo-store.ts
type Appt = {
  id: string;
  patientPhone: string;   // E.164
  doctorName: string;     // ex.: "Dr Mauricio"
  serviceName: string;    // ex.: "Consulta"
  startsAt: string;       // ISO
  endsAt: string;         // ISO
  status: "CONFIRMED" | "CANCELLED";
};

export interface DemoStore {
  listUpcoming(): Promise<Appt[]>;
  availability(doctorName: string, dateISO: string): Promise<string[]>; // "HH:mm"
  create(a: Omit<Appt,"id"|"status">): Promise<Appt>;
  reschedule(id: string, newStartISO: string): Promise<Appt>;
  cancel(id: string): Promise<boolean>;
  confirm(id: string): Promise<boolean>;
}

const mem: Appt[] = [];
function addMin(iso: string, min: number) {
  const d = new Date(iso);
  d.setMinutes(d.getMinutes() + min);
  return d.toISOString();
}

export const MemoryStore: DemoStore = {
  async listUpcoming() {
    const now = new Date().toISOString();
    return mem.filter(a => a.startsAt >= now).sort((a,b) => a.startsAt.localeCompare(b.startsAt));
  },
  async availability(doctorName, dateISO) {
    const slots: string[] = [];
    for (let h = 8; h <= 17; h++) for (const m of [0,30]) slots.push(`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`);
    const busy = mem
      .filter(a => a.doctorName.toLowerCase() === doctorName.toLowerCase() && a.startsAt.slice(0,10) === dateISO.slice(0,10))
      .map(a => a.startsAt.slice(11,16));
    return slots.filter(s => !busy.includes(s));
  },
  async create(a) {
    // Evita duplicar a chave endsAt ao combinar com ...a
    const { endsAt, ...rest } = a;
    const appt: Appt = {
      id: crypto.randomUUID(),
      status: "CONFIRMED",
      ...rest,                                // patientPhone, doctorName, serviceName, startsAt
      endsAt: endsAt ?? addMin(rest.startsAt, 30), // respeita endsAt se vier; senão calcula
    };
    mem.push(appt);
    return appt;
  },
  async reschedule(id, newStartISO) {
    const i = mem.findIndex(x => x.id === id);
    if (i < 0) throw new Error("Consulta não encontrada");
    mem[i].startsAt = newStartISO;
    mem[i].endsAt = addMin(newStartISO,30);
    mem[i].status = "CONFIRMED";
    return mem[i];
  },
  async cancel(id) {
    const a = mem.find(x => x.id === id);
    if (!a) return false;
    a.status = "CANCELLED";
    return true;
  },
  async confirm(id) {
    const a = mem.find(x => x.id === id);
    if (!a) return false;
    a.status = "CONFIRMED";
    return true;
  }
};

export function KvStore(kv: { get: (k:string)=>Promise<any>; set: (k:string,v:any)=>Promise<any>; }): DemoStore {
  const KEY = "demo:appointments";
  const load = async() => (await kv.get(KEY)) ?? [];
  const save = async(list:any[]) => { await kv.set(KEY, list); };
  return {
    async listUpcoming() {
      const all = await load();
      const now = new Date().toISOString();
      return all.filter((a:any)=>a.startsAt>=now).sort((a:any,b:any)=>a.startsAt.localeCompare(b.startsAt));
    },
    async availability(doctorName, dateISO) {
      const all = await load();
      const slots: string[] = [];
      for (let h = 8; h <= 17; h++) for (const m of [0,30]) slots.push(`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`);
      const busy = all
        .filter((a:any)=>a.doctorName.toLowerCase()===doctorName.toLowerCase() && a.startsAt.slice(0,10)===dateISO.slice(0,10))
        .map((a:any)=>a.startsAt.slice(11,16));
      return slots.filter(s => !busy.includes(s));
    },
    async create(a) {
      const all = await load();
      // Evita duplicar a chave endsAt ao combinar com ...a
      const { endsAt, ...rest } = a;
      const appt: Appt = {
        id: crypto.randomUUID(),
        status: "CONFIRMED",
        ...rest,
        endsAt: endsAt ?? addMin(rest.startsAt, 30),
      };
      all.push(appt);
      await save(all);
      return appt;
    },
    async reschedule(id, newStartISO) {
      const all = await load();
      const i = all.findIndex((x:any)=>x.id===id);
      if (i<0) throw new Error("Consulta não encontrada");
      all[i].startsAt = newStartISO;
      all[i].endsAt = addMin(newStartISO, 30);
      all[i].status = "CONFIRMED";
      await save(all);
      return all[i];
    },
    async cancel(id) { const all = await load(); const a = all.find((x:any)=>x.id===id); if(!a) return false; a.status="CANCELLED"; await save(all); return true; },
    async confirm(id) { const all = await load(); const a = all.find((x:any)=>x.id===id); if(!a) return false; a.status="CONFIRMED"; await save(all); return true; }
  };
}
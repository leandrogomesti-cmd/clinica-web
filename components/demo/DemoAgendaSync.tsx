"use client";
import { useEffect } from "react";
const KEY="ux_agenda_items";

export default function DemoAgendaSync({ children }:{ children: React.ReactNode }) {
  useEffect(() => {
    let stop = false;
    const tick = async () => {
      try {
        const r = await fetch("/api/demo/appointments", { cache: "no-store" });
        const j = await r.json();
        const cur = JSON.parse(localStorage.getItem(KEY) || "[]");
        const merged = mergeUnique(cur, j.items || []);
        localStorage.setItem(KEY, JSON.stringify(merged));
        window.dispatchEvent(new StorageEvent("storage", { key: KEY }));
      } catch {}
      if (!stop) setTimeout(tick, 4000);
    };
    tick();
    return () => { stop = true; };
  }, []);
  return <>{children}</>;
}
function mergeUnique(cur:any[], inc:any[]){
  const map = new Map<string, any>();
  [...cur, ...inc].forEach(x => map.set(String(x.id), x));
  return [...map.values()];
}
"use client";
import dynamic from "next/dynamic";
import DemoAgendaSync from "@/components/demo/DemoAgendaSync";

const Demo = dynamic(() => import("./AppDemoPreview"), { ssr: false });

export default function Page() {
  return (
    <DemoAgendaSync>
      <Demo initialRoute="dashboard" />
    </DemoAgendaSync>
  );
}
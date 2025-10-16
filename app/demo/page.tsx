// app/demo/page.tsx
"use client";
import dynamic from "next/dynamic";

const Demo = dynamic(() => import("./AppDemoPreview"), { ssr: false });

export default function Page() {
  return <Demo initialRoute="dashboard" />;
}
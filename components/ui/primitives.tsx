// components/ui/primitives.tsx
import React from "react";

export function Card(props: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={`rounded-2xl border shadow-sm bg-white ${props.className || ""}`} />;
}
export function CardHeader(props: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={`p-4 border-b ${props.className || ""}`} />;
}
export function CardTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-lg font-semibold">{children}</h3>;
}
export function CardContent(props: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={`p-4 ${props.className || ""}`} />;
}

type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "secondary";
  size?: "sm" | "md";
};
export function Button({ variant = "default", size = "md", className = "", ...rest }: BtnProps) {
  const base = "inline-flex items-center justify-center rounded-xl font-medium transition-colors";
  const sizes = size === "sm" ? "px-3 py-1.5 text-sm" : "px-4 py-2";
  const variants =
    variant === "outline"
      ? "border bg-white hover:bg-gray-50"
      : variant === "secondary"
      ? "bg-gray-100 hover:bg-gray-200"
      : "bg-blue-600 text-white hover:bg-blue-700";
  return <button className={`${base} ${sizes} ${variants} ${className}`} {...rest} />;
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`border rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/40 ${props.className || ""}`}
    />
  );
}
export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`border rounded-xl px-3 py-2 ${props.className || ""}`} />;
}
export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`border rounded-xl px-3 py-2 min-h-[80px] outline-none focus:ring-2 focus:ring-blue-500/40 ${
        props.className || ""
      }`}
    />
  );
}

export function Table(props: React.TableHTMLAttributes<HTMLTableElement>) {
  return <table {...props} className={`w-full text-sm ${props.className || ""}`} />;
}
export function THead(props: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead {...props} className={`bg-gray-50 text-left text-xs text-gray-500 ${props.className || ""}`} />;
}
export function TRow(props: React.HTMLAttributes<HTMLTableRowElement>) {
  return <tr {...props} className={`border-b last:border-0 ${props.className || ""}`} />;
}
export function TH(props: React.ThHTMLAttributes<HTMLTableHeaderCellElement>) {
  return <th {...props} className={`p-3 ${props.className || ""}`} />;
}
export function TD(props: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td {...props} className={`p-3 ${props.className || ""}`} />;
}
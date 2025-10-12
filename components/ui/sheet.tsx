"use client";
import * as React from "react";

export function Sheet({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}) {
  // wrapper simples; só renderiza quando open = true
  return <>{open ? children : null}</>;
}

export function SheetContent({
  children,
  side = "right",
  className = "",
}: {
  children: React.ReactNode;
  side?: "right" | "left";
  className?: string;
}) {
  const sideClasses =
    side === "right"
      ? "right-0"
      : "left-0";
  return (
    <div
      className={`fixed top-0 ${sideClasses} h-full w-full sm:max-w-xl bg-white shadow-xl overflow-auto ${className}`}
      role="dialog"
      aria-modal="true"
    >
      {children}
    </div>
  );
}

export function SheetHeader({ children }: { children: React.ReactNode }) {
  return <div className="p-4 border-b">{children}</div>;
}
export function SheetTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-lg font-semibold">{children}</h3>;
}
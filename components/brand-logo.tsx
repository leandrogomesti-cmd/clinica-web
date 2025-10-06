// components/brand-logo.tsx
import React from "react";
import Link from "next/link";

export default function BrandLogo() {
  const [loaded, setLoaded] = React.useState(false);
  const dataUri = `data:image/svg+xml;utf8,${encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' width='120' height='24' viewBox='0 0 120 24'><rect width='120' height='24' rx='6' fill='%231e40af'/><text x='12' y='16' font-size='12' font-family='Arial, Helvetica, sans-serif' fill='white'>KlinikIA</text></svg>"
  )}`;
  const srcs = ["/logo_oficial.png", dataUri];
  const [idx, setIdx] = React.useState(0);

  return (
    <Link href="/" className="inline-flex items-center gap-2">
      {!loaded && (
        <div className="h-6 w-[120px] rounded-md bg-blue-600 text-white grid place-items-center text-xs font-semibold">
          KlinikIA
        </div>
      )}
      <img
        src={srcs[idx]}
        alt="KlinikIA"
        className={`h-6 w-auto ${loaded ? "" : "hidden"}`}
        onLoad={() => setLoaded(true)}
        onError={() => setIdx((i) => Math.min(i + 1, srcs.length - 1))}
      />
      <span className="sr-only">KlinikIA</span>
    </Link>
  );
}
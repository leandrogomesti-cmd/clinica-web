// components/brand-logo.tsx
import Image from "next/image";
import Link from "next/link";

export default function BrandLogo() {
  return (
    <Link href="/" className="inline-flex items-center gap-2">
      <Image
        src="/logo_oficial.png"
        alt="KlinikIA"
        width={160}
        height={40}
        priority
      />
      <span className="sr-only">KlinikIA</span>
    </Link>
  );
}
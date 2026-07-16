"use client";

import Link from "next/link";
import type { TenantBanner } from "@/lib/tenant/types";

export function AnnouncementBar({ banners }: { banners: TenantBanner[] }) {
  const active = banners.filter((b) => b.active);
  if (active.length === 0) return null;
  const banner = active[0]!;

  const content = (
    <p className="text-center text-xs font-medium tracking-wide">
      {banner.message}
    </p>
  );

  return (
    <div className="bg-[hsl(var(--accent))] px-4 py-2 text-[hsl(var(--accent-foreground))]">
      {banner.href ? <Link href={banner.href}>{content}</Link> : content}
    </div>
  );
}

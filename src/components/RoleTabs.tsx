// src/components/RoleTabs.tsx
"use client";

import { useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";

type Props = {
  labels?: { junior?: string; senior?: string }; // ✅ 선택적 라벨
};

export default function RoleTabs({ labels }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const active: "junior" | "senior" = useMemo(
    () => (pathname?.startsWith("/expert") ? "senior" : "junior"),
    [pathname]
  );

  const base =
    "relative inline-flex items-end text-[18px] font-semibold pb-1 transition-colors duration-150";
  // after 콘텐츠 반드시 지정
  const activeClasses =
    "text-neutral-900 after:content-[''] after:absolute after:left-0 after:right-0 after:-bottom-0.5 after:h-[2px] after:bg-neutral-900 after:rounded-full";
  const inactiveClasses = "text-neutral-400";

  return (
    <div className="flex gap-8">
      <button
        aria-current={active === "junior" ? "page" : undefined}
        className={`${base} ${active === "junior" ? activeClasses : inactiveClasses}`}
        onClick={() => router.push("/junior")}
      >
        {labels?.junior ?? "후배"}
      </button>
      <button
        aria-current={active === "senior" ? "page" : undefined}
        className={`${base} ${active === "senior" ? activeClasses : inactiveClasses}`}
        onClick={() => router.push("/expert")}
      >
        {labels?.senior ?? "선배"}
      </button>
    </div>
  );
}

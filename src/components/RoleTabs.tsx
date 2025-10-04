"use client";
import { useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function RoleTabs() {
  const router = useRouter();
  const pathname = usePathname();

  // 현재 경로로 활성 탭 결정
  const active: "junior" | "senior" = useMemo(() => {
    return pathname?.startsWith("/expert") ? "senior" : "junior";
  }, [pathname]);

  const base =
    "text-[18px] font-semibold relative pb-1 transition-colors duration-150";

  const activeClasses =
    "text-neutral-900 after:absolute after:left-0 after:right-0 after:-bottom-0.5 after:h-[2px] after:rounded-full after:bg-neutral-900";
  const inactiveClasses = "text-neutral-400";

  return (
    <div className="flex gap-8">
      {/* 후배 → "/" */}
      <button
        aria-current={active === "junior" ? "page" : undefined}
        className={`${base} ${active === "junior" ? activeClasses : inactiveClasses}`}
        onClick={() => router.push("/")}
      >
        후배
      </button>

      {/* 선배 → "/expert" */}
      <button
        aria-current={active === "senior" ? "page" : undefined}
        className={`${base} ${active === "senior" ? activeClasses : inactiveClasses}`}
        onClick={() => router.push("/expert")}
      >
        선배
      </button>
    </div>
  );
}

// src/app/location/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelectedDong } from "@/lib/locationStore";
import { getCurrentDong, getNearbyDongs, searchDongByKeyword } from "@/lib/location";

export default function LocationPage() {
  const router = useRouter();
  const { dong, setDong } = useSelectedDong();
  const [query, setQuery] = useState("");
  const [nearby, setNearby] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        // API 키가 없으면 getCurrentDong()이 null을 줄 수 있음
        const cur = await getCurrentDong();     // 이름 or null
        const around = await getNearbyDongs();  // 이름 리스트 or []
        const merged = Array.from(new Set([cur, ...around].filter(Boolean))) as string[];
        setNearby(merged.slice(0, 8));
      } catch {
        setNearby([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const [results, setResults] = useState<string[]>([]);
  useEffect(() => {
    let cancel = false;
    (async () => {
      if (!query.trim()) return setResults(nearby);
      const r = await searchDongByKeyword(query.trim());
      if (!cancel) setResults(r);
    })();
    return () => { cancel = true; };
  }, [query, nearby]);

  return (
    <div className="fixed inset-0 z-[120] bg-white">
      {/* TopBar가 고정이라 동일 높이 스페이서 필요 */}
      <div style={{ height: "calc(56px + env(safe-area-inset-top))" }} />

      {/* 검색창 */}
      <div className="px-4 pb-2">
        <div className="flex items-center gap-2 border rounded-xl px-3 h-12">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="동 이름으로 검색 (예: 대현동)"
            className="flex-1 outline-none text-base"
            autoFocus
          />
          <button className="text-sm text-neutral-600" onClick={() => setQuery("")}>
            지우기
          </button>
        </div>
      </div>

      <div className="px-4 py-2 text-sm text-neutral-500">
        {query ? "검색 결과" : "현재 위치 주변 동"}
      </div>

      <div className="px-2">
        {loading ? (
          <div className="px-2 py-4 text-neutral-500">불러오는 중…</div>
        ) : (results?.length ?? 0) === 0 ? (
          <div className="px-2 py-4 text-neutral-500">
            결과가 없어요. {process.env.NEXT_PUBLIC_GEOCODER ?? "" ? "" : " (역지오코딩 API 키 미설정)"}
          </div>
        ) : (
          <ul className="divide-y">
            {results.map((name) => (
              <li key={name}>
                <button
                  onClick={() => { setDong(name); router.back(); }}
                  className="w-full text-left px-4 py-3 text-[16px]"
                >
                  {name}
                  {dong === name && <span className="ml-2 text-xs text-emerald-600">현재 선택</span>}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

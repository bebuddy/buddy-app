"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/apiFetch";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const hasChecked = useRef(false);

  useEffect(() => {
    if (hasChecked.current) return;
    hasChecked.current = true;

    const checkAuth = async () => {
      try {
        alert("[AuthGate] /api/users/me 호출 시작");
        const res = await apiFetch("/api/users/me", { cache: "no-store" });
        alert(`[AuthGate] 응답 수신: status=${res.status}`);
        if (res.status === 401) {
          router.replace("/sign-in");
          return;
        }
        const json = await res.json();
        alert(`[AuthGate] 파싱 완료: success=${json?.success}, user=${json?.data?.nick_name ?? "null"}`);
      } catch (error) {
        alert(`[AuthGate] 에러: ${error instanceof Error ? error.message : String(error)}`);
        console.error("auth check failed:", error);
      }
      setReady(true);
    };

    void checkAuth();
  }, [router]);

  if (!ready) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-600">
        로그인 확인 중입니다...
      </div>
    );
  }

  return <>{children}</>;
}

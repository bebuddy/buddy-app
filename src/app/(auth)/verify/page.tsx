"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  isNativeIOS,
  getPendingNativeTokens,
  clearPendingNativeTokens,
} from "@/lib/googleAuth";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string;

export default function VerifyPage() {
  const router = useRouter();
  const handlingRef = useRef(false);

  useEffect(() => {
    // ── Web 전용: DB 조회 후 라우팅 ──
    const verifyUser = async (authId: string) => {
      const { data: existing, error: selectErr } = await supabase
        .from("users")
        .select("id, status")
        .eq("auth_id", authId)
        .single();

      if (selectErr && selectErr.code !== "PGRST116") {
        console.error("[verify] users select error:", selectErr);
        return;
      }

      if (!existing) {
        const { error: insertErr } = await supabase
          .from("users")
          .insert({
            auth_id: authId,
            provider: "GOOGLE",
            status: "PENDING",
          });
        if (insertErr) {
          console.error("[verify] users insert error:", insertErr);
          return;
        }
        router.push(`/sign-up?auth_id=${authId}`);
      } else if (existing.status === "PENDING") {
        router.push(`/sign-up?auth_id=${authId}`);
      } else {
        router.push("/junior");
      }
    };

    const native = isNativeIOS();
    const pendingTokens = native ? getPendingNativeTokens() : null;

    // ── Native iOS: 서버 API로 토큰 검증 + 라우팅 ──
    // WKWebView에서 Supabase JS 내부 fetch가 "Load failed"이므로
    // plain fetch()로 같은 origin 서버를 호출하여 우회
    if (pendingTokens) {
      (async () => {
        try {
          const res = await fetch("/api/auth/verify-native", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              accessToken: pendingTokens.accessToken,
              refreshToken: pendingTokens.refreshToken,
            }),
          });

          const result = await res.json();

          if (!res.ok) {
            console.error("[verify] verify-native failed:", result.error);
            clearPendingNativeTokens();
            window.location.href = "/sign-in";
            return;
          }

          // Supabase 클라이언트가 다음 페이지에서 세션을 인식하도록
          // localStorage에 세션을 수동 저장
          const projectRef = new URL(SUPABASE_URL).hostname.split(".")[0];
          const storageKey = `sb-${projectRef}-auth-token`;
          localStorage.setItem(storageKey, JSON.stringify(result.session));

          clearPendingNativeTokens();

          // window.location.href로 풀 리로드 → Supabase가 localStorage에서
          // 세션을 다시 읽어 apiFetch()의 Bearer 토큰이 정상 작동
          if (result.action === "sign-up") {
            window.location.href = `/sign-up?auth_id=${result.authId}`;
          } else {
            window.location.href = "/junior";
          }
        } catch (e) {
          console.error("[verify] verify-native fetch error:", e);
          clearPendingNativeTokens();
          window.location.href = "/sign-in";
        }
      })();
      return; // native flow에서는 onAuthStateChange 불필요
    }

    // ── Web: 기존 onAuthStateChange 기반 플로우 ──
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event !== "INITIAL_SESSION" && event !== "SIGNED_IN") return;
      if (handlingRef.current) return;
      handlingRef.current = true;

      const user = session?.user;
      if (!user) {
        router.push("/sign-in");
        return;
      }

      setTimeout(() => verifyUser(user.id), 0);
    });

    return () => subscription.unsubscribe();
  }, [router]);

  return (
    <div className="flex justify-center items-center min-h-screen text-gray-600">
      로그인 확인 중입니다...
    </div>
  );
}

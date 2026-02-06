"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function VerifyPage() {
  const router = useRouter();
  const hasAlertedRef = useRef(false);
  const handlingRef = useRef(false);

  const alertOnce = (message: string) => {
    if (hasAlertedRef.current) return;
    hasAlertedRef.current = true;
    alert(message);
  };

  useEffect(() => {
    const getStoredSession = (): { accessToken: string; refreshToken: string } | null => {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
        const projectRef = new URL(supabaseUrl).hostname.split(".")[0];
        const storageKey = `sb-${projectRef}-auth-token`;
        const raw = localStorage.getItem(storageKey);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed?.access_token || !parsed?.refresh_token) return null;
        return { accessToken: parsed.access_token, refreshToken: parsed.refresh_token };
      } catch (e) {
        console.error("[verify] Failed to read stored session:", e);
        return null;
      }
    };

    const handleSession = async (session: { user?: { id: string } } | null, source: string) => {
      if (handlingRef.current) return;
      handlingRef.current = true;

      const user = session?.user;
      console.log("[verify] handleSession:", source, user ? "has user" : "no user");

      if (!user) {
        console.error("[verify] No user in session");
        alertOnce("세션이 없습니다. 다시 로그인해주세요.");
        handlingRef.current = false;
        return router.push("/sign-in");
      }

      const authId = user.id;

      const { data: existing, error: selectErr } = await supabase
        .from("users")
        .select("id, status")
        .eq("auth_id", authId)
        .single();

      if (selectErr && selectErr.code !== "PGRST116") {
        console.error("[verify] users select error:", selectErr);
        alertOnce(`사용자 조회 실패: ${selectErr.message || selectErr.code || "unknown"}`);
        handlingRef.current = false;
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
          alertOnce(`사용자 생성 실패: ${insertErr.message || insertErr.code || "unknown"}`);
          handlingRef.current = false;
          return;
        }
        router.push(`/sign-up?auth_id=${authId}`);
      } else if (existing.status === "PENDING") {
        router.push(`/sign-up?auth_id=${authId}`);
      } else {
        router.push("/junior");
      }
    };

    // onAuthStateChange의 INITIAL_SESSION 이벤트를 사용하면
    // 내부 초기화(토큰 교환 등)가 완료된 뒤에 안전하게 세션을 받을 수 있음
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("[verify] onAuthStateChange:", event, session?.user ? "has user" : "no user");
        // INITIAL_SESSION: 초기화 완료 시점, SIGNED_IN: OAuth 콜백으로 새 세션
        if (event !== "INITIAL_SESSION" && event !== "SIGNED_IN") return;
        await handleSession(session, event);
      },
    );

    const checkSession = async () => {
      console.log("[verify] checkSession start");
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("[verify] getSession error:", error);
      }

      if (data.session) {
        await handleSession(data.session, "GET_SESSION");
        return;
      }

      const stored = getStoredSession();
      if (stored) {
        console.log("[verify] Found stored session in localStorage, setting...");
        const { error: setErr } = await supabase.auth.setSession({
          access_token: stored.accessToken,
          refresh_token: stored.refreshToken,
        });
        if (setErr) {
          console.error("[verify] setSession error:", setErr);
          alertOnce(`세션 설정 실패: ${setErr.message || setErr.code || "unknown"}`);
          return;
        }

        const { data: afterData } = await supabase.auth.getSession();
        if (afterData.session) {
          await handleSession(afterData.session, "SET_SESSION");
          return;
        }
      }

      console.warn("[verify] No session found");
      alertOnce("세션을 찾지 못했습니다. 다시 로그인해주세요.");
      router.push("/sign-in");
    };

    checkSession();

    return () => subscription.unsubscribe();
  }, [router]);

  return (
    <div className="flex justify-center items-center min-h-screen text-gray-600">
      로그인 확인 중입니다...
    </div>
  );
}

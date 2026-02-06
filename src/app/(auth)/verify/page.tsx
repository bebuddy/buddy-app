"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  isNativeIOS,
  getPendingNativeTokens,
  clearPendingNativeTokens,
} from "@/lib/googleAuth";

export default function VerifyPage() {
  const router = useRouter();
  const handlingRef = useRef(false);

  useEffect(() => {
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

    // Native iOS pending tokens 감지
    const pendingTokens = isNativeIOS() ? getPendingNativeTokens() : null;
    // recovery 진행 중일 때 INITIAL_SESSION(null)을 무시하기 위한 플래그
    const nativeRecoveryInProgress = !!pendingTokens;
    let nativeRecoveryDone = false;

    // 1) onAuthStateChange 리스너 먼저 등록
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // Native recovery 진행 중 INITIAL_SESSION(null) 무시
      // Supabase 키에 세션이 없으므로 null이 발생함
      if (
        nativeRecoveryInProgress &&
        !nativeRecoveryDone &&
        event === "INITIAL_SESSION" &&
        !session
      ) {
        console.log("[verify] Ignoring INITIAL_SESSION(null) during native recovery");
        return;
      }

      if (event !== "INITIAL_SESSION" && event !== "SIGNED_IN") return;
      if (handlingRef.current) return;
      handlingRef.current = true;

      const user = session?.user;
      if (!user) {
        router.push("/sign-in");
        return;
      }

      // setTimeout으로 _initialize() 체인을 끊어야 deadlock 방지
      // onAuthStateChange 콜백은 _initialize() 내부에서 await되므로
      // 여기서 supabase DB 쿼리를 하면 initializePromise 대기 → deadlock
      setTimeout(() => verifyUser(user.id), 0);
    });

    // 2) Native iOS pending tokens가 있으면 setSession() 호출
    if (pendingTokens) {
      const recoverNativeSession = async (retry = false) => {
        console.log(`[verify] Recovering native session${retry ? " (retry)" : ""}...`);
        const { error } = await supabase.auth.setSession({
          access_token: pendingTokens.accessToken,
          refresh_token: pendingTokens.refreshToken,
        });

        if (error) {
          console.error("[verify] setSession failed:", error.message);
          if (!retry) {
            // 500ms 후 1회 재시도
            setTimeout(() => recoverNativeSession(true), 500);
            return;
          }
          // 재시도도 실패 → sign-in으로
          clearPendingNativeTokens();
          nativeRecoveryDone = true;
          router.push("/sign-in");
          return;
        }

        // 성공 — 토큰 정리, setSession()이 SIGNED_IN 이벤트를 발생시킴
        clearPendingNativeTokens();
        nativeRecoveryDone = true;
        console.log("[verify] Native session recovered successfully");
      };

      recoverNativeSession();
    }

    return () => subscription.unsubscribe();
  }, [router]);

  return (
    <div className="flex justify-center items-center min-h-screen text-gray-600">
      로그인 확인 중입니다...
    </div>
  );
}

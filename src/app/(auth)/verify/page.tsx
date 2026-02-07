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

    // ── Native iOS 2단계 핸드오프 (진단 alert 포함) ──
    const native = isNativeIOS();
    const pendingTokens = native ? getPendingNativeTokens() : null;
    const nativeRecoveryInProgress = !!pendingTokens;
    let nativeRecoveryDone = false;

    // 1) onAuthStateChange 리스너 먼저 등록
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // Native recovery 진행 중 INITIAL_SESSION(null) 무시
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

      // ── ALERT 6: onAuthStateChange 이벤트 확인 ──
      if (nativeRecoveryInProgress) {
        alert(`[ALERT 6] onAuthStateChange\nevent=${event}\nuser.id=${user.id}`);
      }

      setTimeout(() => verifyUser(user.id), 0);
    });

    // 2) Native iOS pending tokens → 진단 + setSession
    if (pendingTokens) {
      (async () => {
        // ── ALERT 1: 기본 상태 확인 ──
        alert(
          `[ALERT 1]\nisNativeIOS=${native}\nhasPendingTokens=true`
        );

        // ── ALERT 2: 토큰 미리보기 ──
        alert(
          `[ALERT 2] tokens preview\nAT=${pendingTokens.accessToken.substring(0, 20)}...\nRT=${pendingTokens.refreshToken.substring(0, 20)}...`
        );

        // ── ALERT 3: 네트워크 상태 ──
        alert(
          `[ALERT 3]\nnavigator.onLine=${navigator.onLine}\nSupabase URL=${SUPABASE_URL}`
        );

        // ── 네트워크 probe ──
        let probeResult: string;
        try {
          const res = await fetch(`${SUPABASE_URL}/auth/v1/settings`, {
            method: "GET",
            cache: "no-store",
          });
          probeResult = `ok=${res.ok}, status=${res.status}`;
        } catch (e) {
          probeResult = `FAIL: ${e instanceof Error ? e.message : String(e)}`;
        }

        // ── ALERT 4: probe 결과 ──
        alert(`[ALERT 4] network probe\n${probeResult}`);

        // ── setSession 호출 ──
        const { data, error } = await supabase.auth.setSession({
          access_token: pendingTokens.accessToken,
          refresh_token: pendingTokens.refreshToken,
        });

        // ── ALERT 5: setSession 결과 ──
        if (error) {
          alert(
            `[ALERT 5] setSession FAILED\n` +
            `message=${error.message}\n` +
            `name=${error.name}\n` +
            `status=${error.status}`
          );
          clearPendingNativeTokens();
          nativeRecoveryDone = true;
          router.push("/sign-in");
        } else {
          alert(
            `[ALERT 5] setSession SUCCESS\nuser.id=${data.session?.user?.id ?? "null"}`
          );
          clearPendingNativeTokens();
          nativeRecoveryDone = true;
          console.log("[verify] Native session recovered successfully");
        }
      })();
    }

    return () => subscription.unsubscribe();
  }, [router]);

  return (
    <div className="flex justify-center items-center min-h-screen text-gray-600">
      로그인 확인 중입니다...
    </div>
  );
}

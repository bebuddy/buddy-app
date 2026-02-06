"use client";

import { useEffect, useRef } from "react";
import { Capacitor } from "@capacitor/core";
import type { PluginListenerHandle } from "@capacitor/core";
import { App } from "@capacitor/app";
import { supabase } from "@/lib/supabase";

export default function DeepLinkHandler() {
  const handlingRef = useRef(false);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    // Supabase에서 pending session 조회
    const checkPendingSession = async () => {
      const sessionId = localStorage.getItem("pending_auth_session_id");
      if (!sessionId) return;
      if (handlingRef.current) return;

      console.log("[Auth] Checking pending session:", sessionId);

      try {
        const { data, error } = await supabase
          .from("pending_auth_sessions")
          .select("access_token, refresh_token")
          .eq("session_id", sessionId)
          .single();

        if (error || !data) {
          console.log("[Auth] No pending session found");
          return;
        }

        handlingRef.current = true;
        console.log("[Auth] Found pending session, setting up...");

        // 토큰으로 세션 설정
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: data.access_token,
          refresh_token: data.refresh_token,
        });

        if (sessionError) {
          console.error("[Auth] Session error:", sessionError);
          handlingRef.current = false;
          return;
        }

        // pending session 삭제
        await supabase
          .from("pending_auth_sessions")
          .delete()
          .eq("session_id", sessionId);

        // localStorage 정리
        localStorage.removeItem("pending_auth_session_id");

        // 인앱 브라우저 닫기
        try {
          const { Browser } = await import("@capacitor/browser");
          await Browser.close();
        } catch (e) {
          console.log("[Auth] Browser close skipped");
        }

        console.log("[Auth] Success! Redirecting to /verify");
        window.location.href = "/verify";
      } catch (e) {
        console.error("[Auth] Check error:", e);
        handlingRef.current = false;
      }
    };

    // 앱이 foreground로 돌아올 때 확인
    let stateListener: PluginListenerHandle | null = null;
    App.addListener("appStateChange", ({ isActive }) => {
      if (isActive) {
        console.log("[Auth] App became active, checking session...");
        checkPendingSession();
      }
    }).then((handle) => {
      stateListener = handle;
    });

    // 초기 로드 시에도 확인
    checkPendingSession();

    return () => {
      if (stateListener) stateListener.remove();
    };
  }, []);

  return null;
}

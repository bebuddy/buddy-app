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

    // pending session 확인 (폴링 방식)
    const checkPendingSession = async () => {
      const sessionId = localStorage.getItem("pending_auth_session_id");
      if (!sessionId) return;
      if (handlingRef.current) return;

      try {
        const res = await fetch(`/api/auth/pending-session?sessionId=${sessionId}`);
        const data = await res.json();

        if (data.found && data.accessToken && data.refreshToken) {
          handlingRef.current = true;
          // session_id 삭제
          localStorage.removeItem("pending_auth_session_id");

          const { error } = await supabase.auth.setSession({
            access_token: data.accessToken,
            refresh_token: data.refreshToken,
          });

          if (error) {
            handlingRef.current = false;
            console.error("Session set error:", error);
            return;
          }

          // 페이지 새로고침으로 세션 반영
          window.location.href = "/verify";
        }
      } catch (e) {
        console.error("Failed to check pending session:", e);
      }
    };

    // 앱이 foreground로 돌아올 때 pending session 확인
    let stateListener: PluginListenerHandle | null = null;
    App.addListener("appStateChange", ({ isActive }) => {
      if (isActive) {
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

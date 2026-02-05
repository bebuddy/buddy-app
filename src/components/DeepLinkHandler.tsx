"use client";

import { useEffect, useRef } from "react";
import { Capacitor } from "@capacitor/core";
import type { PluginListenerHandle } from "@capacitor/core";
import { App } from "@capacitor/app";
import { supabase } from "@/lib/supabase";

function parseAuthTokens(url: string) {
  if (!url.includes("buddyapp://auth")) return null;
  const queryString = url.split("?")[1] ?? "";
  const params = new URLSearchParams(queryString);
  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");
  const error = params.get("error");
  return { accessToken, refreshToken, error };
}

export default function DeepLinkHandler() {
  const handlingRef = useRef(false);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const handleDeepLink = async (url: string) => {
      console.log("[DeepLink] Received:", url);

      const parsed = parseAuthTokens(url);
      if (!parsed) {
        console.log("[DeepLink] Not an auth URL");
        return;
      }

      const { accessToken, refreshToken, error } = parsed;

      if (error) {
        alert("로그인 중 문제가 발생했습니다: " + error);
        return;
      }

      if (!accessToken || !refreshToken) {
        console.log("[DeepLink] Missing tokens");
        return;
      }

      if (handlingRef.current) {
        console.log("[DeepLink] Already handling");
        return;
      }
      handlingRef.current = true;

      console.log("[DeepLink] Setting session...");
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (sessionError) {
        handlingRef.current = false;
        alert("세션 설정 실패: " + sessionError.message);
        return;
      }

      console.log("[DeepLink] Session set, redirecting to /verify");
      window.location.href = "/verify";
    };

    // 앱이 열릴 때 딥링크 확인 (앱이 종료된 상태에서 열릴 때)
    App.getLaunchUrl().then((result) => {
      console.log("[DeepLink] getLaunchUrl:", result?.url);
      if (result?.url) handleDeepLink(result.url);
    });

    // 앱이 실행 중일 때 딥링크 수신
    let urlListener: PluginListenerHandle | null = null;
    App.addListener("appUrlOpen", ({ url }) => {
      console.log("[DeepLink] appUrlOpen:", url);
      if (url) handleDeepLink(url);
    }).then((handle) => {
      urlListener = handle;
    });

    return () => {
      if (urlListener) urlListener.remove();
    };
  }, []);

  return null;
}

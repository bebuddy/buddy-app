"use client";

import { useEffect, useRef } from "react";
import { Capacitor } from "@capacitor/core";
import type { PluginListenerHandle } from "@capacitor/core";
import { App } from "@capacitor/app";
import { supabase } from "@/lib/supabase";

function parseAuthTokens(url: string) {
  if (!url.startsWith("buddyapp://auth")) return null;
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
      // 디버깅: 받은 URL 확인
      alert(`[DEBUG] 딥링크 수신: ${url.substring(0, 100)}...`);

      const parsed = parseAuthTokens(url);
      if (!parsed) {
        alert("[DEBUG] 파싱 실패: buddyapp://auth가 아님");
        return;
      }

      const { accessToken, refreshToken, error } = parsed;
      if (error) {
        alert(`[DEBUG] OAuth 에러: ${error}`);
        return;
      }

      if (!accessToken || !refreshToken) {
        alert(`[DEBUG] 토큰 없음 - access: ${!!accessToken}, refresh: ${!!refreshToken}`);
        return;
      }

      if (handlingRef.current) {
        alert("[DEBUG] 이미 처리 중");
        return;
      }
      handlingRef.current = true;

      alert("[DEBUG] setSession 시작...");
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (sessionError) {
        handlingRef.current = false;
        alert(`[DEBUG] setSession 실패: ${sessionError.message}`);
        return;
      }

      alert("[DEBUG] 세션 설정 완료! /verify로 이동합니다.");
      // 페이지 새로고침으로 세션 확실히 반영
      window.location.href = "/verify";
    };

    let sub: PluginListenerHandle | null = null;
    void App.addListener("appUrlOpen", ({ url }) => {
      if (url) void handleDeepLink(url);
    }).then((handle) => {
      sub = handle;
    });

    App.getLaunchUrl().then((result) => {
      if (result?.url) void handleDeepLink(result.url);
    });

    return () => {
      if (sub) void sub.remove();
    };
  }, []);

  return null;
}

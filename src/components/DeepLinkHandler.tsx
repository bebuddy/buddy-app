"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Capacitor } from "@capacitor/core";
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
  const router = useRouter();
  const handlingRef = useRef(false);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const handleDeepLink = async (url: string) => {
      const parsed = parseAuthTokens(url);
      if (!parsed) return;

      const { accessToken, refreshToken, error } = parsed;
      if (error) {
        alert("로그인 중 문제가 발생했습니다. 다시 시도해주세요.");
        return;
      }

      if (!accessToken || !refreshToken) return;
      if (handlingRef.current) return;
      handlingRef.current = true;

      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (sessionError) {
        handlingRef.current = false;
        alert("세션 설정 중 오류가 발생했습니다.");
        return;
      }

      router.replace("/verify");
    };

    const sub = App.addListener("appUrlOpen", ({ url }) => {
      if (url) void handleDeepLink(url);
    });

    App.getLaunchUrl().then((result) => {
      if (result?.url) void handleDeepLink(result.url);
    });

    return () => {
      sub.remove();
    };
  }, [router]);

  return null;
}

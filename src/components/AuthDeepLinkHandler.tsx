"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { App } from "@capacitor/app";
import { Browser } from "@capacitor/browser";
import { Capacitor } from "@capacitor/core";
import { supabase } from "@/lib/supabase";

const AUTH_SCHEME = "buddyapp";
const AUTH_HOST = "auth";
const AUTH_PATH = "/callback";

export default function AuthDeepLinkHandler() {
  const router = useRouter();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let listener: { remove: () => void | Promise<void> } | null = null;
    let handled = false;

    const handleAuthUrl = async (url?: string) => {
      if (!url || handled) return;

      try {
        const parsedUrl = new URL(url);
        if (parsedUrl.protocol !== `${AUTH_SCHEME}:`) return;
        if (parsedUrl.hostname !== AUTH_HOST) return;
        if (!parsedUrl.pathname.startsWith(AUTH_PATH)) return;

        handled = true;

        const code = parsedUrl.searchParams.get("code");
        const hashParams = new URLSearchParams(parsedUrl.hash.replace(/^#/, ""));
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            router.replace("/sign-in");
            return;
          }
        } else if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (error) {
            router.replace("/sign-in");
            return;
          }
        } else {
          router.replace("/sign-in");
          return;
        }

        await Browser.close();
        router.replace("/verify");
      } catch (error) {
        console.error("Native auth deep link error:", error);
        router.replace("/sign-in");
      }
    };

    const setupListener = async () => {
      listener = await App.addListener("appUrlOpen", ({ url }) => {
        void handleAuthUrl(url);
      });

      const launchUrl = await App.getLaunchUrl();
      if (launchUrl?.url) {
        void handleAuthUrl(launchUrl.url);
      }
    };

    void setupListener();

    return () => {
      if (listener) {
        void listener.remove();
      }
    };
  }, [router]);

  return null;
}

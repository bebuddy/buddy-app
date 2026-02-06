import { createBrowserClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { Capacitor } from "@capacitor/core";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY as string;

function isNativeApp(): boolean {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

// iOS: createClient (localStorage 기반, WKWebView에서 안정적)
// Web: createBrowserClient (쿠키 기반, SSR 호환)
export const supabase = isNativeApp()
  ? createClient(supabaseUrl, supabaseKey)
  : createBrowserClient(supabaseUrl, supabaseKey);

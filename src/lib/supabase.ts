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

// WKWebView에서 navigator.locks가 hang되는 문제 우회
// 안전을 위해 양쪽 클라이언트 모두 적용 (isNativeApp 판정이 잘못될 수 있음)
const noopLock = async <R>(
  _name: string,
  _acquireTimeout: number,
  fn: () => Promise<R>,
): Promise<R> => await fn();

// iOS: createClient (localStorage 기반)
// Web: createBrowserClient (쿠키 기반, SSR 호환)
export const supabase = isNativeApp()
  ? createClient(supabaseUrl, supabaseKey, {
      auth: { lock: noopLock },
    })
  : createBrowserClient(supabaseUrl, supabaseKey, {
      auth: { lock: noopLock },
    });

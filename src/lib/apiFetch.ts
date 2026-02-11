import { supabase } from "@/lib/supabase";
import { isNativeIOS } from "@/lib/nativeAuth";

type ApiFetchOptions = RequestInit & { auth?: boolean };

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

/**
 * Native iOS에서는 supabase.auth.getSession()이 내부 토큰 refresh 시도로
 * WKWebView에서 hang되므로, localStorage에서 직접 토큰을 읽는다.
 */
function getAccessTokenDirect(): string | null {
  try {
    const projectRef = new URL(SUPABASE_URL).hostname.split(".")[0];
    const raw = localStorage.getItem(`sb-${projectRef}-auth-token`);
    if (!raw) return null;
    const session = JSON.parse(raw);
    return session?.access_token ?? null;
  } catch {
    return null;
  }
}

export async function apiFetch(input: RequestInfo | URL, init: ApiFetchOptions = {}) {
  const { auth = true, headers, ...rest } = init;
  const mergedHeaders = new Headers(headers);

  if (auth && !mergedHeaders.has("Authorization")) {
    let accessToken: string | null = null;

    if (isNativeIOS()) {
      // Native iOS: localStorage에서 직접 읽기 (getSession() hang 방지)
      accessToken = getAccessTokenDirect();
    } else {
      // Web: 기존 getSession() 사용
      try {
        const { data } = await supabase.auth.getSession();
        accessToken = data.session?.access_token ?? null;
      } catch {
        // fallback to cookie-based auth on web
      }
    }

    if (accessToken) {
      mergedHeaders.set("Authorization", `Bearer ${accessToken}`);
    }
  }

  return fetch(input, { ...rest, headers: mergedHeaders });
}

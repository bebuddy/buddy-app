import { supabase } from "@/lib/supabase";

type ApiFetchOptions = RequestInit & { auth?: boolean };

// 디버깅: 첫 호출만 alert (매 호출마다 뜨면 너무 많으므로)
let debugAlertShown = false;

export async function apiFetch(input: RequestInfo | URL, init: ApiFetchOptions = {}) {
  const { auth = true, headers, ...rest } = init;
  const mergedHeaders = new Headers(headers);

  if (auth && !mergedHeaders.has("Authorization")) {
    try {
      // ── ALERT D1: getSession 호출 전 localStorage 확인 ──
      if (!debugAlertShown) {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
        const projectRef = supabaseUrl ? new URL(supabaseUrl).hostname.split(".")[0] : "unknown";
        const storageKey = `sb-${projectRef}-auth-token`;
        const raw = localStorage.getItem(storageKey);
        alert(
          `[ALERT D1] apiFetch 진입\n` +
          `url=${String(input).substring(0, 60)}\n` +
          `storageKey=${storageKey}\n` +
          `localStorage 존재=${!!raw}\n` +
          `localStorage 길이=${raw?.length ?? 0}`
        );
      }

      const { data, error } = await supabase.auth.getSession();

      // ── ALERT D2: getSession 결과 ──
      if (!debugAlertShown) {
        const accessToken = data.session?.access_token;
        alert(
          `[ALERT D2] getSession 결과\n` +
          `session 존재=${!!data.session}\n` +
          `access_token=${accessToken ? accessToken.substring(0, 20) + "..." : "null"}\n` +
          `error=${error?.message ?? "none"}\n` +
          `user.id=${data.session?.user?.id ?? "null"}`
        );
        debugAlertShown = true;
      }

      const accessToken = data.session?.access_token;
      if (accessToken) {
        mergedHeaders.set("Authorization", `Bearer ${accessToken}`);
      }
    } catch (e) {
      // ── ALERT D3: getSession 예외 ──
      if (!debugAlertShown) {
        alert(
          `[ALERT D3] getSession 예외\n` +
          `${e instanceof Error ? e.message : String(e)}`
        );
        debugAlertShown = true;
      }
    }
  }

  return fetch(input, { ...rest, headers: mergedHeaders });
}

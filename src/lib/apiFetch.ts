import { supabase } from "@/lib/supabase";

type ApiFetchOptions = RequestInit & { auth?: boolean };

export async function apiFetch(input: RequestInfo | URL, init: ApiFetchOptions = {}) {
  const { auth = true, headers, ...rest } = init;
  const mergedHeaders = new Headers(headers);

  if (auth && !mergedHeaders.has("Authorization")) {
    try {
      const { data } = await supabase.auth.getSession();
      const accessToken = data.session?.access_token;
      if (accessToken) {
        mergedHeaders.set("Authorization", `Bearer ${accessToken}`);
      }
    } catch {
      // ignore: fallback to cookie-based auth on web
    }
  }

  return fetch(input, { ...rest, headers: mergedHeaders });
}

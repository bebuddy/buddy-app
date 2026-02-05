import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

async function createSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_KEY as string,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: Record<string, unknown>) {
          cookieStore.set({ name, value, ...options, path: "/" });
        },
        remove(name: string, options: Record<string, unknown>) {
          cookieStore.delete({ name, ...options, path: "/" });
        },
      },
    }
  );
}

export async function GET(request: NextRequest) {
  const provider = (request.nextUrl.searchParams.get("provider") ?? "google") as "google";
  const isApp = request.nextUrl.searchParams.get("app") === "true";
  const sessionId = request.nextUrl.searchParams.get("session_id");
  const supabase = await createSupabaseClient();

  const origin =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    request.nextUrl.origin;

  // 앱인 경우 콜백 URL에 app=true와 session_id 추가
  let redirectTo = `${origin}/api/auth/callback`;
  if (isApp) {
    redirectTo += `?app=true`;
    if (sessionId) {
      redirectTo += `&session_id=${encodeURIComponent(sessionId)}`;
    }
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
    },
  });

  if (error || !data?.url) {
    return NextResponse.redirect(new URL("/sign-in?error=oauth", origin));
  }

  return NextResponse.redirect(data.url);
}

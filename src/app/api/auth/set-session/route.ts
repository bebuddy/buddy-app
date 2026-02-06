import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const accessToken = formData.get("access_token") as string;
  const refreshToken = formData.get("refresh_token") as string;
  const origin = request.nextUrl.origin;

  if (!accessToken || !refreshToken) {
    return NextResponse.redirect(new URL("/sign-in?error=missing_tokens", origin), 303);
  }

  // 리다이렉트 응답을 먼저 생성하여 쿠키가 이 응답에 포함되도록 함
  const response = NextResponse.redirect(new URL("/verify", origin), 303);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_KEY as string,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: Record<string, unknown>) {
          response.cookies.set({ name, value, ...options, path: "/" });
        },
        remove(name: string, options: Record<string, unknown>) {
          response.cookies.set({ name, value: "", ...options, path: "/" });
        },
      },
    }
  );

  const { error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (error) {
    console.error("[set-session] setSession error:", error.message);
    return NextResponse.redirect(new URL("/sign-in?error=session_failed", origin), 303);
  }

  console.log("[set-session] Session set successfully, redirecting to /verify");
  return response;
}

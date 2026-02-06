import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const accessToken = formData.get("access_token") as string;
  const refreshToken = formData.get("refresh_token") as string;
  const origin = request.nextUrl.origin;

  if (!accessToken || !refreshToken) {
    return NextResponse.redirect(new URL("/sign-in?error=missing_tokens", origin));
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
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

  const { error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (error) {
    console.error("[set-session] setSession error:", error.message);
    return NextResponse.redirect(new URL("/sign-in?error=session_failed", origin));
  }

  console.log("[set-session] Session set successfully, redirecting to /verify");
  return NextResponse.redirect(new URL("/verify", origin));
}

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
  const code = request.nextUrl.searchParams.get("code");
  const origin = request.nextUrl.origin;
  const isApp = request.nextUrl.searchParams.get("app") === "true";

  if (!code) {
    if (isApp) {
      return NextResponse.redirect("buddyapp://auth?error=missing_code");
    }
    return NextResponse.redirect(new URL("/sign-in?error=missing_code", origin));
  }

  const supabase = await createSupabaseClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.session) {
    if (isApp) {
      return NextResponse.redirect("buddyapp://auth?error=exchange_failed");
    }
    return NextResponse.redirect(new URL("/sign-in?error=exchange_failed", origin));
  }

  // 앱인 경우 딥링크로 토큰 전달
  if (isApp) {
    const { access_token, refresh_token } = data.session;
    return NextResponse.redirect(
      `buddyapp://auth?access_token=${access_token}&refresh_token=${refresh_token}`
    );
  }

  return NextResponse.redirect(new URL("/verify", origin));
}

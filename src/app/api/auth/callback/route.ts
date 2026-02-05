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

// 앱으로 딥링크 리다이렉트하는 HTML 페이지 반환
function createDeepLinkResponse(deepLinkUrl: string) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>로그인 완료</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
      </head>
      <body>
        <p style="text-align: center; margin-top: 100px; font-family: sans-serif;">
          앱으로 이동 중...
        </p>
        <script>
          window.location.href = "${deepLinkUrl}";
        </script>
      </body>
    </html>
  `;
  return new NextResponse(html, {
    headers: { "Content-Type": "text/html" },
  });
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const origin = request.nextUrl.origin;
  const isApp = request.nextUrl.searchParams.get("app") === "true";

  if (!code) {
    if (isApp) {
      return createDeepLinkResponse("buddyapp://auth?error=missing_code");
    }
    return NextResponse.redirect(new URL("/sign-in?error=missing_code", origin));
  }

  const supabase = await createSupabaseClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.session) {
    if (isApp) {
      return createDeepLinkResponse("buddyapp://auth?error=exchange_failed");
    }
    return NextResponse.redirect(new URL("/sign-in?error=exchange_failed", origin));
  }

  // 앱인 경우 딥링크로 토큰 전달
  if (isApp) {
    const { access_token, refresh_token } = data.session;
    return createDeepLinkResponse(
      `buddyapp://auth?access_token=${access_token}&refresh_token=${refresh_token}`
    );
  }

  return NextResponse.redirect(new URL("/verify", origin));
}

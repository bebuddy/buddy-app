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
function createDeepLinkResponse(deepLinkUrl: string, isError = false) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>로그인 ${isError ? "실패" : "완료"}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            background: #f5f5f5;
          }
          .container {
            text-align: center;
            padding: 20px;
          }
          h1 { font-size: 24px; margin-bottom: 16px; }
          p { color: #666; margin-bottom: 24px; }
          .btn {
            display: inline-block;
            background: #4285f4;
            color: white;
            padding: 16px 32px;
            border-radius: 12px;
            text-decoration: none;
            font-size: 18px;
            font-weight: 600;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>${isError ? "로그인 실패" : "로그인 완료!"}</h1>
          <p>${isError ? "다시 시도해주세요." : "아래 버튼을 눌러 앱으로 돌아가세요."}</p>
          <a href="${deepLinkUrl}" class="btn">앱으로 돌아가기</a>
        </div>
        <script>
          // 자동으로 시도하되, 실패하면 버튼 사용
          setTimeout(() => { window.location.href = "${deepLinkUrl}"; }, 100);
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
      return createDeepLinkResponse("buddyapp://auth?error=missing_code", true);
    }
    return NextResponse.redirect(new URL("/sign-in?error=missing_code", origin));
  }

  const supabase = await createSupabaseClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.session) {
    if (isApp) {
      return createDeepLinkResponse("buddyapp://auth?error=exchange_failed", true);
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

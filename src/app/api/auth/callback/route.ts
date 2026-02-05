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


// 앱으로 돌아가라는 HTML 페이지 반환 (폴링 방식)
function createAppReturnResponse(isError = false, errorMsg = "") {
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
          p { color: #666; margin-bottom: 24px; line-height: 1.6; }
          .success-icon {
            font-size: 64px;
            margin-bottom: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          ${isError
            ? `<h1>로그인 실패</h1><p>${errorMsg || "다시 시도해주세요."}</p>`
            : `<div class="success-icon">✅</div>
               <h1>로그인 완료!</h1>
               <p>이제 Safari를 닫고<br><strong>벗 앱으로 돌아가주세요.</strong></p>
               <p style="font-size: 14px; color: #999;">앱에서 자동으로 로그인됩니다.</p>`
          }
        </div>
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
  const sessionId = request.nextUrl.searchParams.get("session_id");

  if (!code) {
    if (isApp) {
      return createAppReturnResponse(true, "인증 코드가 없습니다.");
    }
    return NextResponse.redirect(new URL("/sign-in?error=missing_code", origin));
  }

  const supabase = await createSupabaseClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.session) {
    const errorMsg = error?.message || "세션을 가져올 수 없습니다";
    console.error("exchangeCodeForSession error:", error);
    if (isApp) {
      return createAppReturnResponse(true, `오류: ${errorMsg}`);
    }
    return NextResponse.redirect(new URL("/sign-in?error=exchange_failed", origin));
  }

  // 앱인 경우: 토큰을 서버에 임시 저장하고 앱으로 돌아가라고 안내
  if (isApp && sessionId) {
    const { access_token, refresh_token } = data.session;

    // pending-session API에 토큰 저장
    try {
      await fetch(`${origin}/api/auth/pending-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          accessToken: access_token,
          refreshToken: refresh_token,
        }),
      });
    } catch (e) {
      console.error("Failed to save pending session:", e);
    }

    return createAppReturnResponse(false);
  }

  // 앱인데 session_id가 없는 경우 (이전 방식 호환)
  if (isApp) {
    return createAppReturnResponse(false);
  }

  return NextResponse.redirect(new URL("/verify", origin));
}

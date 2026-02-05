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

// 수동으로 토큰 교환 (앱용)
async function exchangeCodeForTokens(code: string, codeVerifier: string, redirectUri: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;

  const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=authorization_code`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": process.env.NEXT_PUBLIC_SUPABASE_KEY as string,
    },
    body: JSON.stringify({
      auth_code: code,
      code_verifier: codeVerifier,
      redirect_uri: redirectUri,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token exchange failed: ${error}`);
  }

  return response.json();
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
  const state = request.nextUrl.searchParams.get("state");
  const origin = request.nextUrl.origin;
  const isApp = request.nextUrl.searchParams.get("app") === "true";

  if (!code) {
    if (isApp) {
      return createAppReturnResponse(true, "인증 코드가 없습니다.");
    }
    return NextResponse.redirect(new URL("/sign-in?error=missing_code", origin));
  }

  // 앱인 경우: state에서 code_verifier와 session_id 추출
  if (isApp && state) {
    try {
      // state 디코딩
      const stateData = JSON.parse(Buffer.from(state, "base64url").toString());
      const { sessionId, codeVerifier } = stateData;

      if (!sessionId || !codeVerifier) {
        return createAppReturnResponse(true, "인증 정보가 올바르지 않습니다.");
      }

      const redirectUri = `${origin}/api/auth/callback?app=true`;

      // 수동으로 토큰 교환
      const tokenData = await exchangeCodeForTokens(code, codeVerifier, redirectUri);

      if (!tokenData.access_token || !tokenData.refresh_token) {
        return createAppReturnResponse(true, "토큰을 받지 못했습니다.");
      }

      // pending-session API에 토큰 저장
      await fetch(`${origin}/api/auth/pending-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          accessToken: tokenData.access_token,
          refreshToken: tokenData.refresh_token,
        }),
      });

      return createAppReturnResponse(false);
    } catch (e) {
      console.error("App auth error:", e);
      const errorMsg = e instanceof Error ? e.message : String(e);
      return createAppReturnResponse(true, errorMsg.substring(0, 200));
    }
  }

  // 웹인 경우: 기존 방식
  const supabase = await createSupabaseClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.session) {
    const errorMsg = error?.message || "세션을 가져올 수 없습니다";
    console.error("exchangeCodeForSession error:", error);
    return NextResponse.redirect(new URL("/sign-in?error=exchange_failed", origin));
  }

  return NextResponse.redirect(new URL("/verify", origin));
}

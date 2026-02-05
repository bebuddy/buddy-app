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


// 앱으로 토큰 전달하는 HTML 페이지 반환
function createAppReturnResponse(isError = false, errorMsg = "", tokens?: { accessToken: string; refreshToken: string }) {
  // 에러인 경우
  if (isError) {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>로그인 실패</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f5f5f5; }
            .container { text-align: center; padding: 20px; }
            h1 { font-size: 24px; margin-bottom: 16px; }
            p { color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>로그인 실패</h1>
            <p>${errorMsg || "다시 시도해주세요."}</p>
          </div>
        </body>
      </html>
    `;
    return new NextResponse(html, { headers: { "Content-Type": "text/html" } });
  }

  // 성공인 경우: 딥링크로 토큰 전달
  const deepLinkUrl = tokens
    ? `buddyapp://auth?access_token=${encodeURIComponent(tokens.accessToken)}&refresh_token=${encodeURIComponent(tokens.refreshToken)}`
    : "buddyapp://auth";

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>로그인 완료</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { font-family: -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f5f5f5; }
          .container { text-align: center; padding: 20px; }
          h1 { font-size: 24px; margin-bottom: 16px; }
          p { color: #666; margin-bottom: 24px; line-height: 1.6; }
          .btn { display: inline-block; background: #7C3AED; color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-size: 18px; font-weight: 600; }
          .loading { font-size: 48px; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="loading">⏳</div>
          <h1>로그인 완료!</h1>
          <p id="status">앱으로 이동 중...</p>
          <a href="${deepLinkUrl}" class="btn" id="btn" style="display:none;">앱으로 돌아가기</a>
        </div>
        <script>
          // 딥링크로 앱 열기 시도
          window.location.href = "${deepLinkUrl}";

          // 2초 후에도 여기 있으면 버튼 표시
          setTimeout(function() {
            document.getElementById('status').textContent = '앱이 열리지 않으면 버튼을 눌러주세요';
            document.getElementById('btn').style.display = 'inline-block';
            document.querySelector('.loading').textContent = '✅';
          }, 2000);
        </script>
      </body>
    </html>
  `;
  return new NextResponse(html, { headers: { "Content-Type": "text/html" } });
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

      // 딥링크로 토큰 전달
      return createAppReturnResponse(false, "", {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
      });
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

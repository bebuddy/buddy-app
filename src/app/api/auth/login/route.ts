import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import crypto from "crypto";

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

// PKCE용 code_verifier 생성
function generateCodeVerifier(): string {
  return crypto.randomBytes(32).toString("base64url");
}

// code_verifier에서 code_challenge 생성
function generateCodeChallenge(codeVerifier: string): string {
  return crypto.createHash("sha256").update(codeVerifier).digest("base64url");
}

export async function GET(request: NextRequest) {
  const provider = (request.nextUrl.searchParams.get("provider") ?? "google") as "google";
  const isApp = request.nextUrl.searchParams.get("app") === "true";
  const sessionId = request.nextUrl.searchParams.get("session_id");

  const origin =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    request.nextUrl.origin;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;

  // 앱인 경우: PKCE를 직접 처리하여 code_verifier를 state에 포함
  if (isApp && sessionId) {
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);

    // state에 session_id와 code_verifier를 base64로 인코딩하여 포함
    const stateData = JSON.stringify({ sessionId, codeVerifier });
    const state = Buffer.from(stateData).toString("base64url");

    // OAuth URL 직접 구성
    const redirectTo = `${origin}/api/auth/callback?app=true`;

    const oauthUrl = new URL(`${supabaseUrl}/auth/v1/authorize`);
    oauthUrl.searchParams.set("provider", provider);
    oauthUrl.searchParams.set("redirect_to", redirectTo);
    oauthUrl.searchParams.set("code_challenge", codeChallenge);
    oauthUrl.searchParams.set("code_challenge_method", "S256");
    oauthUrl.searchParams.set("state", state);

    return NextResponse.redirect(oauthUrl.toString());
  }

  // 웹인 경우: 기존 방식 사용
  const supabase = await createSupabaseClient();
  const redirectTo = `${origin}/api/auth/callback`;

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

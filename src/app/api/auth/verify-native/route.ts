import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Native iOS 전용: WKWebView에서 Supabase JS의 setSession()이
 * "Load failed" (CORS preflight 실패)로 동작하지 않으므로,
 * 서버에서 토큰 검증 + 유저 조회를 수행하고 JSON으로 반환.
 */
export async function POST(request: NextRequest) {
  const { accessToken, refreshToken } = await request.json();

  if (!accessToken || !refreshToken) {
    return NextResponse.json({ error: "missing_tokens" }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_KEY!,
  );

  // 1. setSession으로 토큰 검증 + 새 세션 획득
  const { data, error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (error || !data.session) {
    console.error("[verify-native] setSession error:", error?.message);
    return NextResponse.json(
      { error: error?.message || "no_session" },
      { status: 401 },
    );
  }

  const authId = data.session.user.id;

  // 2. users 테이블 조회/생성
  const { data: existing, error: selectErr } = await supabase
    .from("users")
    .select("id, status")
    .eq("auth_id", authId)
    .single();

  if (selectErr && selectErr.code !== "PGRST116") {
    console.error("[verify-native] users select error:", selectErr);
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }

  let action: string;

  if (!existing) {
    const { error: insertErr } = await supabase.from("users").insert({
      auth_id: authId,
      provider: "GOOGLE",
      status: "PENDING",
    });
    if (insertErr) {
      console.error("[verify-native] users insert error:", insertErr);
      return NextResponse.json({ error: "insert_error" }, { status: 500 });
    }
    action = "sign-up";
  } else if (existing.status === "PENDING") {
    action = "sign-up";
  } else {
    action = "junior";
  }

  // 3. 클라이언트가 localStorage에 저장할 세션 데이터 포함
  return NextResponse.json({
    action,
    authId,
    session: {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_at: data.session.expires_at,
      expires_in: data.session.expires_in,
      token_type: data.session.token_type,
      user: data.session.user,
    },
  });
}

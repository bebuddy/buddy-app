import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Native iOS Apple Sign-In 전용:
 * ASAuthorizationAppleIDProvider에서 받은 identityToken을
 * signInWithIdToken()으로 검증 후 세션 반환.
 */
export async function POST(request: NextRequest) {
  const { identityToken } = await request.json();

  if (!identityToken) {
    return NextResponse.json({ error: "missing_identity_token" }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_KEY!,
  );

  // 1. Apple identityToken으로 Supabase 인증
  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: "apple",
    token: identityToken,
  });

  if (error || !data.session) {
    console.error("[apple-native] signInWithIdToken error:", error?.message);
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
    console.error("[apple-native] users select error:", selectErr);
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }

  let action: string;

  if (!existing) {
    const { error: insertErr } = await supabase.from("users").insert({
      auth_id: authId,
      provider: "APPLE",
      status: "PENDING",
    });
    if (insertErr) {
      console.error("[apple-native] users insert error:", insertErr);
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

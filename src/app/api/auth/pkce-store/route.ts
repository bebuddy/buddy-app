import { NextRequest, NextResponse } from "next/server";

// PKCE code_verifier 임시 저장소
const pkceStore = new Map<string, { codeVerifier: string; createdAt: number }>();

// 10분 후 만료
const EXPIRY_MS = 10 * 60 * 1000;

function cleanupExpired() {
  const now = Date.now();
  for (const [key, value] of pkceStore.entries()) {
    if (now - value.createdAt > EXPIRY_MS) {
      pkceStore.delete(key);
    }
  }
}

// POST: code_verifier 저장
export async function POST(request: NextRequest) {
  try {
    const { sessionId, codeVerifier } = await request.json();

    if (!sessionId || !codeVerifier) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    cleanupExpired();

    pkceStore.set(sessionId, {
      codeVerifier,
      createdAt: Date.now(),
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

// GET: code_verifier 조회 및 삭제
export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("sessionId");

  if (!sessionId) {
    return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
  }

  cleanupExpired();

  const data = pkceStore.get(sessionId);

  if (!data) {
    return NextResponse.json({ found: false });
  }

  // 조회 후 삭제 (일회용)
  pkceStore.delete(sessionId);

  return NextResponse.json({
    found: true,
    codeVerifier: data.codeVerifier,
  });
}

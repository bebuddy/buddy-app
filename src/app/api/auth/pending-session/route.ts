import { NextRequest, NextResponse } from "next/server";

// 메모리에 임시 토큰 저장 (프로덕션에서는 Redis 사용 권장)
// Vercel serverless에서는 요청 간 공유되지 않을 수 있으므로 KV 사용 고려
const pendingSessions = new Map<string, { accessToken: string; refreshToken: string; createdAt: number }>();

// 5분 후 만료
const EXPIRY_MS = 5 * 60 * 1000;

// 만료된 세션 정리
function cleanupExpired() {
  const now = Date.now();
  for (const [key, value] of pendingSessions.entries()) {
    if (now - value.createdAt > EXPIRY_MS) {
      pendingSessions.delete(key);
    }
  }
}

// POST: 토큰 저장
export async function POST(request: NextRequest) {
  try {
    const { sessionId, accessToken, refreshToken } = await request.json();

    if (!sessionId || !accessToken || !refreshToken) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    cleanupExpired();

    pendingSessions.set(sessionId, {
      accessToken,
      refreshToken,
      createdAt: Date.now(),
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

// GET: 토큰 조회 및 삭제
export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("sessionId");

  if (!sessionId) {
    return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
  }

  cleanupExpired();

  const session = pendingSessions.get(sessionId);

  if (!session) {
    return NextResponse.json({ found: false });
  }

  // 조회 후 삭제 (일회용)
  pendingSessions.delete(sessionId);

  return NextResponse.json({
    found: true,
    accessToken: session.accessToken,
    refreshToken: session.refreshToken,
  });
}

import { NextResponse } from "next/server";
import { createRouteSupabaseClient } from "@/lib/serverSupabase";
import { buildToolDefinitions } from "@/lib/realtimeTools";
import { buildSystemPrompt } from "@/lib/realtimePrompts";

export async function POST(request: Request) {
  try {
    // Auth check
    const supabase = await createRouteSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, message: "로그인이 필요합니다." },
        { status: 401 },
      );
    }

    const body = await request.json();
    const postType = body.postType as "junior" | "senior";

    if (postType !== "junior" && postType !== "senior") {
      return NextResponse.json(
        { success: false, message: "postType은 junior 또는 senior여야 합니다." },
        { status: 400 },
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, message: "OpenAI API key가 설정되지 않았습니다." },
        { status: 500 },
      );
    }

    const tools = buildToolDefinitions(postType);
    const instructions = buildSystemPrompt(postType);

    const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-realtime",
        voice: "coral",
        instructions,
        tools,
        turn_detection: { type: "server_vad" },
        input_audio_transcription: { model: "gpt-4o-mini-transcribe", language: "ko" },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenAI session error:", errText);
      return NextResponse.json(
        { success: false, message: "Realtime 세션 생성 실패" },
        { status: 502 },
      );
    }

    const session = await response.json();

    return NextResponse.json({
      success: true,
      data: {
        clientSecret: session.client_secret?.value ?? session.client_secret,
        sessionId: session.id,
      },
    });
  } catch (err) {
    console.error("realtime session error:", err);
    return NextResponse.json(
      {
        success: false,
        message: err instanceof Error ? err.message : "알 수 없는 오류",
      },
      { status: 500 },
    );
  }
}

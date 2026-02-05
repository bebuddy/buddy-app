import { NextRequest, NextResponse } from "next/server";
import { createRouteSupabaseClient } from "@/lib/serverSupabase";

// GET: 댓글 목록 조회
export async function GET(request: NextRequest) {
  try {
    const supabase = await createRouteSupabaseClient();
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get("postId");
    const postType = searchParams.get("postType");

    if (!postId || !postType) {
      return NextResponse.json(
        { success: false, message: "postId와 postType이 필요합니다." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("comments")
      .select(`
        id,
        content,
        created_at,
        user:user_id (
          id,
          nick_name,
          profile_image
        )
      `)
      .eq("post_id", postId)
      .eq("post_type", postType)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("댓글 조회 오류:", error);
      return NextResponse.json(
        { success: false, message: "댓글을 불러올 수 없습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: data ?? [] });
  } catch (error) {
    console.error("댓글 조회 오류:", error);
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// POST: 댓글 작성
export async function POST(request: NextRequest) {
  try {
    const supabase = await createRouteSupabaseClient();

    // 현재 로그인된 유저 확인
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    // users 테이블에서 user_id 조회
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("auth_id", user.id)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { success: false, message: "사용자 정보를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { postId, postType, content } = body;

    if (!postId || !postType || !content?.trim()) {
      return NextResponse.json(
        { success: false, message: "필수 항목이 누락되었습니다." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("comments")
      .insert({
        post_id: postId,
        post_type: postType,
        user_id: userData.id,
        content: content.trim(),
      })
      .select(`
        id,
        content,
        created_at,
        user:user_id (
          id,
          nick_name,
          profile_image
        )
      `)
      .single();

    if (error) {
      console.error("댓글 작성 오류:", error);
      return NextResponse.json(
        { success: false, message: "댓글 작성에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("댓글 작성 오류:", error);
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

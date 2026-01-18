import { NextResponse } from "next/server";
import { createRouteSupabaseClient } from "@/lib/serverSupabase";

function buildFileUrl(key: string) {
  const encoded = key
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  return `/api/files/${encoded}`;
}

export async function POST(request: Request) {
  try {
    const supabase = await createRouteSupabaseClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json().catch(() => ({}))) as {
      defaultCategory?: string;
    };
    const defaultCategory = body?.defaultCategory;

    const { data: me, error: meError } = await supabase
      .from("users")
      .select("id")
      .eq("auth_id", user.id)
      .single();

    if (meError || !me) {
      return NextResponse.json(
        { success: false, message: "사용자 정보를 불러올 수 없습니다." },
        { status: 404 }
      );
    }

    const { data: posts, error: postError } = await supabase
      .from("post_junior")
      .select("id, image_url_m, category")
      .eq("user_id", me.id);

    if (postError) {
      console.error("junior backfill posts error:", postError);
      return NextResponse.json(
        { success: false, message: "게시글 조회 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    const targetPosts = (posts ?? []).filter(
      (p) => !p.image_url_m || (defaultCategory && !p.category)
    );

    if (targetPosts.length === 0) {
      return NextResponse.json({ success: true, updated: 0 });
    }

    const postIds = targetPosts.map((p) => p.id);
    const { data: files, error: fileError } = await supabase
      .from("file")
      .select("post_junior_id, key")
      .in("post_junior_id", postIds);

    if (fileError) {
      console.error("junior backfill files error:", fileError);
      return NextResponse.json(
        { success: false, message: "파일 조회 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    const firstKeyByPost = new Map<string, string>();
    for (const f of files ?? []) {
      if (!f?.post_junior_id || !f?.key) continue;
      if (!firstKeyByPost.has(f.post_junior_id)) {
        firstKeyByPost.set(f.post_junior_id, f.key);
      }
    }

    let updated = 0;
    for (const post of targetPosts) {
      const updateFields: Record<string, unknown> = {};
      if (!post.image_url_m) {
        const key = firstKeyByPost.get(post.id);
        if (key) updateFields.image_url_m = buildFileUrl(key);
      }
      if (defaultCategory && !post.category) {
        updateFields.category = defaultCategory;
      }

      if (Object.keys(updateFields).length === 0) continue;

      const { error: updateError } = await supabase
        .from("post_junior")
        .update(updateFields)
        .eq("id", post.id);

      if (updateError) {
        console.error("junior backfill update error:", updateError);
        continue;
      }
      updated += 1;
    }

    return NextResponse.json({ success: true, updated });
  } catch (error) {
    console.error("junior backfill error:", error);
    return NextResponse.json(
      { success: false, message: "백필 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

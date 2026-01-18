import { NextResponse } from "next/server";
import { createRouteSupabaseClient } from "@/lib/serverSupabase";
import { RegisterJuniorReq } from "@/types/postType";

function buildFileUrl(key?: string | null) {
  if (!key) return null;
  const encoded = key
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  return `/api/files/${encoded}`;
}

function extractPostId(data: unknown): string | null {
  if (!data) return null;
  if (typeof data === "string") return data;
  if (Array.isArray(data)) return extractPostId(data[0]);
  if (typeof data !== "object") return null;
  const record = data as Record<string, unknown>;
  const id = record.id ?? record.post_id ?? record.post_junior_id ?? record.postId;
  return typeof id === "string" ? id : null;
}

export async function GET(request: Request) {
  const supabase = await createRouteSupabaseClient();
  const { searchParams } = new URL(request.url);
  const count = Number(searchParams.get("count") ?? "4");

  const { data, error } = await supabase.rpc("getjuniorpostsbyrandom", { _count: count });
  if (error) {
    console.error("getjuniorpostsbyrandom error:", error);
    return NextResponse.json({ success: false, message: "게시글 조회 오류" }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RegisterJuniorReq & { userId?: string };
    const { userId, ...data } = body;

    if (!userId) {
      return NextResponse.json({ success: false, message: "userId가 필요합니다." }, { status: 400 });
    }

    const supabase = await createRouteSupabaseClient();
    const thumbnailUrl = buildFileUrl(data.fileKeys?.[0]);

    const { data: result, error } = await supabase.rpc("createjuniorpost", {
      _user_id: userId,
      _title: data.title,
      _content: data.content,
      _level: data.level,
      _dates_times: data.datesTimes,
      _senior_type: data.seniorType,
      _class_type: data.classType,
      _budget: data.budget,
      _budget_type: data.budgetType,
      _senior_gender: data.seniorGender,
      _file_keys: data.fileKeys,
    });

    if (error) {
      const isStatusNull =
        error.code === "23502" &&
        (error.message?.includes('column "status"') ||
          error.details?.includes('column "status"') ||
          error.message?.includes("status") ||
          error.details?.includes("status"));

      if (!isStatusNull) {
        console.error("createjuniorpost error:", error);
        return NextResponse.json(
          { success: false, message: error.message ?? "게시글 생성 오류" },
          { status: 500 }
        );
      }

      const { data: inserted, error: insertError } = await supabase
        .from("post_junior")
        .insert({
          user_id: userId,
          title: data.title,
          content: data.content,
          category: data.category,
          level: data.level,
          dates_times: data.datesTimes,
          senior_type: data.seniorType,
          class_type: data.classType,
          budget: data.budget,
          budget_type: data.budgetType,
          senior_gender: data.seniorGender,
          status: "DONE",
          image_url_m: thumbnailUrl,
        })
        .select()
        .single();

      if (insertError || !inserted) {
        console.error("post_junior insert error:", insertError ?? "no data");
        return NextResponse.json(
          { success: false, message: insertError?.message ?? "게시글 생성 오류" },
          { status: 500 }
        );
      }

      if (Array.isArray(data.fileKeys) && data.fileKeys.length > 0) {
        const { error: fileError } = await supabase
          .from("file")
          .update({ post_junior_id: inserted.id })
          .in("key", data.fileKeys);

        if (fileError) {
          console.error("post_junior file update error:", fileError);
          return NextResponse.json(
            { success: false, message: "파일 연결 중 오류가 발생했습니다." },
            { status: 500 }
          );
        }
      }

      return NextResponse.json({ success: true, data: inserted, message: "post_junior 생성 완료" });
    }

    const postId = extractPostId(result);
    if (postId) {
      const updateFields: Record<string, unknown> = {};
      if (thumbnailUrl) updateFields.image_url_m = thumbnailUrl;
      if (data.category) updateFields.category = data.category;
      if (Object.keys(updateFields).length > 0) {
        const { error: updateError } = await supabase
          .from("post_junior")
          .update(updateFields)
          .eq("id", postId);
        if (updateError) {
          console.error("post_junior update error:", updateError);
        }
      }
    }

    return NextResponse.json({ success: true, data: result, message: "post_junior 생성 완료" });
  } catch (err) {
    console.error("createjuniorpost error:", err);
    return NextResponse.json(
      { success: false, message: err instanceof Error ? err.message : "알 수 없는 오류 발생" },
      { status: 500 }
    );
  }
}

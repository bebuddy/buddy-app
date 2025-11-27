import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { RegisterJuniorReq } from "@/types/postType";

export async function GET(request: Request) {
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
      console.error("createjuniorpost error:", error);
      return NextResponse.json(
        { success: false, message: error.message ?? "게시글 생성 오류" },
        { status: 500 }
      );
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

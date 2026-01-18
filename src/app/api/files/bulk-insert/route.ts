import { NextResponse } from "next/server";
import { createRouteSupabaseClient } from "@/lib/serverSupabase";

type UploadedFile = {
  key: string;
  name: string;
  size: number;
  userId?: string;
  postJuniorId?: string;
  postSeniorId?: string;
};

export async function POST(request: Request) {
  try {
    const supabase = await createRouteSupabaseClient();
    const uploadedFiles = (await request.json()) as UploadedFile[];

    if (!Array.isArray(uploadedFiles) || uploadedFiles.length === 0) {
      return NextResponse.json({ success: false, message: "업로드된 파일 정보가 없습니다." }, { status: 400 });
    }

    const formatted = uploadedFiles.map((f) => ({
      key: f.key,
      original_file_name: f.name,
      size: f.size,
      bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME,
      status: "UPLOADED",
      post_junior_id: f.postJuniorId,
      post_senior_id: f.postSeniorId,
    }));

    const { data, error } = await supabase.from("file").insert(formatted).select();

    if (error) {
      console.error("bulk-insert error:", error);
      return NextResponse.json(
        { success: false, message: "파일 DB 저장 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("bulk-insert error:", error);
    return NextResponse.json(
      { success: false, message: "파일 DB 저장 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { generateDownloadUrl } from "@/services/s3";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");

  if (!key) {
    return NextResponse.json({ success: false, message: "파일 key가 필요합니다." }, { status: 400 });
  }

  try {
    const { data: file, error } = await supabase
      .from("file")
      .select("bucket, original_file_name")
      .eq("key", key)
      .single();

    if (error || !file) {
      return NextResponse.json(
        { success: false, message: `파일 정보를 찾을 수 없습니다: ${error?.message ?? ""}` },
        { status: 404 }
      );
    }

    const downloadUrl = await generateDownloadUrl(file.bucket, key);

    return NextResponse.json({
      success: true,
      downloadUrl,
      fileName: file.original_file_name,
    });
  } catch (error) {
    console.error("download-file error:", error);
    return NextResponse.json(
      { success: false, message: "파일 다운로드 URL 생성 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

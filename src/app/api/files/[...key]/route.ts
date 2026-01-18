import { NextResponse } from "next/server";
import { generateDownloadUrl } from "@/services/s3";

export async function GET(
  _request: Request,
  context: { params: Promise<{ key: string[] }> }
) {
  const { key } = await context.params;
  const keyPath = Array.isArray(key) ? key.join("/") : key;

  if (!keyPath) {
    return NextResponse.json({ success: false, message: "파일 key가 필요합니다." }, { status: 400 });
  }

  const bucket = process.env.NEXT_PUBLIC_S3_BUCKET_NAME;
  if (!bucket) {
    return NextResponse.json(
      { success: false, message: "S3 bucket 설정이 필요합니다." },
      { status: 500 }
    );
  }

  try {
    const downloadUrl = await generateDownloadUrl(bucket, keyPath);
    return NextResponse.redirect(downloadUrl);
  } catch (error) {
    console.error("file redirect error:", error);
    return NextResponse.json(
      { success: false, message: "파일 다운로드 URL 생성 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { generateUploadUrl } from "@/services/s3";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: Request) {
  try {
    const { bucket, fileName } = (await request.json()) as {
      bucket?: string;
      fileName?: string;
    };

    if (!bucket || !fileName) {
      return NextResponse.json(
        { success: false, message: "bucket과 fileName이 필요합니다." },
        { status: 400 }
      );
    }

    const key = `uploads/${uuidv4()}-${fileName}`;
    const uploadUrl = await generateUploadUrl(bucket, key);

    return NextResponse.json({ success: true, uploadUrl, key });
  } catch (error) {
    console.error("upload-url error:", error);
    return NextResponse.json(
        { success: false, message: "업로드 URL 생성 중 오류가 발생했습니다." },
        { status: 500 }
    );
  }
}

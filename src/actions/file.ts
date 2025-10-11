"use server";

import { supabase } from "@/lib/supabase";
import { generateDownloadUrl, generateUploadUrl } from "@/services/s3";
import { v4 as uuidv4 } from "uuid";

//Todo: 추후 스케줄러로 일정 시간 지난 file_status pending인 row들 삭제하기
export async function getUploadUrlAction(bucket: string, fileName: string) {
    const key = `uploads/${uuidv4()}-${fileName}`;
    const uploadUrl = await generateUploadUrl(bucket, key);

    return { uploadUrl, key };
}

/** 파일 여러 개를 DB에 insert하는 Supabase용 Action */
export async function insertFilesAction(
    uploadedFiles: {
        key: string;
        name: string;
        size: number;
        userId?: string;
        postJuniorId?: string;
        postSeniorId?: string;
    }[]
) {
    if (!uploadedFiles || uploadedFiles.length === 0)
        throw new Error("No uploaded files provided.");

    // DB 컬럼명에 맞게 매핑
    const formatted = uploadedFiles.map((f) => ({
        key: f.key,
        original_file_name: f.name,
        size: f.size,
        status: "UPLOADED",
        user_id: f.userId,
        post_junior_id: f.postJuniorId,
        post_senior_id: f.postSeniorId,
    }));

    // Supabase Insert (여러 Row 한 번에)
    const { data, error } = await supabase
        .from("file")
        .insert(formatted)
        .select();

    if (error) {
        console.error("insertFilesAction error:", error);
        throw new Error("파일 DB 저장 중 오류가 발생했습니다.");
    }
    return {
        success: true,
        data: data
    }
}

export async function downloadFileAction(key: string) {
    if (!key) throw new Error("파일 key가 필요합니다.");

    // Supabase에서 bucket 조회 (bucket 정보를 저장해두었다고 가정)
    const { data: file, error } = await supabase
        .from("file")
        .select("bucket, original_file_name")
        .eq("key", key)
        .single();

    if (error || !file) {
        throw new Error(`파일 정보를 찾을 수 없습니다: ${error?.message ?? ""}`);
    }

    // S3 presigned download URL 생성
    const downloadUrl = await generateDownloadUrl(file.bucket, key);

    // 결과 반환
    return {
        success: true,
        downloadUrl,
        fileName: file.original_file_name,
    };
}

export async function deleteFileAction() {
    //일단 구현하지 말고 놔둬!!
}
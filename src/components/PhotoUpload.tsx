"use client";
import { getUploadUrlAction, insertFilesAction } from "@/actions/file";
import { useRef, useState } from "react";

export default function PhotoUpload({ brand = "#33AF83" }: { brand?: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false)

  function openPicker() {
    inputRef.current?.click();
  }
  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;
    setFiles((prev) => [...prev || [], ...Array.from(e.target.files || [])]);
    await handleUpload();
  }
  
  async function handleUpload() {
    const bucket = process.env.NEXT_PUBLIC_S3_BUCKET_NAME!;
    const uploadedFiles: { key: string; name: string; size: number }[] = [];

    if (!files.length) return;

    // 여러 파일을 동시에 업로드
    try {
      setIsUploading(true)
      await Promise.all(
        files.map(async (file) => {
          // presigned URL 생성
          const { uploadUrl, key } = await getUploadUrlAction(bucket, file.name);

          // 실제 업로드 (S3로 PUT 요청)
          const res = await fetch(uploadUrl, {
            method: "PUT",
            headers: { "Content-Type": file.type },
            body: file,
          });
          if (!res.ok) throw new Error(`${file.name} 업로드 실패`);

          uploadedFiles.push({
            key,
            name: file.name,
            size: file.size,
          });
        })
      );

      // (3) 업로드 완료 → DB 상태 갱신
      const dbRes = await insertFilesAction(uploadedFiles);
      if (!dbRes.success) throw new Error(`file 업로드 실패`)
    } catch (error) {
      alert(error)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {/* 텍스트 전체가 가운데 정렬 */}
      <button
        onClick={openPicker}
        disabled={isUploading}
        className="w-full h-[56px] flex items-center justify-center gap-2 
                   rounded-lg border border-neutral-300 
                   text-[18px] font-semibold bg-white"
      >
        <span className="text-neutral-900">
          {isUploading ? "업로드 중..." : "사진 등록"}
        </span>
        {!isUploading && (
          <span style={{ color: brand }} className="text-[22px] font-bold leading-none">
            ＋
          </span>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={onPick}
      />

      {files.length > 0 && (
        <div className="text-[15px] text-neutral-600 text-center">
          {files.length}장 선택됨
        </div>
      )}
    </div>
  );
}

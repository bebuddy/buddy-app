"use client";
import { getUploadUrlAction, insertFilesAction } from "@/actions/file";
import { useRef, useState } from "react";

interface PhotoUploadProps {
  brand?: string;
  onChange?: (fileKeys: string[]) => void;
}

export default function PhotoUpload({ brand = "#33AF83", onChange }: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadedKeys, setUploadedKeys] = useState<string[]>([]); // ✅ 현재까지 업로드된 전체 key 관리

  function openPicker() {
    inputRef.current?.click();
  }

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setSelectedFiles((prev) => [...prev || [], ...files]);
    await handleUpload(files); // ✅ 선택 즉시 업로드
  }

  async function handleUpload(files: File[]) {
    const bucket = process.env.NEXT_PUBLIC_S3_BUCKET_NAME!;
    const uploadedFiles: { key: string; name: string; size: number }[] = [];

    if (!files.length) return;

    try {
      setIsUploading(true);

      await Promise.all(
        files.map(async (file) => {
          // ✅ presigned URL 발급
          const { uploadUrl, key } = await getUploadUrlAction(bucket, file.name);

          // ✅ S3로 업로드
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

      // ✅ DB에 업로드 정보 저장
      const dbRes = await insertFilesAction(uploadedFiles);
      if (!dbRes.success) throw new Error(`file 업로드 실패`);

      //누적 key반영
      const newKeys = uploadedFiles.map((f) => f.key);
      setUploadedKeys((prev) => {
        const updated = [...prev, ...newKeys];
        onChange?.(updated); // ✅ 부모에게 누적된 key 전달
        return updated;
      });
    } catch (error) {
      alert(error instanceof Error ? error.message : String(error));
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
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

      {selectedFiles.length > 0 && (
        <div className="text-[15px] text-neutral-600 text-center">
          {selectedFiles.length}장 선택됨
        </div>
      )}
    </div>
  );
}

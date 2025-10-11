"use client";
import { getUploadUrlAction, insertFilesAction /*, deleteFilesAction */ } from "@/actions/file";
import { useEffect, useRef, useState } from "react";

interface PhotoUploadProps {
  brand?: string;
  onChange?: (fileKeys: string[]) => void;   // 업로드된 key 배열 전달
}

type PreviewItem = {
  id: string;         // 로컬 식별자
  file: File;
  url: string;        // object URL (썸네일)
  key?: string;       // 업로드 완료 시 S3 key
  uploaded: boolean;  // 업로드 여부
};

export default function PhotoUpload({ brand = "#33AF83", onChange }: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<PreviewItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  function openPicker() {
    inputRef.current?.click();
  }

  // 파일 선택
  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    // 프리뷰 반영
    const newItems: PreviewItem[] = files.map((f) => ({
      id: crypto.randomUUID(),
      file: f,
      url: URL.createObjectURL(f),
      uploaded: false,
    }));

    setItems((prev) => [...prev, ...newItems]);

    // 선택 즉시 업로드
    await handleUpload(newItems);
    // input 값 초기화(같은 파일 다시 선택 가능)
    e.target.value = "";
  }

  // 업로드 처리
  async function handleUpload(targets: PreviewItem[]) {
    if (!targets.length) return;

    const bucket = process.env.NEXT_PUBLIC_S3_BUCKET_NAME!;
    setIsUploading(true);

    try {
      // S3 업로드
      const uploadedFiles: { key: string; name: string; size: number; _id: string }[] = [];

      await Promise.all(
        targets.map(async (item) => {
          const file = item.file;

          // presigned URL 발급
          const { uploadUrl, key } = await getUploadUrlAction(bucket, file.name);

          // 실제 업로드
          const res = await fetch(uploadUrl, {
            method: "PUT",
            headers: { "Content-Type": file.type },
            body: file,
          });
          if (!res.ok) throw new Error(`${file.name} 업로드 실패`);

          uploadedFiles.push({ key, name: file.name, size: file.size, _id: item.id });

          // UI 상태 업데이트(개별 항목 업로드 완료 표기)
          setItems((prev) =>
            prev.map((it) => (it.id === item.id ? { ...it, uploaded: true, key } : it))
          );
        })
      );

      // DB 기록
      const dbRes = await insertFilesAction(
        uploadedFiles.map(({ key, name, size }) => ({ key, name, size }))
      );
      if (!dbRes.success) throw new Error("file 메타데이터 저장 실패");

      // 상위에 누적 key 전달
      const keys = (prevKeys: string[]) =>
        [
          ...prevKeys,
          ...uploadedFiles.map((f) => f.key),
        ];
      const allKeys = [
        ...items.map((i) => i.key).filter(Boolean) as string[],
        ...uploadedFiles.map((f) => f.key),
      ];
      onChange?.(Array.from(new Set(allKeys)));
    } catch (err) {
      alert(err instanceof Error ? err.message : String(err));
    } finally {
      setIsUploading(false);
    }
  }

  // 썸네일 X로 삭제
  async function removeItem(id: string) {
    setItems((prev) => {
      const target = prev.find((i) => i.id === id);
      if (!target) return prev;

      // 프리뷰 URL 해제
      if (target.url) URL.revokeObjectURL(target.url);

      const next = prev.filter((i) => i.id !== id);

      // 업로드된 항목이면 onChange로 key 제거
      if (target.uploaded && target.key) {
        const remainingKeys = next
          .map((i) => i.key)
          .filter(Boolean) as string[];
        onChange?.(Array.from(new Set(remainingKeys)));

        // 서버/스토리지에서 실제 삭제까지 필요하면 여기서 실행
        // void deleteFilesAction([target.key]); // 존재한다면 사용
      }

      return next;
    });
  }

  // 컴포넌트 unmount 시 메모리 정리
  useEffect(() => {
    return () => {
      items.forEach((i) => i.url && URL.revokeObjectURL(i.url));
    };
  }, [items]);

  return (
    <div className="flex flex-col gap-3">
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

      {/* 썸네일 그리드 */}
      {items.length > 0 && (
        <div className="grid grid-cols-3 gap-6">
          {items.map((item) => (
            <div key={item.id} className="relative group">
              {/* 썸네일: 원본 비율로 미리보기 (상세는 3:2로 보여줄 예정) */}
              <img
                src={item.url}
                alt={item.file.name}
                className="w-full h-[100px] object-cover rounded-md border border-neutral-200"
              />

              {/* 삭제 버튼 */}
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="absolute -top-2 -right-2 hidden group-hover:block
                           w-7 h-7 rounded-full bg-black/70 text-white text-sm
                           flex items-center justify-center"
                aria-label="remove photo"
                title="삭제"
              >
                ×
              </button>

              {/* 업로드 상태 배지(선택) */}
              {!item.uploaded && (
                <span className="absolute bottom-1 left-1 px-2 py-[2px] text-xs rounded bg-white/90 border">
                  업로드중…
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- (선택) 3:2 크롭 유틸 ---------- */
/** 저장 전에 실제 이미지를 3:2로 크롭해서 업로드하려면 handleUpload에서 이 함수를 호출해 File을 교체 */
async function cropToThreeTwo(file: File): Promise<File> {
  const img = await loadImage(file);
  const sw = img.width, sh = img.height;
  const target = 3 / 2;
  const aspect = sw / sh;

  let sx = 0, sy = 0, cw = sw, ch = sh;
  if (aspect > target) {        // 가로가 더 김 → 좌우 자르기
    cw = Math.round(sh * target);
    sx = Math.round((sw - cw) / 2);
  } else if (aspect < target) { // 세로가 더 김 → 상하 자르기
    ch = Math.round(sw / target);
    sy = Math.round((sh - ch) / 2);
  }

  const canvas = document.createElement("canvas");
  canvas.width = cw;
  canvas.height = ch;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, sx, sy, cw, ch, 0, 0, cw, ch);

  const blob: Blob = await new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b as Blob), "image/jpeg", 0.92)
  );

  const base = (file.name || "image").replace(/\.[^.]+$/, "");
  const croppedName = `${base}-cropped.jpg`;
  return new File([blob], croppedName, { type: "image/jpeg" });
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = reject;
    img.src = url;
  });
}

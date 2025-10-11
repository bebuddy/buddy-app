// src/components/PhotoUpload.tsx
"use client";
import { useEffect, useRef, useState } from "react";

type Props = {
  brand?: string;
  /** 크롭(3:2)된 파일 목록을 부모에 전달 */
  onFilesChange?: (files: File[]) => void;
};

type Thumb = {
  id: string;
  url: string;   // 미리보기용 ObjectURL
  file: File;    // 3:2로 크롭된 파일
};

export default function PhotoUpload({ brand = "#33AF83", onFilesChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<Thumb[]>([]);

  function openPicker() {
    inputRef.current?.click();
  }

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files || []);
    if (picked.length === 0) return;

    // 최대 10장 제한
    const remain = Math.max(0, 10 - items.length);
    const useFiles = picked.slice(0, remain);

    const processed = await Promise.all(
      useFiles.map(async (f) => {
        const cropped = await cropToThreeTwo(f);
        const url = URL.createObjectURL(cropped);
        return { id: crypto.randomUUID(), url, file: cropped } as Thumb;
      })
    );

    const next = [...items, ...processed];
    setItems(next);
    onFilesChange?.(next.map((t) => t.file));

    // 같은 파일 재선택 가능하게 초기화
    e.target.value = "";
  }

  function removeOne(id: string) {
    setItems((prev) => {
      const target = prev.find((x) => x.id === id);
      if (target) URL.revokeObjectURL(target.url);
      const next = prev.filter((x) => x.id !== id);
      onFilesChange?.(next.map((t) => t.file));
      return next;
    });
  }

  useEffect(() => {
    return () => {
      // 언마운트 시 URL 정리
      items.forEach((t) => URL.revokeObjectURL(t.url));
    };
  }, [items]);

  return (
    <div className="flex flex-col gap-3">
      {/* 업로드 버튼 */}
      <button
        onClick={openPicker}
        className="w-full h-[56px] flex items-center justify-center gap-2 
                   rounded-lg border border-neutral-300 
                   text-[18px] font-semibold bg-white"
      >
        <span className="text-neutral-900">사진 등록</span>
        <span style={{ color: brand }} className="text-[22px] font-bold leading-none">
          ＋
        </span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={onPick}
      />

      {/* 썸네일 그리드 (1:1) */}
      {items.length > 0 && (
        <div className="grid grid-cols-3 gap-6">
          {items.map((t) => (
            <div key={t.id} className="relative aspect-square rounded-xl overflow-hidden bg-neutral-100">
              <img src={t.url} alt="preview" className="w-full h-full object-cover" draggable={false} />
              <button
                type="button"
                onClick={() => removeOne(t.id)}
                aria-label="삭제"
                className="absolute top-1.5 right-1.5 h-7 w-7 rounded-full 
                           bg-black/60 text-white text-sm leading-7 text-center"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="text-[13px] text-neutral-500 text-center">
        {items.length}/10 장 등록됨
      </div>
    </div>
  );
}

/* ---------- 유틸: 파일을 가운데 기준 3:2로 크롭 ---------- */
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

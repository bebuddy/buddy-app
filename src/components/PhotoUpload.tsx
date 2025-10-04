"use client";
import { useRef, useState } from "react";

export default function PhotoUpload({ brand = "#33AF83" }: { brand?: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);

  function openPicker() {
    inputRef.current?.click();
  }
  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    setFiles(Array.from(e.target.files || []));
  }

  return (
    <div className="flex flex-col gap-2">
      {/* ✅ 텍스트 전체가 가운데 정렬 */}
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

      {files.length > 0 && (
        <div className="text-[15px] text-neutral-600 text-center">
          {files.length}장 선택됨
        </div>
      )}
    </div>
  );
}

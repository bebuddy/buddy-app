// src/components/TopBar.tsx
"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function TopBar() {
  const router = useRouter();
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // 유저 프로필 이미지 가져오기
  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("users")
        .select("profile_image")
        .eq("auth_id", user.id)
        .single();

      if (data?.profile_image) {
        setProfileImage(data.profile_image);
      }
    };

    fetchUserProfile();
  }, []);

  return (
    <>
      {/* 고정 헤더 높이만큼 레이아웃 스페이서 */}
      <div
        aria-hidden
        className="w-full"
        style={{ height: "calc(57px + env(safe-area-inset-top))" }}
      />

      {/* 상단 고정 헤더 (경계선 없음) */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[768px] z-[100] bg-white"
        style={{
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.06)",
        }}
      >
        <div className="px-6 pt-[calc(env(safe-area-inset-top)+8px)] pb-[14px] flex items-center justify-between">
          <Image
            src="/logo.svg"
            alt="벗 로고"
            width={40}
            height={40}
            priority
          />

          {/* 오른쪽: 프로필 */}
          <button
            aria-label="내 정보"
            className="w-8 h-8 rounded-full overflow-hidden bg-neutral-200"
            onClick={() => router.push("/myPage")}
          >
            {profileImage ? (
              <img
                src={profileImage}
                alt="프로필"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-neutral-400"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
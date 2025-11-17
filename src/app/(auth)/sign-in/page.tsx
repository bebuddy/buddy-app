"use client";

import React from "react";
import Image from "next/image"
import FillButton from "@/components/common/FillButton";
import { useRouter } from "next/navigation";

export default function SigninPage() {
    const router = useRouter();

    return (
        <>
            <div className="flex flex-col w-full items-center min-h-dvh justify-center">
                <div className="relative w-[168px] h-[168px] mb-[44px]">
                    <Image
                        src='/graphicLogo.png'
                        fill
                        alt="graphicLogo" />
                </div>
                <span className="flex font-bold-22 mb-4">당신의 Companion, 벗</span>
                <div className="flex flex-col text-regular-20 text-[#333333] text-center">
                    <span>당신의 일자리 찾기, 벗이 도와드릴게요.</span>
                    <span>재밌게 행복하게 시작해보세요!</span>
                </div>
            </div>
            <div
                // 1. OnboardingNav의 <nav> 스타일: 위치 고정 및 중앙 정렬
                className="fixed bottom-0 z-50 left-1/2 -translate-x-1/2 w-full max-w-[768px]"
            >
                {/* 2. OnboardingNav의 내부 <div> 스타일: 패딩 및 safe-area 적용 */}
                <div
                    className="p-4" // 좌우 여백 (16px)
                    style={{ paddingBottom: "calc(25px + env(safe-area-inset-bottom))" }} // OnboardingNav와 동일한 하단 패딩
                >
                    <FillButton name="시작하기" onClick={()=> router.push('/verify')}/>
                </div>
            </div>
        </>
    );
}
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
                style={{ bottom: 'calc(env(safe-area-inset-bottom) + 32px)' }}
                className="fixed left-7 right-7">
                <FillButton name="시작하기" onClick={()=> router.push('/verify')}/>
            </div>
        </>
    );
}
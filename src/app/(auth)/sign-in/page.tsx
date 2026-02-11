"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { track } from "@/lib/mixpanel";
import { isNativeIOS, signInWithOAuthNative, OAuthProvider } from "@/lib/nativeAuth";

export default function SigninPage() {
    const hasTracked = useRef(false);
    const [isLoading, setIsLoading] = useState<OAuthProvider | null>(null);

    useEffect(() => {
        if (hasTracked.current) return;
        hasTracked.current = true;
        track("sign_in_viewed");
    }, []);

    const handleSignin = async (provider: OAuthProvider) => {
        setIsLoading(provider);
        try {
            track("sign_in_clicked", { provider });

            if (isNativeIOS()) {
                const result = await signInWithOAuthNative(provider);
                if (result.success) {
                    window.location.href = '/verify';
                } else {
                    console.error(`Native ${provider} Sign-In failed:`, result.error);
                    alert("로그인 중 문제가 발생했습니다. 다시 시도해주세요.");
                }
            } else {
                window.location.href = `/api/auth/login?provider=${provider}`;
            }
        } catch (error) {
            console.error(`${provider} login error:`, error);
            alert("로그인 중 문제가 발생했습니다. 다시 시도해주세요.");
        } finally {
            setIsLoading(null);
        }
    };

    return (
        <>
            <div className="flex flex-col w-full items-center min-h-dvh justify-center">
                {/* 로고 */}
                <div className="relative w-[224px] h-[224px] mb-[44px]">
                    <Image src="/graphicLogo.png" fill alt="graphicLogo" />
                </div>

                {/* 타이틀 */}
                <span className="flex font-bold-22 mb-4">당신의 Companion, 벗</span>

                {/* 설명 문구 */}
                <div className="flex flex-col font-medium-18 text-[#333333] text-center mb-8">
                    <span>당신의 일자리 찾기, 벗이 도와드릴게요.</span>
                    <span>재밌게 행복하게 시작해보세요!</span>
                </div>

                {/* 로그인 버튼들 */}
                <div className="flex flex-col gap-3 w-full max-w-[320px]">
                    {/* Apple 로그인 버튼 */}
                    <button
                        onClick={() => handleSignin('apple')}
                        disabled={isLoading !== null}
                        className="flex items-center justify-center gap-2 bg-black px-8 py-4 rounded-xl hover:bg-gray-900 active:bg-gray-900 disabled:opacity-50"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                            <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                        </svg>
                        <span className="font-bold-18 text-white font-medium">
                            {isLoading === 'apple' ? "로그인 중..." : "Apple로 시작하기"}
                        </span>
                    </button>

                    {/* Google 로그인 버튼 */}
                    <button
                        onClick={() => handleSignin('google')}
                        disabled={isLoading !== null}
                        className="flex items-center justify-center gap-2 border border-gray-300 px-8 py-4 rounded-xl hover:bg-gray-100 active:bg-gray-100 disabled:opacity-50"
                    >
                        <Image
                            src="/google-icon.png"
                            width={24}
                            height={24}
                            alt="Google"
                            className="object-contain"
                        />
                        <span className="font-bold-18 text-[#333] font-medium">
                            {isLoading === 'google' ? "로그인 중..." : "Google로 시작하기"}
                        </span>
                    </button>
                </div>
            </div>
        </>
    );
}

"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { track } from "@/lib/mixpanel";
import { Capacitor } from "@capacitor/core";
import { isNativeIOS, signInWithGoogleNative } from "@/lib/googleAuth";

export default function SigninPage() {
    const hasTracked = useRef(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (hasTracked.current) return;
        hasTracked.current = true;
        track("sign_in_viewed");
    }, []);

    // 앱 환경 감지
    const isNativeApp = () => {
        try {
            return Capacitor.isNativePlatform();
        } catch {
            return false;
        }
    };

    // 고유 세션 ID 생성
    const generateSessionId = () => {
        return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    };

    // iOS 네이티브 Google 로그인
    const handleNativeGoogleSignIn = async () => {
        setIsLoading(true);
        try {
            track("sign_in_clicked", { provider: "google", method: "native_ios" });

            const result = await signInWithGoogleNative();

            if (result.success) {
                window.location.href = '/verify';
            } else {
                console.error("Native Google Sign-In failed:", result.error);
                alert("로그인 중 문제가 발생했습니다. 다시 시도해주세요.");
            }
        } catch (error) {
            console.error("Native Google Sign-In error:", error);
            alert("로그인 중 문제가 발생했습니다. 다시 시도해주세요.");
        } finally {
            setIsLoading(false);
        }
    };

    // Google 로그인 함수 (웹 및 Android용)
    const handleWebGoogleSignin = async () => {
        try {
            track("sign_in_clicked", { provider: "google", method: "web" });

            const isApp = isNativeApp();
            const baseUrl = window.location.origin;
            let loginUrl = `${baseUrl}/api/auth/login?provider=google`;

            if (isApp) {
                const sessionId = generateSessionId();
                localStorage.setItem("pending_auth_session_id", sessionId);
                loginUrl += `&app=true&session_id=${sessionId}`;

                // 앱에서는 인앱 브라우저 사용
                const { Browser } = await import("@capacitor/browser");
                await Browser.open({ url: loginUrl });
            } else {
                // 웹에서는 일반 리다이렉트
                window.location.href = loginUrl;
            }
        } catch (error) {
            console.error("Google login error:", error);
            alert("로그인 중 문제가 발생했습니다. 다시 시도해주세요.");
        }
    };

    // Google 로그인 함수 - 플랫폼에 따라 분기
    const handleGoogleSignin = async () => {
        if (isNativeIOS()) {
            await handleNativeGoogleSignIn();
        } else {
            await handleWebGoogleSignin();
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

                {/* ✅ Google 로그인 버튼 */}
                <button
                    onClick={handleGoogleSignin}
                    disabled={isLoading}
                    className="flex items-center justify-center gap-2 border border-gray-300 px-8 py-4 rounded-xl hover:bg-gray-100 active:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Image
                        src="/google-icon.png"
                        width={24}
                        height={24}
                        alt="Google"
                        className="object-contain"
                    />
                    <span className="font-bold-18 text-[#333] font-medium">
                        {isLoading ? '로그인 중...' : 'Google로 시작하기'}
                    </span>
                </button>
            </div>
        </>
    );
}

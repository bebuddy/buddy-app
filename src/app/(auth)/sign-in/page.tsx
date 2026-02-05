"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { track } from "@/lib/mixpanel";
import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function SigninPage() {
    const hasTracked = useRef(false);
    const router = useRouter();

    // 딥링크 URL에서 토큰 처리
    const handleDeepLink = async (url: string) => {
        if (!url.startsWith("buddyapp://auth")) return;

        const params = new URL(url).searchParams;
        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");
        const error = params.get("error");

        if (error) {
            alert("로그인 중 문제가 발생했습니다. 다시 시도해주세요.");
            return;
        }

        if (accessToken && refreshToken) {
            const { error: sessionError } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
            });

            if (sessionError) {
                alert("세션 설정 중 오류가 발생했습니다.");
                return;
            }

            router.push("/verify");
        }
    };

    useEffect(() => {
        if (hasTracked.current) return;
        hasTracked.current = true;
        track("sign_in_viewed");

        // Capacitor 앱에서 딥링크 처리
        if (Capacitor.isNativePlatform()) {
            // 앱이 딥링크로 시작된 경우 확인
            App.getLaunchUrl().then((result) => {
                if (result?.url) {
                    handleDeepLink(result.url);
                }
            });

            // 앱 실행 중 딥링크 수신 처리
            App.addListener("appUrlOpen", ({ url }) => {
                handleDeepLink(url);
            });
        }

        return () => {
            if (Capacitor.isNativePlatform()) {
                App.removeAllListeners();
            }
        };
    }, [router]);

    // 앱 환경 감지 (Capacitor 또는 User-Agent 기반)
    const isNativeApp = () => {
        // Capacitor 브릿지 확인
        if (typeof window !== "undefined" && (window as unknown as { Capacitor?: unknown }).Capacitor) {
            return true;
        }
        // Capacitor.isNativePlatform() 확인
        try {
            if (Capacitor.isNativePlatform()) {
                return true;
            }
        } catch {
            // Capacitor가 로드되지 않은 경우
        }
        // User-Agent로 iOS 앱 WebView 감지
        if (typeof navigator !== "undefined") {
            const ua = navigator.userAgent;
            // Capacitor iOS WebView 감지
            if (ua.includes("Capacitor") || (ua.includes("iPhone") && !ua.includes("Safari"))) {
                return true;
            }
        }
        return false;
    };

    // Google 로그인 함수
    const handleGoogleSignin = async () => {
        try {
            track("sign_in_clicked", { provider: "google" });

            // 앱인 경우 app=true 파라미터 추가
            const isApp = isNativeApp();
            const loginUrl = isApp
                ? "/api/auth/login?provider=google&app=true"
                : "/api/auth/login?provider=google";

            window.location.href = loginUrl;
        } catch (error) {
            console.error("Google login error:", error);
            alert("로그인 중 문제가 발생했습니다. 다시 시도해주세요.");
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
                    className="flex items-center justify-center gap-2 border border-gray-300 px-8 py-4 rounded-xl hover:bg-gray-100 active:bg-gray-100"
                >
                    <Image
                        src="/google-icon.png"
                        width={24}
                        height={24}
                        alt="Google"
                        className="object-contain"
                    />
                    <span className="font-bold-18 text-[#333] font-medium">
                        Google로 시작하기
                    </span>
                </button>
            </div>
        </>
    );
}

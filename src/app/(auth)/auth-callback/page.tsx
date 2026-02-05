"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

function AuthHandler() {
    const searchParams = useSearchParams();

    useEffect(() => {
        const handleAuth = async () => {
            const accessToken = searchParams.get("access_token");
            const refreshToken = searchParams.get("refresh_token");
            const error = searchParams.get("error");

            if (error) {
                alert("로그인 중 문제가 발생했습니다. 다시 시도해주세요.");
                window.location.href = "/sign-in";
                return;
            }

            if (accessToken && refreshToken) {
                const { error: sessionError } = await supabase.auth.setSession({
                    access_token: accessToken,
                    refresh_token: refreshToken,
                });

                if (sessionError) {
                    alert("세션 설정 중 오류가 발생했습니다.");
                    window.location.href = "/sign-in";
                    return;
                }

                // 페이지 새로고침으로 세션 확실히 반영
                window.location.href = "/verify";
            } else {
                window.location.href = "/sign-in";
            }
        };

        handleAuth();
    }, [searchParams]);

    return (
        <div className="flex items-center justify-center min-h-dvh">
            <p className="text-lg">로그인 처리 중...</p>
        </div>
    );
}

export default function AuthCallbackPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-dvh"><p>로딩 중...</p></div>}>
            <AuthHandler />
        </Suspense>
    );
}

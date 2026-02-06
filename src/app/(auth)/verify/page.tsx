"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function VerifyPage() {
  const router = useRouter();
  const hasAlertedRef = useRef(false);

  const alertOnce = (message: string) => {
    if (hasAlertedRef.current) return;
    hasAlertedRef.current = true;
    alert(message);
  };

  useEffect(() => {
    // onAuthStateChange의 INITIAL_SESSION 이벤트를 사용하면
    // 내부 초기화(토큰 교환 등)가 완료된 뒤에 안전하게 세션을 받을 수 있음
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // INITIAL_SESSION: 초기화 완료 시점, SIGNED_IN: OAuth 콜백으로 새 세션
        if (event !== "INITIAL_SESSION" && event !== "SIGNED_IN") return;

        const user = session?.user;

        if (!user) {
          console.error("[verify] No user in session");
          alertOnce("세션이 없습니다. 다시 로그인해주세요.");
          return router.push("/sign-in");
        }

        const authId = user.id;

        const { data: existing, error: selectErr } = await supabase
          .from("users")
          .select("id, status")
          .eq("auth_id", authId)
          .single();

        if (selectErr && selectErr.code !== "PGRST116") {
          console.error("[verify] users select error:", selectErr);
          alertOnce(`사용자 조회 실패: ${selectErr.message || selectErr.code || "unknown"}`);
          return;
        }

        if (!existing) {
          const { error: insertErr } = await supabase
            .from("users")
            .insert({
              auth_id: authId,
              provider: "GOOGLE",
              status: "PENDING",
            });
          if (insertErr) {
            console.error("[verify] users insert error:", insertErr);
            alertOnce(`사용자 생성 실패: ${insertErr.message || insertErr.code || "unknown"}`);
            return;
          }
          router.push(`/sign-up?auth_id=${authId}`);
        } else if (existing.status === "PENDING") {
          router.push(`/sign-up?auth_id=${authId}`);
        } else {
          router.push("/junior");
        }
      },
    );

    return () => subscription.unsubscribe();
  }, [router]);

  return (
    <div className="flex justify-center items-center min-h-screen text-gray-600">
      로그인 확인 중입니다...
    </div>
  );
}

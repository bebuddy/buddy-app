"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function VerifyPage() {
  const router = useRouter();
  const handlingRef = useRef(false);

  useEffect(() => {
    const verifyUser = async (authId: string) => {
      const { data: existing, error: selectErr } = await supabase
        .from("users")
        .select("id, status")
        .eq("auth_id", authId)
        .single();

      if (selectErr && selectErr.code !== "PGRST116") {
        console.error("[verify] users select error:", selectErr);
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
          return;
        }
        router.push(`/sign-up?auth_id=${authId}`);
      } else if (existing.status === "PENDING") {
        router.push(`/sign-up?auth_id=${authId}`);
      } else {
        router.push("/junior");
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event !== "INITIAL_SESSION" && event !== "SIGNED_IN") return;
        if (handlingRef.current) return;
        handlingRef.current = true;

        const user = session?.user;
        if (!user) {
          router.push("/sign-in");
          return;
        }

        // setTimeout으로 _initialize() 체인을 끊어야 deadlock 방지
        // onAuthStateChange 콜백은 _initialize() 내부에서 await되므로
        // 여기서 supabase DB 쿼리를 하면 initializePromise 대기 → deadlock
        setTimeout(() => verifyUser(user.id), 0);
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

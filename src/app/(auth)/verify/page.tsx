"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function VerifyPage() {
  const router = useRouter();

  useEffect(() => {
    const verify = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) return router.push("/sign-in");

      const authId = user.id;

      const { data: existing, error: selectErr } = await supabase
        .from("users")
        .select("id, status")
        .eq("auth_id", authId)
        .single();

      if (selectErr && selectErr.code !== "PGRST116") {
        alert("서버 오류가 발생했습니다.");
        return;
      }

      console.log(existing)
      if (!existing) {
        // 신규 유저 insert
        const { error: insertErr } = await supabase
          .from("users")
          .insert({
            auth_id: authId,
            provider: "GOOGLE",
            status: "PENDING",
          });
        if (insertErr) {
          console.error(insertErr);
          alert("회원 생성 중 오류가 발생했습니다.");
          return;
        }
        router.push(`/sign-up?auth_id=${authId}`);
      } else if (existing.status === "PENDING") {
        router.push(`/sign-up?auth_id=${authId}`);
      } else {
        router.push("/junior");
      }
    };

    verify();
  }, [router]);

  return (
    <div className="flex justify-center items-center min-h-screen text-gray-600">
      로그인 확인 중입니다...
    </div>
  );
}

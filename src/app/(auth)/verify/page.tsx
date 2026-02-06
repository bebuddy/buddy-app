"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function VerifyPage() {
  const router = useRouter();

  useEffect(() => {
    const verify = async () => {
      alert("[DEBUG 1] verify 시작");

      const { data: { user }, error } = await supabase.auth.getUser();
      alert(`[DEBUG 2] getUser 결과 - user: ${user?.id ?? "null"}, error: ${error?.message ?? "none"}`);

      if (error || !user) {
        alert("[DEBUG 2-1] 유저 없음 → /sign-in 이동");
        return router.push("/sign-in");
      }

      const authId = user.id;

      const { data: existing, error: selectErr } = await supabase
        .from("users")
        .select("id, status")
        .eq("auth_id", authId)
        .single();

      alert(`[DEBUG 3] users 조회 - existing: ${JSON.stringify(existing)}, error: ${selectErr?.code ?? "none"} ${selectErr?.message ?? ""}`);

      if (selectErr && selectErr.code !== "PGRST116") {
        alert(`[DEBUG 3-1] DB 오류: ${selectErr.message}`);
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
          alert(`[DEBUG 4] insert 오류: ${insertErr.message}`);
          return;
        }
        alert("[DEBUG 5] 신규유저 → /sign-up 이동");
        router.push(`/sign-up?auth_id=${authId}`);
      } else if (existing.status === "PENDING") {
        alert("[DEBUG 6] PENDING → /sign-up 이동");
        router.push(`/sign-up?auth_id=${authId}`);
      } else {
        alert(`[DEBUG 7] status=${existing.status} → /junior 이동`);
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

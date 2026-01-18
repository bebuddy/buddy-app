// Client-only layout gate to avoid server dependency during static export
"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function MainLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const ensureSession = async () => {
      try {
        if (typeof supabase.auth?.getSession !== "function") {
          router.replace("/sign-in");
          return;
        }
        const { data, error } = await supabase.auth.getSession();
        if (error || !data.session) {
          router.replace("/sign-in");
          return;
        }
        setReady(true);
      } catch {
        router.replace("/sign-in");
      }
    };
    void ensureSession();
  }, [router]);

  if (!ready) {
    return <div className="flex min-h-screen items-center justify-center text-neutral-600">로그인 확인 중...</div>;
  }

  return <>{children}</>;
}

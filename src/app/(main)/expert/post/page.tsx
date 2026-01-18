"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ExpertPostPageClient from "./[id]/ExpertPostPageClient";

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ?? "";

  useEffect(() => {
    if (!id) {
      router.replace("/expert");
    }
  }, [id, router]);

  if (!id) {
    return null;
  }

  return <ExpertPostPageClient params={{ id }} />;
}

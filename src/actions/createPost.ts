"use server";

import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
// (선택) Supabase 타입이 있다면 사용하세요. 없으면 이 줄은 지워도 됩니다.
// import type { Database } from "@/types/supabase";

type PostJuniorData = {
  title: string;
  content: string;
  category: string;
  level: string | null;
  senior_type: string[];
  class_type: string | null;
  days: string[];
  times: string[];
  budget: number;
  budget_type: string | null;
  senior_gender: string | null;
  imageUrls: string[];
};

export async function createPost(data: PostJuniorData) {
  // ⬇️ 환경변수 주입 (너의 키 이름 그대로 지원)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Supabase env missing: URL/KEY");
    return { success: false, error: "서버 설정 오류: Supabase 환경변수가 없습니다." };
  }

  // ✅ 여기서 빈 객체 제네릭( <{}> )을 절대 쓰지 마세요.
  //    필요하면 <Database>를 넣고, 없으면 제네릭 생략이 가장 안전합니다.
  const supabase = createServerActionClient(
    { cookies },
    { supabaseUrl, supabaseKey: supabaseAnonKey }
  );

  // 로그인 사용자 확인
  const { data: userRes, error: userErr } = await supabase.auth.getUser();
  if (userErr) console.error("auth.getUser error:", userErr.message);
  const user = userRes?.user;
  if (!user) {
    return { success: false, error: "로그인이 필요합니다." };
  }

  // INSERT payload
  const postToInsert = {
    user_id: user.id,
    title: data.title,
    content: data.content,
    category: data.category,
    level: data.level,
    senior_type: data.senior_type,
    class_type: data.class_type,
    senior_gender: data.senior_gender,
    budget: data.budget,
    budget_type: data.budget_type,
    dates_times: { days: data.days, times: data.times }, // jsonb
    image_url_m: data.imageUrls.length > 0 ? data.imageUrls[0] : null,
  };

  const { data: newPost, error } = await supabase
    .from("post_junior")
    .insert([postToInsert])
    .select("id")
    .single();

  if (error) {
    console.error("Supabase insert error:", error.message);
    return { success: false, error: "데이터베이스 저장에 실패했습니다." };
  }

  revalidatePath("/");
  return newPost ? { success: true, id: newPost.id } : { success: false, error: "게시물을 생성하지 못했습니다." };
}

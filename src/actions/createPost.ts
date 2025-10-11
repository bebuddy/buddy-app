"use server";

import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

// WritePage.tsx에서 넘어올 데이터의 타입 (스키마에 맞춰 필드명 수정)
type PostJuniorData = {
  title: string;
  content: string; // desc -> content
  category: string;
  level: string | null;
  senior_type: string[]; // mentorTypes -> senior_type
  class_type: string | null; // meetPref -> class_type
  days: string[];
  times: string[];
  budget: number; // price -> budget (숫자 타입)
  budget_type: string | null; // unit -> budget_type
  senior_gender: string | null; // mentorGender -> senior_gender
  imageUrls: string[];
};

export async function createPost(data: PostJuniorData) {
  const supabase = createServerActionClient({ cookies });

  // 1. 현재 로그인한 사용자 정보 가져오기
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "로그인이 필요합니다." };
  }

  // 2. 프론트엔드 데이터를 DB 컬럼에 맞게 매핑하고 가공
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
    // 💡 jsonb 컬럼을 위해 days와 times를 JSON 객체로 만듭니다.
    dates_times: {
      days: data.days,
      times: data.times,
    },
    // 💡 image_url_m은 단일 text이므로 첫 번째 이미지를 대표 이미지로 저장합니다.
    image_url_m: data.imageUrls.length > 0 ? data.imageUrls[0] : null,
  };

  // 3. 'post_junior' 테이블에 데이터를 삽입합니다.
  const { data: newPost, error } = await supabase
    .from('post_junior') // 👈 실제 테이블 이름으로 변경 완료!
    .insert([postToInsert])
    .select('id')
    .single();

  if (error) {
    console.error("Supabase 에러:", error.message);
    return { success: false, error: "데이터베이스 저장에 실패했습니다." };
  }
  
  // 4. 메인 페이지(/) 캐시를 초기화하여 새 글이 바로 보이게 합니다.
  revalidatePath("/");

  if (newPost) {
    return { success: true, id: newPost.id };
  }

  return { success: false, error: "게시물을 생성하지 못했습니다." };
}
'use server';
import { supabase } from "@/lib/supabase";
import { RegisterJuniorReq } from "@/types/postType";

export async function getJuniorPostsByRandom(count: number = 4) {
    const { data, error } = await supabase.rpc('getjuniorpostsbyrandom', { _count: count })
    return { data, error }
}

export async function createJuniorPostAction(data: RegisterJuniorReq, userId: string) {
    try {
        const { data: result, error } = await supabase.rpc("createjuniorpost", {
            _user_id: userId,
            _title: data.title,
            _content: data.content,
            _level: data.level,
            _dates_times: data.datesTimes, // JSONB
            _senior_type: data.seniorType, // ENUM[]
            _class_type: data.classType,
            _budget: data.budget,
            _budget_type: data.budgetType,
            _senior_gender: data.seniorGender,
            _file_keys: data.fileKeys,
        });

        if (error) throw error;

        return {
            success: true,
            data: result,
            message: "post_junior 생성 완료",
        };
    } catch (err) {
        console.error("❌ createJuniorPostAction Error:", err);
        return {
            success: false,
            data: null,
            message: err instanceof Error ? err.message : "알 수 없는 오류 발생",
        };
    }
}

export async function getSeniorPostsByRandom(count: number = 3) {
    const { data, error } = await supabase.rpc('getseniorpostsbyrandom', { _count: count })
    return { data, error }
}
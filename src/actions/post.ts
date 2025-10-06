'use server';
import { supabase } from "@/lib/supabase";

export async function getJuniorPostsByRandom(count: number = 4) {
    const { data, error } = await supabase.rpc('getjuniorpostsbyrandom', { _count: count })
    return { data, error }
}

export async function getSeniorPostsByRandom(count: number = 3) {
    const { data, error } = await supabase.rpc('getseniorpostsbyrandom', { _count: count })
    return { data, error }
}
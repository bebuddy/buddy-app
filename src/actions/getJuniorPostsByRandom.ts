'use server';

import { supabase } from "@/lib/supabase";

export async function getJuniorPostsByRandom(count: number = 4) {
    const { data, error } = await supabase.rpc('getjuniorpostsbyrandom', { _count: count })
    return { data, error }
}
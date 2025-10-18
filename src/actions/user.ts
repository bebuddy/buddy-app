import { supabase } from "@/lib/supabase";

export async function getUserInfoAction(phoneNumber: string) {
    const cleanNumber = phoneNumber.replace(/-/g, "");
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("phone_number", cleanNumber)
      .single();
    if (error && error.code !== "PGRST116") console.error(error);
    return data; // null이면 user 없음
  }
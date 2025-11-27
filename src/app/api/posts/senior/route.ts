import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const count = Number(searchParams.get("count") ?? "3");

  const { data, error } = await supabase.rpc("getseniorpostsbyrandom", { _count: count });
  if (error) {
    console.error("getseniorpostsbyrandom error:", error);
    return NextResponse.json({ success: false, message: "게시글 조회 오류" }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}

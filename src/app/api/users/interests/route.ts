import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

async function createSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_KEY as string,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: Record<string, unknown>) {
          cookieStore.set({ name, value, ...options, path: "/" });
        },
        remove(name: string, options: Record<string, unknown>) {
          cookieStore.delete({ name, ...options, path: "/" });
        },
      },
    }
  );
}

export async function GET() {
  try {
    const supabase = await createSupabaseClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("interest")
      .select("value")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json(
        { success: false, message: "관심사를 불러올 수 없습니다." },
        { status: 500 }
      );
    }

    const values = (data ?? []).map((row) => row.value as string);
    return NextResponse.json({ success: true, data: values });
  } catch (error) {
    console.error("users/interests GET error:", error);
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { values } = (await request.json()) as { values?: string[] };
    if (!Array.isArray(values)) {
      return NextResponse.json({ success: false, message: "values 배열이 필요합니다." }, { status: 400 });
    }

    const { error: deleteError } = await supabase.from("interest").delete().eq("user_id", user.id);
    if (deleteError) {
      return NextResponse.json(
        { success: false, message: "관심사 저장 중 오류가 발생했습니다.(삭제)" },
        { status: 500 }
      );
    }

    if (values.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    const payload = values.map((value) => ({ user_id: user.id, value }));
    const { data, error } = await supabase.from("interest").insert(payload).select("value");
    if (error) {
      console.log(error)
      return NextResponse.json(
        { success: false, message: "관심사 저장 중 오류가 발생했습니다.(추가)" },
        { status: 500 }
      );
    }

    const saved = (data ?? []).map((row) => row.value as string);
    return NextResponse.json({ success: true, data: saved });
  } catch (error) {
    console.error("users/interests POST error:", error);
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

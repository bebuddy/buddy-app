"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Plus } from "lucide-react";
import ChipGroup from "@/components/ChipGroup";
import { apiFetch } from "@/lib/apiFetch";

const ORANGE = "#FF843D";        // 칩/플러스 버튼 오렌지
const PURPLE = "#6163FF";        // 알림 배지/테두리
type Interest =
  | "식물" | "요리" | "다도" | "뜨개" | "자수" | "공예" | "인테리어"
  | "글쓰기" | "그림" | "사진" | "음악"
  | "건강" | "운동" | "식습관" | "루틴 관리" | "마음" | "수면"
  | "면접" | "포트폴리오" | "커리어 설계" | "직무 멘토링" | "자격증"
  | "영어" | "일본어" | "중국어" | "불어" | "스페인어";

// ▶ 카테고리별 옵션
const INTEREST_GROUPS: { title: string; options: Interest[] }[] = [
  {
    title: "취미",
    options: ["식물", "요리", "다도", "뜨개", "자수", "공예", "인테리어"],
  },
  {
    title: "창작",
    options: ["글쓰기", "그림", "사진", "음악"],
  },
  {
    title: "라이프스타일",
    options: ["건강", "운동", "식습관", "루틴 관리", "마음", "수면"],
  },
  {
    title: "커리어",
    options: ["면접", "포트폴리오", "커리어 설계", "직무 멘토링", "자격증"],
  },
  {
    title: "언어",
    options: ["영어", "일본어", "중국어", "불어", "스페인어"],
  },
];


export default function MyPage() {
  const router = useRouter();

  // --- 프로필 & 관심사 상태 ---
  const [name, setName] = useState<string>("사용자");
  const [tagline, setTagline] = useState<string>("프로필을 업데이트해주세요");
  const [interests, setInterests] = useState<Interest[]>([]);

  // --- 관심사 편집 바텀시트 ---
  const [openPicker, setOpenPicker] = useState(false);
  const [tempInterests, setTempInterests] = useState<Interest[]>(interests);

  const [notificationCount, setNotificationCount] = useState<number>(0);

  async function loadInterests() {
    try {
      const res = await apiFetch("/api/users/interests", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok || !json?.success) throw new Error(json?.message ?? "관심사를 불러오지 못했습니다.");
      const list = (json.data as string[] | undefined) ?? [];
      setInterests(list as Interest[]);
      setTempInterests(list as Interest[]);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    let active = true;
    const fetchMe = async () => {
      try {
      const res = await apiFetch("/api/users/me", { cache: "no-store" });
        const json = await res.json();
        if (!res.ok || !json?.success) throw new Error(json?.message ?? "내 정보를 불러오지 못했습니다.");
        if (!active) return;
        const user = json.data as {
          nick_name?: string | null;
          introduction?: string | null;
          location?: string | null;
        };
        setName(user.nick_name || "사용자");
        setTagline(user.location || user.introduction || "프로필을 업데이트해주세요");
        // TODO: 관심사 컬럼이 생기면 여기서 setInterests에 반영
      } catch (error) {
        console.error(error);
      }
    };
    void fetchMe();
    void loadInterests();
    void (async () => {
      try {
        const res = await apiFetch("/api/notifications/unread-count", { cache: "no-store" });
        const json = await res.json();
        if (!res.ok || !json?.success) throw new Error(json?.message ?? "알림을 불러오지 못했습니다.");
        setNotificationCount(Number(json.data?.unreadCount ?? 0));
      } catch (error) {
        console.error(error);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div
      className="px-4 pt-4 pb-6"
      style={{ paddingBottom: "calc(64px + env(safe-area-inset-bottom))" }}
    >
      {/* 상단 Back */}
      <div className="flex items-center gap-2 mb-4">
        <button
          type="button"
          aria-label="뒤로가기"
          onClick={() => router.back()}
          className="p-1 -ml-1 rounded-full active:scale-95"
        >
          <ChevronLeft size={28} />
        </button>
        <div className="text-[18px] font-semibold">마이페이지</div>
      </div>

      {/* 프로필 카드 */}
      <button
        type="button"
        onClick={() => router.push("/myPage/profile")} // 프로필 수정 라우팅(임시 경로)
        className="mt-5 w-full flex items-center gap-4"
      >
        <div className="w-16 h-16 rounded-full bg-neutral-200 shrink-0" />
        <div className="flex flex-col items-start">
          <div className="text-[18px] font-semibold text-neutral-900">{name}</div>
          <div className="text-[16px] text-neutral-500">{tagline}</div>
        </div>
      </button>

      {/* 관심분야 + 편집 버튼 */}
      <div className="mt-6 flex items-center justify-between">
        <div className="text-[18px] font-semibold text-neutral-900">관심분야</div>
        <button
          type="button"
          onClick={() => { setTempInterests(interests); setOpenPicker(true); }}
          aria-label="관심분야 추가/수정"
          className="w-8 h-8 rounded-full border flex items-center justify-center"
          style={{ borderColor: "#FFDCC9", color: ORANGE }}
          title="관심분야 편집"
        >
          <Plus size={18} />
        </button>
      </div>

      {/* 선택된 관심사 표시 (첫 항목은 채움, 나머지는 외곽선 스타일로 이미지 느낌 재현) */}
      <div className="mt-3 flex flex-wrap gap-2">
        {interests.length === 0 ? (
          <span className="text-neutral-400">아직 선택한 관심분야가 없어요</span>
        ) : (
          interests.map((it, idx) => (
            <span
              key={it}
              className={[
                "px-3 py-1.5 rounded-full text-[16px] font-semibold border",
                "text-white", // <-- text-white로 고정
              ].join(" ")}
              style={{
                backgroundColor: ORANGE, // <-- ORANGE로 고정
                borderColor: ORANGE, // <-- ORANGE로 고정
              }}
            >
              {it}
            </span>
          ))
        )}
      </div>

      {/* 선배 인증 배너 */}
      <Link
        href="/myPage/expertCertification"
        className="mt-6 block"
      >
        <div
          className="rounded-2xl p-5"
          style={{
            background:
              "linear-gradient(90deg, rgba(187,170,255,0.28) 0%, rgba(255,233,219,0.6) 100%)",
          }}
        >
          <div className="text-[18px] font-semibold text-neutral-900">나도 선배가 될래요</div>
          <div className="text-neutral-600 mt-1 text-[16px]">인증하고 선배가 되어보세요</div>
        </div>
      </Link>

      {/* 저장했어요 박스 */}
      <Link href="/myPage/mySaved" className="mt-3 block">
        <div className="rounded-2xl p-5 bg-white border border-neutral-200">
          <div className="text-[18px] font-semibold text-neutral-900">
            저장했어요
          </div>
        </div>
      </Link>

      {/* 알림 박스 */}
      <Link href="/myPage/alarm" className="mt-3 block">
        <div
          className={[
            "rounded-2xl p-5 bg-white",
            notificationCount > 0 ? "border-2" : "border",
          ].join(" ")}
          style={{
            borderColor: notificationCount > 0 ? PURPLE : "#E5E7EB",
          }}
        >
          <div className="flex items-center gap-2">
            <div className="text-[18px] font-semibold text-neutral-900">알림</div>
            {notificationCount > 0 && (
              <span
                className="min-w-6 h-6 px-2 rounded-full text-white text-[14px] font-bold flex items-center justify-center"
                style={{ backgroundColor: PURPLE }}
              >
                {notificationCount}
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* --- 관심분야 편집 바텀시트 --- */}
        {openPicker && (
        <div className="fixed inset-0 z-[60]">
            {/* dim */}
            <button
            aria-label="닫기"
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpenPicker(false)}
            />
            {/* sheet */}
            <div className="absolute bottom-0 left-0 right-0 w-full max-w-[768px] mx-auto max-h-[85vh] overflow-auto rounded-t-2xl bg-white p-5 shadow-xl">
            <div className="mx-auto h-1.5 w-10 rounded-full bg-neutral-200 mb-4" />
            <div className="text-[18px] font-semibold mb-3">관심분야 선택</div>

            {/* 그룹별 렌더 - 각 그룹은 자신의 부분집합만 조절하고, 전체 선택은 유지 */}
            {INTEREST_GROUPS.map(({ title, options }) => {
                // 이 그룹에서 선택된 값만 부분집합으로 주기
                const subset = tempInterests.filter((x) => options.includes(x));
                // 이 그룹에서의 변경을 전체 tempInterests에 반영
                function handleGroupChange(nextSubset: Interest[]) {
                setTempInterests((prev) => {
                    const others = prev.filter((x) => !options.includes(x));
                    const merged = Array.from(new Set<Interest>([...others, ...nextSubset]));
                    return merged;
                });
                }

                return (
                <section key={title} className="mt-4">
                    <h3 className="text-[16px] font-semibold mb-3">{title}</h3>
                    <ChipGroup<Interest>
                    options={options}
                    value={subset}
                    onChange={(v) => handleGroupChange((v as Interest[]) ?? [])}
                    multiple
                    brand={ORANGE}
                    />
                </section>
                );
            })}

            <div className="mt-6 flex gap-2">
                <button
                type="button"
                onClick={() => setOpenPicker(false)}
                className="h-12 flex-1 rounded-xl border border-neutral-300 text-neutral-700 font-semibold"
                >
                취소
                </button>
                <button
                type="button"
                onClick={() => {
                    void (async () => {
                        try {
                            const res = await apiFetch("/api/users/interests", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ values: tempInterests }),
                            });
                            const json = await res.json();
                            if (!res.ok || !json?.success) throw new Error(json?.message ?? "관심사 저장 실패");
                            setInterests(json.data as Interest[]);
                        } catch (error) {
                            console.error(error);
                            alert("관심사 저장에 실패했습니다.");
                        } finally {
                            setOpenPicker(false);
                        }
                    })();
                }}
                className="h-12 flex-1 rounded-xl text-white font-semibold"
                style={{ backgroundColor: ORANGE }}
                >
                저장
                </button>
            </div>
            </div>
        </div>
        )}
    </div>
  );
}

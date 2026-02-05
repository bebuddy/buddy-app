// src/app/(main)/expert/register/page.tsx
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import RegisterActionBar from "@/components/RegisterActionBar";
import Disclosure from "@/components/Disclosure";
import LabeledInput from "@/components/LabeledInput";
import LabeledTextarea from "@/components/LabeledTextarea";
import ChipGroup from "@/components/ChipGroup";
import PriceInput from "@/components/PriceInput";
import PhotoUpload from "@/components/PhotoUpload";
import { useRouter } from "next/navigation";
import { track } from "@/lib/mixpanel";
import { apiFetch } from "@/lib/apiFetch";

const LEVELS = ["고수", "초고수", "신"] as const;
const GENDER_PREF = ["여자 후배님", "남자 후배님", "상관없음"] as const;
const MENTOR_TYPES = [
  "의지가 강한", "성장 욕구가 있는", "현업을 꿈꾸는", "깊이 고민하는", "다양한 시도", "예의 바른",
  "협력적인", "피드백에 유연한", "신뢰할 수 있는", "적극적인", "밝고 유쾌한", "실행력 있는",
  "꾸준한", "수용적인", "공감능력", "열려있는", "밝은",
] as const;
const ORANGE = "#FF883F";

const CATEGORY_GROUPS: { title: string; options: string[] }[] = [
  {
    title: "취미",
    options: ["식물", "음식", "목공", "뜨개", "자수", "공예", "인테리어", "기타시공", "타로"],
  },
  {
    title: "창작",
    options: ["글쓰기", "그림", "사진", "음악"],
  },
  {
    title: "라이프스타일",
    options: ["건강", "운동", "청소", "루틴 관리", "마음", "수면"],
  },
  {
    title: "커리어",
    options: ["면접", "포트폴리오", "커리어 설계", "직무 멘토링", "자격증", "스터디"],
  },
  {
    title: "언어",
    options: ["영어", "일본어", "중국어", "불어", "스페인어"],
  },
];

const DAY_AGREE = "요일 협의";
const TIME_AGREE = "시간대 협의";

const MEET_PREF = ["대면이 좋아요", "비대면이 좋아요", "상관없어요"] as const;
const DAYS = ["월", "화", "수", "목", "금", "토", "일", "요일 협의"] as const;
const TIMES = [
  "아침 (06:00 ~ 10:00)",
  "오전 (10:00 ~ 12:00)",
  "오후 (12:00 ~ 18:00)",
  "저녁 (18:00 ~ 22:00)",
  "야간 (22:00 이후)",
  "시간대 협의"
] as const;

type Unit = "시간" | "건당";

export default function ExpertRegisterPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");

  const [category, setCategory] = useState<string | null>(null); // [신규] 카테고리 state
  const [level, setLevel] = useState<(typeof LEVELS)[number] | null>(null);
  const [gender, setGender] = useState<(typeof GENDER_PREF)[number] | null>(null);
  const [mentorTypes, setMentorTypes] = useState<(typeof MENTOR_TYPES)[number][]>([]);
  const [meetPref, setMeetPref] = useState<(typeof MEET_PREF)[number] | null>(null);
  const [days, setDays] = useState<(typeof DAYS)[number][]>([]);
  const [times, setTimes] = useState<(typeof TIMES)[number][]>([]);

  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState<Unit | null>(null);
  const [negotiable, setNegotiable] = useState(false);
  const [fileKeys, setFileKeys] = useState<string[]>([]);

  // Mixpanel: register_started & register_exited
  const hasTrackedRef = useRef(false);
  const hasExitedRef = useRef(false);
  const enterTimeRef = useRef<number>(0);

  // ref로 최신 폼 상태 접근 (이벤트 리스너에서 사용)
  const formRef = useRef({ title, desc, category, level, gender, mentorTypes, meetPref, days, times, price, unit, negotiable });
  formRef.current = { title, desc, category, level, gender, mentorTypes, meetPref, days, times, price, unit, negotiable };

  const getFilledFields = useCallback(() => {
    const f = formRef.current;
    const filled: string[] = [];
    if (f.category) filled.push("category");
    if (f.title.trim()) filled.push("title");
    if (f.desc.trim()) filled.push("description");
    if (f.level) filled.push("level");
    if (f.gender) filled.push("gender_pref");
    if (f.mentorTypes.length > 0) filled.push("junior_type");
    if (f.meetPref) filled.push("meet_pref");
    if (f.days.length > 0) filled.push("days");
    if (f.times.length > 0) filled.push("times");
    if (f.negotiable || f.price.trim()) filled.push("price");
    return filled;
  }, []);

  const sendExit = useCallback(() => {
    if (hasExitedRef.current) return;
    hasExitedRef.current = true;
    const duration = Math.round((Date.now() - enterTimeRef.current) / 1000);
    const filled = getFilledFields();
    track("register_exited", {
      register_type: "senior",
      duration_seconds: duration,
      filled_fields: filled,
      filled_count: filled.length,
      total_fields: 10,
    });
  }, [getFilledFields]);

  useEffect(() => {
    if (hasTrackedRef.current) return;
    hasTrackedRef.current = true;
    enterTimeRef.current = Date.now();
    track("register_started", { register_type: "senior" });

    const onVisChange = () => { if (document.visibilityState === "hidden") sendExit(); };
    const onBeforeUnload = () => sendExit();
    document.addEventListener("visibilitychange", onVisChange);
    window.addEventListener("beforeunload", onBeforeUnload);

    return () => {
      sendExit();
      document.removeEventListener("visibilitychange", onVisChange);
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, [sendExit]);

  const isValid = useMemo(() => {
    const hasTitle = title.trim().length > 0;
    const hasDesc = desc.trim().length > 0;
    const hasLevel = !!level;
    const hasCategory = !!category;
    const hasMeet = !!meetPref;
    const hasPrice = negotiable || (price.trim().length > 0 && /^\d+$/.test(price));
    return hasTitle && hasDesc && hasLevel && hasCategory && hasMeet && hasPrice;
  }, [title, desc, level, category, meetPref, price, negotiable]);


  // 협의 선택 로직
  function handleDaysChange(next: string[]) {
    if (next.includes(DAY_AGREE)) {
      setDays([DAY_AGREE]);
    } else {
      setDays(next.filter(d => d !== DAY_AGREE) as (typeof DAYS)[number][]);
    }
  }
  function handleTimesChange(next: string[]) {
    if (next.includes(TIME_AGREE)) {
      setTimes([TIME_AGREE]);
    } else {
      setTimes(next.filter(t => t !== TIME_AGREE) as (typeof TIMES)[number][]);
    }
  }

  async function handleSubmit() {
    if (!isValid) return;

    // 1) 사용자 정보 조회
    let userId: string | null = null;
    try {
      const userRes = await apiFetch("/api/users/me");
      if (userRes.ok) {
        const userData = await userRes.json();
        userId = userData?.data?.id ?? null;
      }
    } catch (e) {
      console.error("Failed to fetch user:", e);
    }

    if (!userId) {
      alert("로그인이 필요합니다.");
      router.push("/login");
      return;
    }

    // 2) 시간대 값 변환
    const timeMapping: Record<string, string> = {
      "아침 (06:00 ~ 10:00)": "아침",
      "오전 (10:00 ~ 12:00)": "오전",
      "오후 (12:00 ~ 18:00)": "오후",
      "저녁 (18:00 ~ 22:00)": "저녁",
      "야간 (22:00 이후)": "야간",
      "시간대 협의": "시간대 협의",
    };
    const classTypeMapping: Record<string, string> = {
      "대면이 좋아요": "대면",
      "비대면이 좋아요": "비대면",
      "상관없어요": "상관없음",
    };
    const genderMapping: Record<string, string> = {
      "남자 후배님": "남성",
      "여자 후배님": "여성",
      "상관없음": "상관없음",
    };

    const mappedTimes = times.map(t => timeMapping[t] ?? t);
    const mappedDays = days.includes("요일 협의") ? "요일 협의" : days.filter(d => d !== "요일 협의");
    const mappedTimesFinal = times.includes("시간대 협의") ? "시간대 협의" : mappedTimes.filter(t => t !== "시간대 협의");

    // 3) 요청 데이터 구성
    const requestBody = {
      userId,
      category: category ?? "",
      title,
      content: desc,
      level: level ?? "고수",
      datesTimes: {
        day: mappedDays,
        time: mappedTimesFinal,
      },
      juniorType: mentorTypes,
      classType: classTypeMapping[meetPref ?? ""] ?? "상관없음",
      budget: negotiable ? null : (price ? Number(price) : null),
      budgetType: negotiable ? "협의" : (unit ?? "시간"),
      juniorGender: genderMapping[gender ?? ""] ?? "상관없음",
      fileKeys,
    };

    // 4) API 호출
    try {
      const res = await apiFetch("/api/posts/senior", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        alert(result.message ?? "게시글 생성에 실패했습니다.");
        return;
      }

      // 5) 성공 시 이벤트 추적 & 상세 페이지로 이동
      const postId = result.data?.id;
      track("senior_post_created", {
        user_id: userId,
        post_id: postId ?? null,
        category: category ?? "",
        level: level ?? "",
        mentoring_way: meetPref ?? "",
        budget_type: negotiable ? "협의" : (unit ?? "시간"),
      });

      if (postId) {
        router.push(`/expert/post/${postId}`);
      } else {
        router.push("/expert");
      }
    } catch (e) {
      console.error("게시글 생성 오류:", e);
      alert("게시글 생성 중 오류가 발생했습니다.");
    }
  }

  // ✅ 비활성 칩 계산
  const dayDisabled = useMemo(
    () => days.includes(DAY_AGREE)
      ? (DAYS as readonly string[]).filter(d => d !== DAY_AGREE)
      : [],
    [days]
  );
  const timeDisabled = useMemo(
    () => times.includes(TIME_AGREE)
      ? (TIMES as readonly string[]).filter(t => t !== TIME_AGREE)
      : [],
    [times]
  );

  return (
    <>
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/70">
        <RegisterActionBar isValid={isValid} onSubmit={handleSubmit} brand={ORANGE} />
      </div>
      <div className="px-4" style={{ paddingBottom: "calc(16px + env(safe-area-inset-bottom))" }}>


        {/* 카테고리(접이식) */}
        <Disclosure
          title="배우고 싶은 주제를 선택해주세요."
          summary={
            category ? (
              <span
                className="inline-block px-2 py-0.5 rounded-md text-sm font-semibold"
                style={{ color: ORANGE, backgroundColor: `${ORANGE}1A` }} // 1A는 10% 투명도
              >
                {category}
              </span>
            ) : null
          }
        >
          <div className="flex flex-col gap-5 pt-2">
            {CATEGORY_GROUPS.map(({ title, options }) => (
              <section key={title}>
                <h3 className="text-[16px] font-semibold mb-3 text-neutral-800">{title}</h3>
                <ChipGroup
                  options={options}
                  value={category}
                  onChange={(v) => setCategory(v as string | null)}
                  multiple={false}
                  brand={ORANGE}
                />
              </section>
            ))}
          </div>
        </Disclosure>

        <div className="h-5" />

        {/* 한 줄 소개 */}
        <LabeledInput
          label="나와 내 전문 분야에 대해 한 줄로 표현해주세요!"
          largeLabel
          value={title}
          onChange={setTitle}
          placeholder="예) 30년 경력의 장미 가지치기 고수" />

        <div className="h-5" />

        {/* 상세 소개 */}
        <LabeledTextarea
          label="본인의 경력 / 이력 / 자격증 등 ... 서술해주세요"
          value={desc}
          onChange={setDesc}
          placeholder="예) 조경기사 자격 보유, 단독주택 관리 10년 등"
          rows={4} />

        <div className="my-6 border-t border-neutral-200" />

        {/* 내공(단일) */}
        <div className="flex flex-col gap-3 mt-7">
          <div className="text-[18px] font-extrabold text-neutral-900">
            선배님의 현재 내공의 정도를 선택해주세요.
          </div>
          <ChipGroup
            options={LEVELS as unknown as string[]}
            value={level}
            onChange={(v) => setLevel(v as typeof level)}
            multiple={false}
            brand={ORANGE} />
        </div>

        {/* 선호 성별(단일) */}
        <div className="flex flex-col gap-3 mt-7">
          <div className="text-[18px] font-extrabold text-neutral-900">
            선호하는 후배님 성별이 있으신가요?
          </div>
          <ChipGroup
            options={GENDER_PREF as unknown as string[]}
            value={gender}
            onChange={(v) => setGender(v as typeof gender)}
            multiple={false}
            brand={ORANGE} />
        </div>

        {/* 원하는 후배(다중) */}
        <div className="flex flex-col gap-3 mt-7">
          <div className="text-[18px] font-extrabold text-neutral-900">
            어떤 후배님을 만나고 싶으신가요?
          </div>
          <ChipGroup
            options={MENTOR_TYPES as unknown as string[]}
            value={mentorTypes}
            onChange={(v) => setMentorTypes(v as typeof mentorTypes)}
            multiple
            brand={ORANGE} />
        </div>

        {/* 활동 방식(단일) */}
        <div className="flex flex-col gap-3 mt-7">
          <div className="text-[18px] font-extrabold text-neutral-900">
            활동은 어떤 방식이 좋으세요?
          </div>
          <ChipGroup
            options={MEET_PREF as unknown as string[]}
            value={meetPref}
            onChange={(v) => setMeetPref(v as typeof meetPref)}
            multiple={false}
            brand={ORANGE} />
        </div>

        {/* 가능한 요일/시간대 */}
        <div className="flex flex-col gap-3 mt-7">
          <div className="text-[18px] font-extrabold text-neutral-900">가능한 요일 · 시간대를 알려주세요.</div>

          <ChipGroup
            options={DAYS as unknown as string[]}
            value={days}
            onChange={(v) => handleDaysChange(v as typeof days)}
            multiple
            brand={ORANGE}
            disabledOptions={dayDisabled} />

          <ChipGroup
            options={TIMES as unknown as string[]}
            value={times}
            onChange={(v) => handleTimesChange(v as typeof times)}
            multiple
            brand={ORANGE}
            disabledOptions={timeDisabled} />
        </div>

        {/* 가격 섹션 */}
        <div className="flex flex-col gap-3 mt-7">
          <div className="text-[18px] font-extrabold text-neutral-900">
            과외비 하한을 입력해주세요.
          </div>

          <PriceInput
            value={price}
            onChange={setPrice}
            unit={unit}
            onUnitChange={setUnit}
            negotiable={negotiable}
            onToggleNegotiable={() => setNegotiable((prev) => {
              const next = !prev;
              if (next) { // ✅ 협의해요 ON 시 값/단가 리셋
                setPrice("");
                setUnit(null);
              }
              return next;
            })}
            brand={ORANGE} // 색상 통일
          />
        </div>

        {/* 사진 등록 */}
        <div className="mt-7">
          <PhotoUpload brand={ORANGE} onChange={setFileKeys} />
        </div>

        {/* 하단 빈칸 최소화 */}
        <div className="h-8" />
      </div></>
  );
}

// src/app/(main)/junior/register/page.tsx
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import RegisterActionBar from "@/components/RegisterActionBar";
import Disclosure from "@/components/Disclosure";
import LabeledInput from "@/components/LabeledInput";
import LabeledTextarea from "@/components/LabeledTextarea";
import ChipGroup from "@/components/ChipGroup";
import PriceInput from "@/components/PriceInput";
import PhotoUpload from "@/components/PhotoUpload";
import IncomingCallToast from "@/components/voice-call/IncomingCallToast";
import VoiceCallScreen from "@/components/voice-call/VoiceCallScreen";
import type { RegisterJuniorReq } from "@/types/postType";
import { BudgetType, ClassType, GenderType, TimeType } from "@/types/postType";
import { track } from "@/lib/mixpanel";
import { apiFetch } from "@/lib/apiFetch";
import { useVoiceCallStore } from "@/lib/voiceCallStore";
import { useRealtimeCall } from "@/hooks/useRealtimeCall";
import { isNativeIOS } from "@/lib/googleAuth";

// (백엔드 연동은 나중에 붙일 예정이므로 타입만 지역 선언)
type Unit = "시간" | "건당";

const BRAND = "#6163FF";

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

// 옵션들
const LEVELS = ["입문", "초보", "심화"] as const;
const MENTOR_GENDER = ["남자 선배님", "여자 선배님", "상관없음"] as const;
const MENTOR_TYPES = [
  "실무 경험 풍부한", "전문 지식", "협업인", "문제 해결", "다방면에 능통한", "친절한",
  "배려심 깊은", "솔직한", "믿음직한", "열정적인", "유머러스한", "현실적인",
  "차분한", "꼼꼼한 피드백", "든든한 조력자", "인생 선배", "롤모델", "치어리더",
] as const;

const MEET_PREF = ["대면이 좋아요", "비대면이 좋아요", "상관없어요"] as const;

const DAY_AGREE = "요일 협의";
const TIME_AGREE = "시간대 협의";
const DAYS = ["월", "화", "수", "목", "금", "토", "일", DAY_AGREE] as const;
const TIMES = [
  "아침 (06:00 ~ 10:00)",
  "오전 (10:00 ~ 12:00)",
  "오후 (12:00 ~ 18:00)",
  "저녁 (18:00 ~ 22:00)",
  "야간 (22:00 이후)",
  TIME_AGREE,
] as const;

export default function WritePage() {
  const router = useRouter();

  // 폼 상태
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");

  const [category, setCategory] = useState<string | null>(null); // [신규] 카테고리 state
  const [level, setLevel] = useState<(typeof LEVELS)[number] | null>(null);
  const [mentorGender, setMentorGender] = useState<(typeof MENTOR_GENDER)[number] | null>(null);
  const [mentorTypes, setMentorTypes] = useState<(typeof MENTOR_TYPES)[number][]>([]);
  const [meetPref, setMeetPref] = useState<(typeof MEET_PREF)[number] | null>(null);
  const [days, setDays] = useState<(typeof DAYS)[number][]>([]);
  const [times, setTimes] = useState<(typeof TIMES)[number][]>([]);

  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState<Unit | null>(null);
  const [negotiable, setNegotiable] = useState(false);

  const [fileKeys, setFileKeys] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCallToast, setShowCallToast] = useState(() => !isNativeIOS());

  // Voice call
  const isCallActive = useVoiceCallStore((s) => s.isCallActive);
  const draft = useVoiceCallStore((s) => s.draft);
  const clearDraft = useVoiceCallStore((s) => s.clearDraft);
  const { startCall, endCall, isConnecting, audioLevel, error: callError } = useRealtimeCall();

  // Apply draft to form when call ends
  const prevCallActive = useRef(false);
  useEffect(() => {
    if (prevCallActive.current && !isCallActive && Object.keys(draft).length > 0) {
      if (draft.category) setCategory(draft.category as string);
      if (draft.title) setTitle(draft.title as string);
      if (draft.content) setDesc(draft.content as string);
      if (draft.level) setLevel(draft.level as (typeof LEVELS)[number]);
      if (draft.seniorGender) {
        const genderMap: Record<string, (typeof MENTOR_GENDER)[number]> = {
          "남성": "남자 선배님", "여성": "여자 선배님", "상관없음": "상관없음",
        };
        const mapped = genderMap[draft.seniorGender as string];
        if (mapped) setMentorGender(mapped);
      }
      if (Array.isArray(draft.seniorType) && draft.seniorType.length > 0) {
        setMentorTypes(draft.seniorType as (typeof MENTOR_TYPES)[number][]);
      }
      if (draft.classType) {
        const classMap: Record<string, (typeof MEET_PREF)[number]> = {
          "대면": "대면이 좋아요", "비대면": "비대면이 좋아요", "상관없음": "상관없어요",
        };
        const mapped = classMap[draft.classType as string];
        if (mapped) setMeetPref(mapped);
      }
      if (draft.daysNegotiable) {
        setDays([DAY_AGREE]);
      } else if (Array.isArray(draft.days) && draft.days.length > 0) {
        setDays(draft.days as (typeof DAYS)[number][]);
      }
      if (draft.timesNegotiable) {
        setTimes([TIME_AGREE]);
      } else if (Array.isArray(draft.times) && draft.times.length > 0) {
        const timeReverseMap: Record<string, (typeof TIMES)[number]> = {
          "아침": "아침 (06:00 ~ 10:00)", "오전": "오전 (10:00 ~ 12:00)",
          "오후": "오후 (12:00 ~ 18:00)", "저녁": "저녁 (18:00 ~ 22:00)", "야간": "야간 (22:00 이후)",
        };
        setTimes((draft.times as string[]).map((t) => timeReverseMap[t] ?? t) as (typeof TIMES)[number][]);
      }
      if (draft.budgetType === "협의") {
        setNegotiable(true);
      } else {
        if (draft.budget !== undefined && draft.budget !== null) {
          setPrice(String(draft.budget));
        }
        if (draft.budgetType === "시간" || draft.budgetType === "건당") {
          setUnit(draft.budgetType as Unit);
        }
      }
      clearDraft();
    }
    prevCallActive.current = isCallActive;
  }, [isCallActive, draft, clearDraft]);

  const handleAcceptCall = async () => {
    setShowCallToast(false);
    await startCall("junior");
  };

  const handleDeclineCall = () => {
    setShowCallToast(false);
  };

  const handleEndCall = () => {
    endCall();
  };

  // Mixpanel: register_started & register_exited
  const hasTrackedRef = useRef(false);
  const hasExitedRef = useRef(false);
  const enterTimeRef = useRef<number>(0);

  const formRef = useRef({ title, desc, category, level, mentorGender, mentorTypes, meetPref, days, times, price, unit, negotiable });
  formRef.current = { title, desc, category, level, mentorGender, mentorTypes, meetPref, days, times, price, unit, negotiable };

  const getFilledFields = useCallback(() => {
    const f = formRef.current;
    const filled: string[] = [];
    if (f.category) filled.push("category");
    if (f.title.trim()) filled.push("title");
    if (f.desc.trim()) filled.push("description");
    if (f.level) filled.push("level");
    if (f.mentorGender) filled.push("gender_pref");
    if (f.mentorTypes.length > 0) filled.push("senior_type");
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
      register_type: "junior",
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
    track("register_started", { register_type: "junior" });

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

  // 협의 선택 로직
  function handleDaysChange(next: string[]) {
    if (next.includes(DAY_AGREE)) {
      setDays([DAY_AGREE]);
    } else {
      setDays(next.filter((d) => d !== DAY_AGREE) as (typeof DAYS)[number][]);
    }
  }
  function handleTimesChange(next: string[]) {
    if (next.includes(TIME_AGREE)) {
      setTimes([TIME_AGREE]);
    } else {
      setTimes(next.filter((t) => t !== TIME_AGREE) as (typeof TIMES)[number][]);
    }
  }

  // 비활성 칩 계산
  const dayDisabled = useMemo(
    () => (days.includes(DAY_AGREE) ? (DAYS as readonly string[]).filter((d) => d !== DAY_AGREE) : []),
    [days]
  );
  const timeDisabled = useMemo(
    () => (times.includes(TIME_AGREE) ? (TIMES as readonly string[]).filter((t) => t !== TIME_AGREE) : []),
    [times]
  );

  // 유효성
  const isValid = useMemo(() => {
    const hasTitle = title.trim().length > 0;
    const hasDesc = desc.trim().length > 0;
    const hasCategory = !!category;
    const hasMeet = !!meetPref;
    const hasPrice = negotiable || (price.trim().length > 0 && /^\d+$/.test(price));
  
    return hasTitle && hasDesc && hasCategory && hasMeet && hasPrice;
  }, [title, desc, category, meetPref, price, negotiable]);

  function extractPostId(data: unknown): string | null {
    if (!data) return null;
    if (typeof data === "string") return data;
    if (Array.isArray(data)) return extractPostId(data[0]);
    if (typeof data !== "object") return null;
    const record = data as Record<string, unknown>;
    const id = record.id ?? record.post_id ?? record.post_junior_id ?? record.postId;
    return typeof id === "string" ? id : null;
  }

  async function handleSubmit() {
    if (!isValid || isSubmitting) return;
    if (!category || !level || !mentorGender || !meetPref) {
      alert("필수 항목을 모두 입력해주세요.");
      return;
    }
    if (!negotiable && !unit) {
      alert("가격 단위를 선택해주세요.");
      return;
    }

    try {
      setIsSubmitting(true);

      const meRes = await apiFetch("/api/users/me", { cache: "no-store" });
      const meJson = await meRes.json();
      if (!meRes.ok || !meJson?.success) {
        throw new Error(meJson?.message ?? "로그인이 필요합니다.");
      }
      const userId = meJson?.data?.id as string | undefined;
      if (!userId) {
        throw new Error("사용자 정보를 찾을 수 없습니다.");
      }

      const dayValue =
        days.length === 0 || days.includes(DAY_AGREE) ? "요일 협의" : days.filter((d) => d !== DAY_AGREE);
      const timeValue =
        times.length === 0 || times.includes(TIME_AGREE)
          ? "시간대 협의"
          : times
              .filter((t) => t !== TIME_AGREE)
              .map((t) => TimeType[t as keyof typeof TimeType] ?? t);

      const payload: RegisterJuniorReq & { userId: string } = {
        userId,
        category,
        title,
        content: desc,
        level,
        datesTimes: { day: dayValue, time: timeValue },
        seniorType: mentorTypes,
        classType: ClassType[meetPref],
        budget: negotiable ? null : Number(price || 0),
        budgetType: negotiable ? BudgetType["협의해요"] : BudgetType[unit ?? "시간"],
        seniorGender: GenderType[mentorGender],
        fileKeys,
      };

      const res = await apiFetch("/api/posts/junior", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json?.success) {
        throw new Error(json?.message ?? "게시글 생성에 실패했습니다.");
      }

      const postId = extractPostId(json?.data);
      if (!postId) {
        throw new Error("생성된 게시글 ID를 찾을 수 없습니다.");
      }

      track("junior_post_created", {
        user_id: userId,
        post_id: postId,
        category,
        level,
        budget_type: negotiable ? "협의" : (unit ?? "시간"),
      });

      router.replace(`/junior/post/${postId}`);
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "게시글 생성에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      {/* Voice call overlay */}
      {isCallActive && (
        <VoiceCallScreen audioLevel={audioLevel} onEndCall={handleEndCall} />
      )}

      {/* Connecting overlay */}
      {isConnecting && (
        <div className="fixed inset-0 z-[9998] bg-black/60 flex items-center justify-center">
          <div className="text-white text-center">
            <div className="w-10 h-10 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm">연결 중...</p>
          </div>
        </div>
      )}

      {/* Call error toast */}
      {callError && !isCallActive && (
        <div className="mx-4 mt-3 p-3 rounded-xl bg-red-50 border border-red-200">
          <p className="text-red-700 text-sm">{callError}</p>
        </div>
      )}

      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/70">
        <RegisterActionBar isValid={isValid && !isSubmitting} onSubmit={handleSubmit} brand={BRAND} />
      </div>

      {/* Incoming call toast */}
      {showCallToast && !isCallActive && (
        <IncomingCallToast onAccept={handleAcceptCall} onDecline={handleDeclineCall} />
      )}

      <div className="px-4" style={{ paddingBottom: "calc(16px + env(safe-area-inset-bottom))" }}>

        {/* 카테고리(접이식) */}
        <Disclosure
          title="배우고 싶은 주제를 선택해주세요."
          summary={
            category ? (
              <span
                className="inline-block px-2 py-0.5 rounded-md text-sm font-semibold"
                style={{ color: BRAND, backgroundColor: `${BRAND}1A` }} // 1A는 10% 투명도
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
                  brand={BRAND}
                />
              </section>
            ))}
          </div>
        </Disclosure>

        <div className="h-5" />

        {/* 제목 */}
        <LabeledInput
          label="배우고 싶은 내용을 한 문장으로 표현해주세요!"
          largeLabel
          value={title}
          onChange={setTitle}
          placeholder="예) 스트레칭 루틴을 익히고 싶어요" />

        <div className="h-5" />

        {/* 상세 설명 */}
        <LabeledTextarea
          label="수업을 통해 달성하고 싶은 목표, 선배님께 바라는 점 등을 입력해주세요."
          value={desc}
          onChange={setDesc}
          placeholder="예) 허리 통증 완화, 주 2회 대면 수업 등"
          rows={4} />

        <div className="my-6 border-t border-neutral-200" />

        {/* 현재 배움 정도 */}
        <div className="flex flex-col gap-3 mt-7">
          <div className="text-[18px] font-extrabold text-neutral-900">후배님의 현재 배움의 정도를 선택해주세요.</div>
          <ChipGroup
            options={LEVELS as unknown as string[]}
            value={level}
            onChange={(v) => setLevel(v as typeof level)}
            multiple={false}
            brand={BRAND} />
        </div>

        {/* 선호 성별 */}
        <div className="flex flex-col gap-3 mt-7">
          <div className="text-[18px] font-extrabold text-neutral-900">선호하는 선배님 성별이 있으신가요?</div>
          <ChipGroup
            options={MENTOR_GENDER as unknown as string[]}
            value={mentorGender}
            onChange={(v) => setMentorGender(v as typeof mentorGender)}
            multiple={false}
            brand={BRAND} />
        </div>

        {/* 선배 유형 */}
        <div className="flex flex-col gap-3 mt-7">
          <div className="text-[18px] font-extrabold text-neutral-900">어떤 선배님을 만나고 싶으신가요?</div>
          <ChipGroup
            options={MENTOR_TYPES as unknown as string[]}
            value={mentorTypes}
            onChange={(v) => setMentorTypes(v as typeof mentorTypes)}
            multiple
            brand={BRAND} />
        </div>

        {/* 활동 방식 */}
        <div className="flex flex-col gap-3 mt-7">
          <div className="text-[18px] font-extrabold text-neutral-900">활동은 어떤 방식이 좋으세요?</div>
          <ChipGroup
            options={MEET_PREF as unknown as string[]}
            value={meetPref}
            onChange={(v) => setMeetPref(v as typeof meetPref)}
            multiple={false}
            brand={BRAND} />
        </div>

        {/* 가능한 요일/시간대 */}
        <div className="flex flex-col gap-3 mt-7">
          <div className="text-[18px] font-extrabold text-neutral-900">가능한 요일 · 시간대를 알려주세요.</div>

          <ChipGroup
            options={DAYS as unknown as string[]}
            value={days}
            onChange={(v) => handleDaysChange(v as typeof days)}
            multiple
            brand={BRAND}
            disabledOptions={dayDisabled} />

          <ChipGroup
            options={TIMES as unknown as string[]}
            value={times}
            onChange={(v) => handleTimesChange(v as typeof times)}
            multiple
            brand={BRAND}
            disabledOptions={timeDisabled} />
        </div>

        {/* 과외비 */}
        <div className="flex flex-col gap-3 mt-7">
          <div className="text-[18px] font-extrabold text-neutral-900">과외비 한도를 입력해주세요.</div>
          <PriceInput
            value={price}
            onChange={setPrice}
            unit={unit}
            onUnitChange={setUnit}
            negotiable={negotiable}
            onToggleNegotiable={() => setNegotiable((v) => !v)}
            brand={BRAND} />
        </div>

        {/* 사진 업로드 */}
        <div className="mt-7">
          <PhotoUpload brand={BRAND} onChange={setFileKeys} />
        </div>

        <div className="h-8" />
      </div>
    </>
  );
}

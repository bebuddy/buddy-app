/* eslint-disable @typescript-eslint/no-explicit-any */

// app/(onboarding)/onboarding/junior/page.tsx
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import OnboardingTopbar from "@/components/OnboardingTopbar";
import OnboardingNav from "@/components/OnboardingNav";
import ChipGroup from "@/components/ChipGroup";
import PriceInput from "@/components/PriceInput";

const BRAND = "#6163FF";
const DAY_AGREE = "요일 협의";
const TIME_AGREE = "시간대 협의";

// 데모 옵션 (필요시 조정)
const SUBJECTS = ["식물","요리","자수","공예","인터리어","운동","작문"] as const;
const LEVELS = ["입문","초보","심화"] as const;
const MENTOR_GENDER = ["남자 선배님","여자 선배님","상관없음"] as const;
const MENTOR_TYPES = ["실무 경험 풍부한","문제 해결","친절한","현실적인","꼼꼼한 피드백","열정적인","차분한","믿음직한"] as const;
const MEET_PREF = ["대면이 좋아요","비대면이 좋아요","상관없어요"] as const;
const DAYS = ["월","화","수","목","금","토","일", DAY_AGREE] as const;
const TIMES = [
  "아침 (06:00 ~ 10:00)","오전 (10:00 ~ 12:00)","오후 (12:00 ~ 18:00)","저녁 (18:00 ~ 22:00)","야간 (22:00 이후)", TIME_AGREE
] as const;

type Unit = "시간"|"건당";

export default function OnboardingJuniorPage() {
  const router = useRouter();

  // B: 빠른매칭 여부 화면 → true면 C로, false면 완료(D)
  const [phase, setPhase] = React.useState<"ask"|"form">("ask");

  // C 폼 상태
  const [step, setStep] = React.useState(0);
  const [subject, setSubject] = React.useState<typeof SUBJECTS[number][]>([]);
  const [title, setTitle] = React.useState("");
  const [goal, setGoal] = React.useState("");
  const [level, setLevel] = React.useState<typeof LEVELS[number] | null>(null);
  const [mentorGender, setMentorGender] = React.useState<typeof MENTOR_GENDER[number] | null>(null);
  const [mentorTypes, setMentorTypes] = React.useState<typeof MENTOR_TYPES[number][]>([]);
  const [meetPref, setMeetPref] = React.useState<typeof MEET_PREF[number] | null>(null);
  const [days, setDays] = React.useState<typeof DAYS[number][]>([]);
  const [times, setTimes] = React.useState<typeof TIMES[number][]>([]);
  const [price, setPrice] = React.useState("");
  const [unit, setUnit] = React.useState<Unit | null>(null);
  const [negotiable, setNegotiable] = React.useState(false);

  function skipAll() { router.push("/"); } // 나중에 하기

  // ask 화면
  if (phase === "ask") {
    return (
      <div className="w-full flex justify-center">
        <div className="w-full max-w-[440px] min-h-screen bg-white">
          <OnboardingTopbar onSkip={skipAll} />
          <div className="px-5">
            <h1 className="mt-4 text-[18px] font-extrabold">선배님을 찾고 계신가요?</h1>
            <div className="mt-2 text-[13px] text-neutral-600">바로 매칭을 도와드려요.</div>

            <div className="mt-6 space-y-3">
              <button
                className="w-full h-12 rounded-lg font-bold text-white"
                style={{ backgroundColor: BRAND }}
                onClick={()=>setPhase("form")}
              >
                빠른 매칭 원해요
              </button>
              <button
                className="w-full h-12 rounded-lg border font-bold"
                onClick={()=>router.push("/onboarding/complete")}
              >
                괜찮아요
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // C 단계별 유효성
  const val = [
    subject.length === 0,
    title.trim().length === 0,
    goal.trim().length === 0,
    !level,
    !mentorGender,
    mentorTypes.length === 0,
    !meetPref,
    days.length === 0,
    times.length === 0,
    !(negotiable || (price && /^\d+$/.test(price)))
  ][step];

  // agree 로직
  function changeDays(next: string[]) {
    if (next.includes(DAY_AGREE)) setDays([DAY_AGREE]);
    else setDays(next.filter(d=>d!==DAY_AGREE) as typeof DAYS[number][]);
  }
  function changeTimes(next: string[]) {
    if (next.includes(TIME_AGREE)) setTimes([TIME_AGREE]);
    else setTimes(next.filter(t=>t!==TIME_AGREE) as typeof TIMES[number][]);
  }
  const dayDisabled = days.includes(DAY_AGREE) ? (DAYS as readonly string[]).filter(d=>d!==DAY_AGREE) : [];
  const timeDisabled = times.includes(TIME_AGREE) ? (TIMES as readonly string[]).filter(t=>t!==TIME_AGREE) : [];

  function next() {
    if (step < 9) return setStep(s=>s+1);

    // 완료 → 로컬 프리뷰 저장 후 상세 미리보기(주니어)로 이동
    const preview = {
      id: "preview",
      title,
      category: subject[0] ?? null,
      createdAt: Date.now(),
      imageUrls: [], // 추후 연결
      priceKRW: negotiable ? 0 : Number(price || 0),
      unit: negotiable ? null : (unit || "시간"),
      timeNote: times.includes(TIME_AGREE) ? "시간대 협의" : times.join(", "),
      paragraphs: [goal],
      mentorTypes,
      meetPref,
      author: { name: "익명", age: "-", gender: "-" },
    };
    try { localStorage.setItem("postPreview", JSON.stringify(preview)); } catch {}
    router.push("/junior/post/preview");
  }
  function back() {
    if (step===0) return setPhase("ask");
    setStep(s=>s-1);
  }

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-[440px] min-h-screen bg-white">
        <OnboardingTopbar onSkip={skipAll} />
        <div className="px-5 pb-28">
          {/* 단계별 UI */}
          {step===0 && <>
            <h2 className="text-[18px] font-extrabold">배우고 싶은 주제를 선택해주세요.</h2>
            <div className="mt-4"><ChipGroup options={[...SUBJECTS] as any} value={subject as any} onChange={v=>setSubject(v as any)} multiple brand={BRAND}/></div>
          </>}
          {step===1 && <>
            <h2 className="text-[18px] font-extrabold">한 문장으로 표현해주세요.</h2>
            <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="예) 장미 가지치기 배우고 싶어요" className="mt-4 w-full h-12 rounded-lg border px-3"/>
          </>}
          {step===2 && <>
            <h2 className="text-[18px] font-extrabold">달성하고 싶은 목표/바라는 점</h2>
            <textarea value={goal} onChange={e=>setGoal(e.target.value)} rows={5} className="mt-4 w-full rounded-lg border px-3 py-2" />
          </>}
          {step===3 && <>
            <h2 className="text-[18px] font-extrabold">현재 배움의 정도</h2>
            <div className="mt-4"><ChipGroup options={[...LEVELS] as any} value={level as any} onChange={v=>setLevel(v as any)} brand={BRAND}/></div>
          </>}
          {step===4 && <>
            <h2 className="text-[18px] font-extrabold">선호하는 선배님 성별</h2>
            <div className="mt-4"><ChipGroup options={[...MENTOR_GENDER] as any} value={mentorGender as any} onChange={v=>setMentorGender(v as any)} brand={BRAND}/></div>
          </>}
          {step===5 && <>
            <h2 className="text-[18px] font-extrabold">어떤 선배님을 만나고 싶나요?</h2>
            <div className="mt-4"><ChipGroup options={[...MENTOR_TYPES] as any} value={mentorTypes as any} onChange={v=>setMentorTypes(v as any)} multiple brand={BRAND}/></div>
          </>}
          {step===6 && <>
            <h2 className="text-[18px] font-extrabold">활동은 어떤 방식이 좋으세요?</h2>
            <div className="mt-4"><ChipGroup options={[...MEET_PREF] as any} value={meetPref as any} onChange={v=>setMeetPref(v as any)} brand={BRAND}/></div>
          </>}
          {step===7 && <>
            <h2 className="text-[18px] font-extrabold">가능한 요일</h2>
            <div className="mt-4"><ChipGroup options={[...DAYS] as any} value={days as any} onChange={v=>changeDays(v as any)} multiple brand={BRAND} disabledOptions={dayDisabled as any}/></div>
          </>}
          {step===8 && <>
            <h2 className="text-[18px] font-extrabold">가능한 시간대</h2>
            <div className="mt-4"><ChipGroup options={[...TIMES] as any} value={times as any} onChange={v=>changeTimes(v as any)} multiple brand={BRAND} disabledOptions={timeDisabled as any}/></div>
          </>}
          {step===9 && <>
            <h2 className="text-[18px] font-extrabold">수업비 한도를 입력해주세요.</h2>
            <div className="mt-4">
              <PriceInput
                value={price}
                onChange={setPrice}
                unit={unit}
                onUnitChange={setUnit}
                negotiable={negotiable}
                onToggleNegotiable={()=>setNegotiable(v=>!v)}
                brand={BRAND}
              />
            </div>
          </>}
        </div>

        <OnboardingNav
          onBack={back}
          onNext={next}
          isNextDisabled={!!val}
          isFirstStep={false}
          nextLabel={step<9 ? "다음" : "완료"}
        />
      </div>
    </div>
  );
}

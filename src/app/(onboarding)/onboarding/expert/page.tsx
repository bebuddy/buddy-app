/* eslint-disable @typescript-eslint/no-explicit-any */

// app/(onboarding)/onboarding/expert/page.tsx
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import OnboardingTopbar from "@/components/OnboardingTopbar";
import OnboardingNav from "@/components/OnboardingNav";
import ChipGroup from "@/components/ChipGroup";
import PriceInput from "@/components/PriceInput";

const ORANGE = "#FF883F";
const DAY_AGREE = "요일 협의";
const TIME_AGREE = "시간대 협의";

const SUBJECTS = ["식물","요리","자수","공예","인터리어","운동","작문"] as const;
const LEVELS = ["고수","초고수","신"] as const;
const JUNIOR_GENDER = ["여자 후배님","남자 후배님","상관없음"] as const;
const JUNIOR_TYPES = ["성장 욕구가 있는","깊이 고민하는","협력적인","신뢰할 수 있는","적극적인","실행력 있는","꾸준한","밝은"] as const;
const MEET_PREF = ["대면이 좋아요","비대면이 좋아요","상관없어요"] as const;
const DAYS = ["월","화","수","목","금","토","일", DAY_AGREE] as const;
const TIMES = [
  "아침 (06:00 ~ 10:00)","오전 (10:00 ~ 12:00)","오후 (12:00 ~ 18:00)","저녁 (18:00 ~ 22:00)","야간 (22:00 이후)", TIME_AGREE
] as const;

type Unit = "시간"|"건당";

export default function OnboardingExpertPage() {
  const router = useRouter();
  const [phase, setPhase] = React.useState<"ask"|"form">("ask");

  const [step, setStep] = React.useState(0);
  const [subject, setSubject] = React.useState<typeof SUBJECTS[number][]>([]);
  const [title, setTitle] = React.useState("");
  const [career, setCareer] = React.useState(""); // 경력/이력
  const [level, setLevel] = React.useState<typeof LEVELS[number] | null>(null);
  const [gender, setGender] = React.useState<typeof JUNIOR_GENDER[number] | null>(null);
  const [types, setTypes] = React.useState<typeof JUNIOR_TYPES[number][]>([]);
  const [meetPref, setMeetPref] = React.useState<typeof MEET_PREF[number] | null>(null);
  const [days, setDays] = React.useState<typeof DAYS[number][]>([]);
  const [times, setTimes] = React.useState<typeof TIMES[number][]>([]);
  const [price, setPrice] = React.useState("");
  const [unit, setUnit] = React.useState<Unit | null>(null);
  const [negotiable, setNegotiable] = React.useState(false);

  function skipAll(){ router.push("/"); }

  if (phase==="ask") {
    return (
      <div className="w-full flex justify-center">
        <div className="w-full max-w-[440px] min-h-screen bg-white">
          <OnboardingTopbar onSkip={skipAll}/>
          <div className="px-5">
            <h1 className="mt-4 text-[18px] font-extrabold">후배님을 찾고 계신가요?</h1>
            <div className="mt-2 text-[13px] text-neutral-600">빠른 매칭을 도와드려요.</div>
            <div className="mt-6 space-y-3">
              <button className="w-full h-12 rounded-lg font-bold text-white" style={{backgroundColor: ORANGE}} onClick={()=>setPhase("form")}>빠른 매칭 원해요</button>
              <button className="w-full h-12 rounded-lg border font-bold" onClick={()=>router.push("/onboarding/complete")}>괜찮아요</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const val = [
    subject.length===0,
    title.trim().length===0,
    career.trim().length===0,
    !level,
    !gender,
    types.length===0,
    !meetPref,
    days.length===0,
    times.length===0,
    !(negotiable || (price && /^\d+$/.test(price)))
  ][step];

  function changeDays(next:string[]){
    if (next.includes(DAY_AGREE)) setDays([DAY_AGREE]);
    else setDays(next.filter(d=>d!==DAY_AGREE) as any);
  }
  function changeTimes(next:string[]){
    if (next.includes(TIME_AGREE)) setTimes([TIME_AGREE]);
    else setTimes(next.filter(t=>t!==TIME_AGREE) as any);
  }
  const dayDisabled = days.includes(DAY_AGREE) ? (DAYS as readonly string[]).filter(d=>d!==DAY_AGREE) : [];
  const timeDisabled = times.includes(TIME_AGREE) ? (TIMES as readonly string[]).filter(t=>t!==TIME_AGREE) : [];

  function next(){
    if (step<9) return setStep(s=>s+1);

    const preview = {
      id: "preview",
      title,
      category: subject[0] ?? null,
      createdAt: Date.now(),
      imageUrls: [],
      priceKRW: negotiable ? 0 : Number(price || 0),
      unit: negotiable ? null : (unit || "시간"),
      timeNote: times.includes(TIME_AGREE) ? "시간대 협의" : times.join(", "),
      paragraphs: [career],
      mentorTypes: types,
      meetPref,
      author: { name: "익명", age: "-", gender: "-" },
    };
    try { localStorage.setItem("postPreview", JSON.stringify(preview)); } catch {}
    router.push("/expert/post/preview");
  }
  function back(){
    if (step===0) return setPhase("ask");
    setStep(s=>s-1);
  }

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-[440px] min-h-screen bg-white">
        <OnboardingTopbar onSkip={skipAll}/>
        <div className="px-5 pb-28">
          {step===0 && <>
            <h2 className="text-[18px] font-extrabold">나누고 싶은 주제를 선택해주세요.</h2>
            <div className="mt-4"><ChipGroup options={[...SUBJECTS] as any} value={subject as any} onChange={v=>setSubject(v as any)} multiple brand={ORANGE}/></div>
          </>}
          {step===1 && <>
            <h2 className="text-[18px] font-extrabold">한 문장으로 표현해주세요.</h2>
            <input value={title} onChange={e=>setTitle(e.target.value)} className="mt-4 w-full h-12 rounded-lg border px-3" placeholder="예) 장미 가지치기 코칭합니다"/>
          </>}
          {step===2 && <>
            <h2 className="text-[18px] font-extrabold">본인의 경력 / 이력 / 자격증 등</h2>
            <textarea value={career} onChange={e=>setCareer(e.target.value)} rows={5} className="mt-4 w-full rounded-lg border px-3 py-2"/>
          </>}
          {step===3 && <>
            <h2 className="text-[18px] font-extrabold">현재 내공의 정도</h2>
            <div className="mt-4"><ChipGroup options={[...LEVELS] as any} value={level as any} onChange={v=>setLevel(v as any)} brand={ORANGE}/></div>
          </>}
          {step===4 && <>
            <h2 className="text-[18px] font-extrabold">선호하는 후배님 성별</h2>
            <div className="mt-4"><ChipGroup options={[...JUNIOR_GENDER] as any} value={gender as any} onChange={v=>setGender(v as any)} brand={ORANGE}/></div>
          </>}
          {step===5 && <>
            <h2 className="text-[18px] font-extrabold">어떤 후배님을 만나고 싶나요?</h2>
            <div className="mt-4"><ChipGroup options={[...JUNIOR_TYPES] as any} value={types as any} onChange={v=>setTypes(v as any)} multiple brand={ORANGE}/></div>
          </>}
          {step===6 && <>
            <h2 className="text-[18px] font-extrabold">활동은 어떤 방식이 좋으세요?</h2>
            <div className="mt-4"><ChipGroup options={[...MEET_PREF] as any} value={meetPref as any} onChange={v=>setMeetPref(v as any)} brand={ORANGE}/></div>
          </>}
          {step===7 && <>
            <h2 className="text-[18px] font-extrabold">가능한 요일</h2>
            <div className="mt-4"><ChipGroup options={[...DAYS] as any} value={days as any} onChange={v=>changeDays(v as any)} multiple brand={ORANGE} disabledOptions={dayDisabled as any}/></div>
          </>}
          {step===8 && <>
            <h2 className="text-[18px] font-extrabold">가능한 시간대</h2>
            <div className="mt-4"><ChipGroup options={[...TIMES] as any} value={times as any} onChange={v=>changeTimes(v as any)} multiple brand={ORANGE} disabledOptions={timeDisabled as any}/></div>
          </>}
          {step===9 && <>
            <h2 className="text-[18px] font-extrabold">수업비 하한을 입력해주세요.</h2>
            <div className="mt-4">
              <PriceInput
                value={price}
                onChange={setPrice}
                unit={unit}
                onUnitChange={setUnit}
                negotiable={negotiable}
                onToggleNegotiable={()=>setNegotiable(v=>!v)}
                brand={ORANGE}
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

/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import OnboardingTopbar from "@/components/OnboardingTopbar";
import OnboardingNav from "@/components/OnboardingNav";
import ChipGroup from "@/components/ChipGroup";
import PriceInput from "@/components/PriceInput";

const ORANGE = "#FF883F";
const DAY_AGREE = "요일 협의";
const TIME_AGREE = "시간대 협의";

const SUBJECT_HOBBY = ["식물","요리","다도","뜨개","자수","공예","인테리어"] as const;
const SUBJECT_CREATE = ["글쓰기","그림","사진","음악"] as const;
const SUBJECT_LIFE = ["건강","운동","식습관","루틴 관리","마음","수면"] as const;
const SUBJECT_CAREER = ["면접","포트폴리오","커리어 설계","직무 멘토링","자격증"] as const;
const SUBJECT_LANG = ["영어","일본어","중국어","불어","스페인어"] as const;

const LEVELS = ["고수","초고수","신"] as const;
const JUNIOR_GENDER = ["여자 후배님","남자 후배님","상관없음"] as const;
const JUNIOR_TYPES = ["의지가 강한","성장 욕구가 있는","현업을 꿈꾸는","깊이 고민하는","다양한 시도","예의바른","협력적인","피드백에 유연한","신뢰할 수 있는","적극적인","밝고 유쾌한","실행력 있는","꾸준한","수용적인","공감능력","열려있는","밝은"] as const;
const MEET_PREF = ["대면이 좋아요","비대면이 좋아요","대면/비대면 상관없어요"] as const;
const DAYS = ["월","화","수","목","금","토","일", DAY_AGREE] as const;
const TIMES = [
  "아침 (06:00 ~ 10:00)","오전 (10:00 ~ 12:00)","오후 (12:00 ~ 18:00)","저녁 (18:00 ~ 22:00)","야간 (22:00 이후)", TIME_AGREE
] as const;

type Unit = "시간" | "건당";

export default function OnboardingExpertPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<"ask"|"form">("ask");

  const [step, setStep] = useState(0);

  // ✅ 주제: 단일 선택으로 변경
  const [subject, setSubject] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [career, setCareer] = useState(""); // 경력/이력
  const [level, setLevel] = useState<typeof LEVELS[number] | null>(null);
  const [gender, setGender] = useState<typeof JUNIOR_GENDER[number] | null>(null);
  const [types, setTypes] = useState<typeof JUNIOR_TYPES[number][]>([]);
  const [meetPref, setMeetPref] = useState<typeof MEET_PREF[number] | null>(null);
  const [days, setDays] = useState<typeof DAYS[number][]>([]);
  const [times, setTimes] = useState<typeof TIMES[number][]>([]);
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState<Unit | null>(null);
  const [negotiable, setNegotiable] = useState(false);

  /** 진행 바 (0~1) */
  const [progress, setProgress] = useState(1 / 10);
  useEffect(() => {
    setProgress((step + 1) / 10);
  }, [step]);

  function skipAll(){ router.push("/onboarding/complete"); }

  if (phase === "ask") {
    return (
      <div className="w-full flex justify-center">
        <div className="w-full max-w-[440px] min-h-screen bg-white px-5 pb-28">
          <OnboardingTopbar flow="onboarding" showSkip={false} onSkip={skipAll} barColor={ORANGE} bottomGap={8}/>
          <div className="mt-4">
            <h1 className="text-[22px] font-extrabold">후배님을 찾고 계신가요?</h1>
            <div className="mt-2 text-[18px] text-neutral-600">빠른 매칭을 도와드려요.</div>
            <div className="mt-6 space-y-3">
              <button
                className="w-full h-12 rounded-lg font-bold text-white"
                style={{ backgroundColor: ORANGE }}
                onClick={() => setPhase("form")}
              >
                빠른 매칭 원해요
              </button>
              <button
                className="w-full h-12 rounded-lg border font-bold"
                onClick={() => router.push("/onboarding/complete")}
              >
                괜찮아요
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const invalid = [
    !subject,
    title.trim().length === 0,
    career.trim().length === 0,
    !level,
    !gender,
    types.length === 0,
    !meetPref,
    days.length === 0,
    times.length === 0,
    !(negotiable || (price && /^\d+$/.test(price))),
  ][step];

  function changeDays(next: string[]) {
    if (next.includes(DAY_AGREE)) setDays([DAY_AGREE]);
    else setDays(next.filter(d => d !== DAY_AGREE) as any);
  }
  function changeTimes(next: string[]) {
    if (next.includes(TIME_AGREE)) setTimes([TIME_AGREE]);
    else setTimes(next.filter(t => t !== TIME_AGREE) as any);
  }
  const dayDisabled = days.includes(DAY_AGREE) ? (DAYS as readonly string[]).filter(d => d !== DAY_AGREE) : [];
  const timeDisabled = times.includes(TIME_AGREE) ? (TIMES as readonly string[]).filter(t => t !== TIME_AGREE) : [];

  function next() {
    if (step < 9) return setStep(s => s + 1);

    // ✅ 최종 미리보기/저장용 payload (나중에 user post DB에 저장)
    const preview = {
      id: "preview",
      title,
      category: subject,                    // ← 단일 선택
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
    // TODO: 서버 저장 예시
    // await fetch("/api/posts/draft", { method: "POST", body: JSON.stringify(preview) })
    router.push("/expert/post/preview");
  }
  function back() {
    if (step === 0) return setPhase("ask");
    setStep(s => s - 1);
  }

  // 공통 섹션 렌더
  const Section = ({ title, children }: React.PropsWithChildren<{ title: string }>) => (
    <section className="mt-7">
      <h3 className="text-[18px] font-extrabold">{title}</h3>
      <div className="mt-3">{children}</div>
    </section>
  );

  // 단일 선택 핸들러: 어떤 섹션이든 하나만 활성화
  const pick = (v: string) => setSubject(v);

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-[440px] min-h-screen bg-white px-5 pb-28">
        <OnboardingTopbar
          flow="onboarding"
          progress={progress}
          showSkip
          onSkip={skipAll}
          barColor={ORANGE}  // ⬅️ 진행바도 주황
          bottomGap={8}
        />

        {/* ⬇️ Topbar와 본문 사이 간격 */}
        <div className="mt-4 pb-28">
          {step === 0 && (
            <>
              {/* 고정 헤더(질문 + 부제) */}
              <div
                className="
                  sticky top-[84px] z-30 
                  -mx-5 px-5 py-3 
                  bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80
                "
              >
                <h2 className="text-[22px] font-extrabold">
                  나누고 싶은 주제를 선택해주세요.
                </h2>
                <div className="mt-2 text-[16px] text-neutral-600">
                  바로 매칭을 도와드려요.
                </div>
              </div>


              {/* 섹션별 소제목 + 단일 선택 */}
              <Section title="취미">
                <ChipGroup
                  options={[...SUBJECT_HOBBY] as any}
                  value={subject as any}
                  onChange={(v:any) => pick(v)}
                  brand={ORANGE}
                />
              </Section>
              <Section title="창작">
                <ChipGroup
                  options={[...SUBJECT_CREATE] as any}
                  value={subject as any}
                  onChange={(v:any) => pick(v)}
                  brand={ORANGE}
                />
              </Section>
              <Section title="라이프스타일">
                <ChipGroup
                  options={[...SUBJECT_LIFE] as any}
                  value={subject as any}
                  onChange={(v:any) => pick(v)}
                  brand={ORANGE}
                />
              </Section>
              <Section title="커리어">
                <ChipGroup
                  options={[...SUBJECT_CAREER] as any}
                  value={subject as any}
                  onChange={(v:any) => pick(v)}
                  brand={ORANGE}
                />
              </Section>
              <Section title="언어">
                <ChipGroup
                  options={[...SUBJECT_LANG] as any}
                  value={subject as any}
                  onChange={(v:any) => pick(v)}
                  brand={ORANGE}
                />
              </Section>
            </>
          )}

          {step === 1 && (
            <>
              <h2 className="text-[22px] font-extrabold">나누고 싶은 내용을 한 문장으로 표현해주세요.</h2>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="mt-4 w-full h-12 rounded-lg border px-3"
                placeholder="예) 장미 가지치기 코칭합니다"
              />
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-[22px] font-extrabold">본인의 경력 / 이력 / 자격증 등을 구체적으로 설명해주세요.</h2>
              <textarea
                value={career}
                onChange={e => setCareer(e.target.value)}
                rows={5}
                className="mt-4 w-full rounded-lg border px-3 py-2"
                placeholder="예) 집에서 20종의 식물을 키운지 30년정도 됐습니다. 식물 관리 관련해서는 뭐든 도와드립니다. 편하게 연락주세요~"
              />
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="text-[22px] font-extrabold">현재 내공의 정도를 선택해주세요.</h2>
              <div className="mt-2 text-[16px] text-neutral-600">후배 매칭 시에 참고할게요.</div>
              <div className="mt-4">
                <ChipGroup options={[...LEVELS] as any} value={level as any} onChange={(v:any)=>setLevel(v)} brand={ORANGE}/>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <h2 className="text-[22px] font-extrabold">선호하는 후배님 성별이 있으신가요?</h2>
              <div className="mt-2 text-[16px] text-neutral-600">후배 매칭 시에 참고할게요.</div>
              <div className="mt-4">
                <ChipGroup options={[...JUNIOR_GENDER] as any} value={gender as any} onChange={(v:any)=>setGender(v)} brand={ORANGE}/>
              </div>
            </>
          )}

          {step === 5 && (
            <>
              <h2 className="text-[22px] font-extrabold">어떤 후배님을 만나고 싶으신가요?</h2>
              <div className="mt-2 text-[16px] text-neutral-600">후배 매칭 시에 참고할게요.</div>
              <div className="mt-4">
                <ChipGroup options={[...JUNIOR_TYPES] as any} value={types as any} onChange={(v:any)=>setTypes(v)} multiple brand={ORANGE}/>
              </div>
            </>
          )}

          {step === 6 && (
            <>
              <h2 className="text-[22px] font-extrabold">활동은 어떤 방식이 좋으세요?</h2>
              <div className="mt-2 text-[16px] text-neutral-600">후배 매칭 시에 참고할게요.</div>
              <div className="mt-4">
                <ChipGroup options={[...MEET_PREF] as any} value={meetPref as any} onChange={(v:any)=>setMeetPref(v)} brand={ORANGE}/>
              </div>
            </>
          )}

          {step === 7 && (
            <>
              <h2 className="text-[22px] font-extrabold">가능한 요일·시간대를 알려주세요.</h2>
              <div className="mt-2 text-[16px] text-neutral-600">후배 매칭 시에 참고할게요.</div>
              <div className="mt-4">
                <ChipGroup options={[...DAYS] as any} value={days as any} onChange={(v:any)=>changeDays(v)} multiple brand={ORANGE} disabledOptions={dayDisabled as any}/>
              </div>
            </>
          )}

          {step === 8 && (
            <>
              <h2 className="text-[22px] font-extrabold">가능한 요일·시간대를 알려주세요.</h2>
              <div className="mt-2 text-[16px] text-neutral-600">후배 매칭 시에 참고할게요.</div>
              <div className="mt-4">
                <ChipGroup options={[...TIMES] as any} value={times as any} onChange={(v:any)=>changeTimes(v)} multiple brand={ORANGE} disabledOptions={timeDisabled as any}/>
              </div>
            </>
          )}

          {step === 9 && (
            <>
              <h2 className="text-[22px] font-extrabold">수업비 하한을 입력해주세요.</h2>
              <div className="mt-2 text-[16px] text-neutral-600">후배 매칭 시에 참고할게요.</div>
              <div className="mt-4">
                <PriceInput
                  value={price}
                  onChange={setPrice}
                  unit={unit}
                  onUnitChange={setUnit}
                  negotiable={negotiable}
                  onToggleNegotiable={() => setNegotiable(v => !v)}
                  brand={ORANGE}
                />
              </div>
            </>
          )}
        </div>

        <OnboardingNav
          onBack={back}
          onNext={next}
          isNextDisabled={!!invalid}
          isFirstStep={false}
          nextLabel={step < 9 ? "다음" : "완료"}
          brandColor="#FF883F"   // ← 주황
        />
      </div>
    </div>
  );
}

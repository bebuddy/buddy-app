// app/(onboarding)/onboarding/junior/page.tsx
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import OnboardingTopbar from "@/components/OnboardingTopbar";
import OnboardingNav from "@/components/OnboardingNav";
import ChipGroup from "@/components/ChipGroup";
import PriceInput from "@/components/PriceInput";

const BRAND = "#6163FF";              // 주니어: 보라색
const DAY_AGREE = "요일 협의";
const TIME_AGREE = "시간대 협의";

// 주니어 선택지
const SUBJECT_HOBBY = ["식물","요리","다도","뜨개","자수","공예","인테리어"] as const;
const SUBJECT_CREATE = ["글쓰기","그림","사진","음악"] as const;
const SUBJECT_LIFE = ["건강","운동","식습관","루틴 관리","마음","수면"] as const;
const SUBJECT_CAREER = ["면접","포트폴리오","커리어 설계","직무 멘토링","자격증"] as const;
const SUBJECT_LANG = ["영어","일본어","중국어","불어","스페인어"] as const;

const LEVELS = ["입문","초보","심화"] as const;
const MENTOR_GENDER = ["남자 선배님","여자 선배님","성별 무관"] as const;
const MENTOR_TYPES = ["실무 경험 풍부한","전문 지식","현업인","문제 해결","다방면에 능통한","친절한","배려심 깊은","솔직한","믿음직한","열정적인","유머러스한","현실적인","차분한","꼼꼼한 피드백","든든한 조력자","인생 선배","롤모델","치어리더"] as const;
const MEET_PREF = ["대면이 좋아요","비대면이 좋아요","대면/비대면 상관없어요"] as const;
const DAYS = ["월","화","수","목","금","토","일", DAY_AGREE] as const;
const TIMES = [
  "아침 (06:00 ~ 10:00)","오전 (10:00 ~ 12:00)","오후 (12:00 ~ 18:00)","저녁 (18:00 ~ 22:00)","야간 (22:00 이후)", TIME_AGREE
] as const;

type Unit = "시간" | "건당";

export default function OnboardingJuniorPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<"ask"|"form">("ask");

  // 폼 상태
  const [step, setStep] = useState(0);
  // ✅ 주제: 단일 선택으로 변경
  const [subject, setSubject] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [goal, setGoal] = useState("");
  const [level, setLevel] = useState<typeof LEVELS[number] | null>(null);
  const [mentorGender, setMentorGender] = useState<typeof MENTOR_GENDER[number] | null>(null);
  const [mentorTypes, setMentorTypes] = useState<typeof MENTOR_TYPES[number][]>([]);
  const [meetPref, setMeetPref] = useState<typeof MEET_PREF[number] | null>(null);
  const [days, setDays] = useState<typeof DAYS[number][]>([]);
  const [times, setTimes] = useState<typeof TIMES[number][]>([]);
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState<Unit | null>(null);
  const [negotiable, setNegotiable] = useState(false);

  /** 진행 바 (0~1) - 전문가 페이지와 동일한 구성 */
  const [progress, setProgress] = useState(1 / 11);
  useEffect(() => {
    setProgress((step + 1) / 11);
  }, [step]);

  const skipAll = () => router.push("/onboarding/complete");

  // 첫 스크린(ask)
  if (phase === "ask") {
    return (
      <div className="w-full flex justify-center">
        <div className="w-full max-w-[768px] min-h-screen bg-white px-5 pb-28">
          <OnboardingTopbar flow="onboarding" showSkip onSkip={skipAll} barColor={BRAND} bottomGap={8}/>
          <div className="mt-4">
            <h1 className="text-[22px] font-extrabold">선배님을 찾고 계신가요?</h1>
            <div className="mt-2 text-[18px] text-neutral-600">바로 매칭을 도와드려요.</div>
            <div className="mt-6 space-y-3">
              <button
                className="w-full h-12 rounded-lg font-bold text-white"
                style={{ backgroundColor: BRAND }}
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

  // 유효성 (전문가 페이지 구성과 동일)
  const invalid = [
    !subject,
    title.trim().length === 0,
    goal.trim().length === 0,
    !level,
    !mentorGender,
    mentorTypes.length === 0,
    !meetPref,
    days.length === 0,
    times.length === 0,
    !(negotiable || (price && /^\d+$/.test(price))),
  ][step];

  // 협의 옵션 로직
  function changeDays(next: string[]) {
    if (next.includes(DAY_AGREE)) setDays([DAY_AGREE]);
    else setDays(next.filter((d) => d !== DAY_AGREE) as typeof DAYS[number][]);
  }
  function changeTimes(next: string[]) {
    if (next.includes(TIME_AGREE)) setTimes([TIME_AGREE]);
    else setTimes(next.filter((t) => t !== TIME_AGREE) as typeof TIMES[number][]);
  }
  const dayDisabled = days.includes(DAY_AGREE)
    ? (DAYS as readonly string[]).filter((d) => d !== DAY_AGREE)
    : [];
  const timeDisabled = times.includes(TIME_AGREE)
    ? (TIMES as readonly string[]).filter((t) => t !== TIME_AGREE)
    : [];

  function next() {
    if (step < 9) return setStep((s) => s + 1);

    // 저장 payload (DB 연동 고려)
    const preview = {
      id: "preview",
      title,
      category: subject,    
      createdAt: Date.now(),
      imageUrls: [],
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
    if (step === 0) return setPhase("ask");
    setStep((s) => s - 1);
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
      <div className="w-full max-w-[768px] min-h-screen bg-white px-5 pb-28">
        <OnboardingTopbar
          flow="onboarding"
          progress={progress}
          showSkip
          onSkip={skipAll}
          barColor={BRAND}        // 보라 진행바
          bottomGap={8}
        />
        {/* Topbar와 본문 간격 (전문가 페이지와 동일) */}
        <div className="mt-4 pb-28">
        {step === 0 && (
            <>
              <div
                className="
                  sticky top-[84px] z-30 
                  -mx-5 px-5 py-3 
                  bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80
                "
              >
                <h2 className="text-[22px] font-extrabold">
                  배우고 싶은 주제를 선택해주세요.
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
                  brand={BRAND}
                />
              </Section>
              <Section title="창작">
                <ChipGroup
                  options={[...SUBJECT_CREATE] as any}
                  value={subject as any}
                  onChange={(v:any) => pick(v)}
                  brand={BRAND}
                />
              </Section>
              <Section title="라이프스타일">
                <ChipGroup
                  options={[...SUBJECT_LIFE] as any}
                  value={subject as any}
                  onChange={(v:any) => pick(v)}
                  brand={BRAND}
                />
              </Section>
              <Section title="커리어">
                <ChipGroup
                  options={[...SUBJECT_CAREER] as any}
                  value={subject as any}
                  onChange={(v:any) => pick(v)}
                  brand={BRAND}
                />
              </Section>
              <Section title="언어">
                <ChipGroup
                  options={[...SUBJECT_LANG] as any}
                  value={subject as any}
                  onChange={(v:any) => pick(v)}
                  brand={BRAND}
                />
              </Section>
            </>
          )}

          {step === 1 && (
            <>
              <h2 className="text-[22px] font-extrabold">배우고 싶은 내용을 한 문장으로 표현해주세요.</h2>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예) 장미 가지치기 배우고 싶어요"
                className="mt-4 w-full h-12 rounded-lg border px-3"
              />
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-[22px] font-extrabold">수업을 통해 달성하고 싶은 목표, 선생님께 바라는 점 등을 알려주세요.</h2>
              <textarea
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                rows={5}
                placeholder="예) 단독주택 장미 가지치기를 예쁘게 하고 싶은데 매번 어려워요. 경험 많은 선배님께 코칭 받고 싶어요."
                className="mt-4 w-full rounded-lg border px-3 py-2"
              />
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="text-[22px] font-extrabold">현재 배움의 정도를 선택해주세요.</h2>
              <div className="mt-2 text-[16px] text-neutral-600">후배 매칭 시에 참고할게요.</div>
              <div className="mt-4">
                <ChipGroup
                  options={[...LEVELS] as any}
                  value={level as any}
                  onChange={(v) => setLevel(v as any)}
                  brand={BRAND}
                />
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <h2 className="text-[22px] font-extrabold">선호하는 선배님 성별이 있으신가요?</h2>
              <div className="mt-2 text-[16px] text-neutral-600">후배 매칭 시에 참고할게요.</div>
              <div className="mt-4">
                <ChipGroup
                  options={[...MENTOR_GENDER] as any}
                  value={mentorGender as any}
                  onChange={(v) => setMentorGender(v as any)}
                  brand={BRAND}
                />
              </div>
            </>
          )}

          {step === 5 && (
            <>
              <h2 className="text-[22px] font-extrabold">어떤 선배님을 만나고 싶나요?</h2>
              <div className="mt-2 text-[16px] text-neutral-600">후배 매칭 시에 참고할게요.</div>
              <div className="mt-4">
                <ChipGroup
                  options={[...MENTOR_TYPES] as any}
                  value={mentorTypes as any}
                  onChange={(v) => setMentorTypes(v as any)}
                  multiple
                  brand={BRAND}
                />
              </div>
            </>
          )}

          {step === 6 && (
            <>
              <h2 className="text-[22px] font-extrabold">활동은 어떤 방식이 좋으세요?</h2>
              <div className="mt-2 text-[16px] text-neutral-600">후배 매칭 시에 참고할게요.</div>
              <div className="mt-4">
                <ChipGroup
                  options={[...MEET_PREF] as any}
                  value={meetPref as any}
                  onChange={(v) => setMeetPref(v as any)}
                  brand={BRAND}
                />
              </div>
            </>
          )}

          {step === 7 && (
            <>
              <h2 className="text-[22px] font-extrabold">가능한 요일·시간대를 알려주세요.</h2>
              <div className="mt-2 text-[16px] text-neutral-600">후배 매칭 시에 참고할게요.</div>
              <div className="mt-4">
                <ChipGroup
                  options={[...DAYS] as any}
                  value={days as any}
                  onChange={(v) => changeDays(v as any)}
                  multiple
                  brand={BRAND}
                  disabledOptions={dayDisabled as any}
                />
              </div>
            </>
          )}

          {step === 8 && (
            <>
              <h2 className="text-[22px] font-extrabold">가능한 요일·시간대를 알려주세요.</h2>
              <div className="mt-2 text-[16px] text-neutral-600">후배 매칭 시에 참고할게요.</div>
              <div className="mt-4">
                <ChipGroup
                  options={[...TIMES] as any}
                  value={times as any}
                  onChange={(v) => changeTimes(v as any)}
                  multiple
                  brand={BRAND}
                  disabledOptions={timeDisabled as any}
                />
              </div>
            </>
          )}

          {step === 9 && (
            <>
              <h2 className="text-[22px] font-extrabold">수업비 한도를 입력해주세요.</h2>
              <div className="mt-2 text-[16px] text-neutral-600">후배 매칭 시에 참고할게요.</div>
              <div className="mt-4">
                <PriceInput
                  value={price}
                  onChange={setPrice}
                  unit={unit}
                  onUnitChange={setUnit}
                  negotiable={negotiable}
                  onToggleNegotiable={() => setNegotiable((v) => !v)}
                  brand={BRAND}
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
          brandColor={BRAND}   // 보라색 버튼
        />
      </div>
    </div>
  );
}

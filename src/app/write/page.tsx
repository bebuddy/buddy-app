// src/app/write/page.tsx
"use client";

import { useMemo, useState } from "react";
import RegisterActionBar from "@/components/RegisterActionBar";
import Disclosure from "@/components/Disclosure";
import LabeledInput from "@/components/LabeledInput";
import LabeledTextarea from "@/components/LabeledTextarea";
import ChipGroup from "@/components/ChipGroup";
import PriceInput from "@/components/PriceInput";
import PhotoUpload from "@/components/PhotoUpload";

const BRAND = "#6163FF"; // ✅ 글쓰기 화면 색상

const LEVELS = ["입문", "초보", "심화"] as const;
const MENTOR_GENDER = ["남자 선배님", "여자 선배님", "상관없음"] as const;

const MENTOR_TYPES = [
  "실무 경험 풍부한", "전문 지식", "협업인", "문제 해결", "다방면에 능통한", "친절한",
  "배려심 깊은", "솔직한", "믿음직한", "열정적인", "유머러스한", "현실적인",
  "차분한", "꼼꼼한 피드백", "든든한 조력자", "인생 선배", "롤모델", "치어리더",
] as const;

const MEET_PREF = ["대면이 좋아요", "비대면이 좋아요", "상관없어요"] as const;
const DAYS = ["월","화","수","목","금","토","일"] as const;
const TIMES = [
  "아침 (06:00 ~ 10:00)",
  "오전 (10:00 ~ 12:00)",
  "오후 (12:00 ~ 18:00)",
  "저녁 (18:00 ~ 22:00)",
  "야간 (22:00 이후)",
  "시간대 협의",
] as const;

type Unit = "시간" | "건당";

export default function WritePage() {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");

  const [level, setLevel] = useState<(typeof LEVELS)[number] | null>(null);
  const [mentorGender, setMentorGender] = useState<(typeof MENTOR_GENDER)[number] | null>(null);
  const [mentorTypes, setMentorTypes] = useState<(typeof MENTOR_TYPES)[number][]>([]);
  const [meetPref, setMeetPref] = useState<(typeof MEET_PREF)[number] | null>(null);
  const [days, setDays] = useState<(typeof DAYS)[number][]>([]);
  const [times, setTimes] = useState<(typeof TIMES)[number][]>([]);

  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState<Unit | null>(null);
  const [negotiable, setNegotiable] = useState(false);

  const isValid = useMemo(() => {
    const hasTitle = title.trim().length > 0;
    const hasDesc = desc.trim().length > 0;
    const hasMeet = !!meetPref;
    const hasPrice = negotiable || (price.trim().length > 0 && /^\d+$/.test(price));
    return hasTitle && hasDesc && hasMeet && hasPrice;
  }, [title, desc, meetPref, price, negotiable]);

  function handleSubmit() {
    if (!isValid) return;
    alert(`글 등록 완료! (데모)
희망 단가: ${price ? `${price}원` : "미입력"}${unit ? ` / ${unit}` : ""}`);
  }

  return (
    <div className="px-4" style={{ paddingBottom: "calc(16px + env(safe-area-inset-bottom))" }}>
      <RegisterActionBar isValid={isValid} onSubmit={handleSubmit} brand={BRAND} />

      {/* 주제 선택(접이식) */}
      <Disclosure title="배우고 싶은 주제를 선택해주세요.">
        <div className="text-[15px] text-neutral-600">(주제 목록은 추후 연결)</div>
      </Disclosure>

      <div className="h-5" />

      {/* 한 줄 목표 */}
      <LabeledInput
        label="배우고 싶은 내용을 한 문장으로 표현해주세요!"
        largeLabel
        value={title}
        onChange={setTitle}
        placeholder="예) 스트레칭 루틴을 익히고 싶어요"
      />

      <div className="h-5" />

      {/* 상세 희망사항 */}
      <LabeledTextarea
        label="수업을 통해 달성하고 싶은 목표, 선배님께 바라는 점 등을 입력해주세요."
        value={desc}
        onChange={setDesc}
        placeholder="예) 허리 통증 완화, 주 2회 대면 수업 등"
        rows={4}
      />

      <div className="my-6 border-t border-neutral-200" />

      {/* 현재 배움 정도(단일) */}
      <div className="flex flex-col gap-3 mt-7">
        <div className="text-[18px] font-extrabold text-neutral-900">
          후배님의 현재 배움의 정도를 선택해주세요.
        </div>
        <ChipGroup
          options={LEVELS as unknown as string[]}
          value={level}
          onChange={(v) => setLevel(v as typeof level)}
          multiple={false}
          brand={BRAND}
        />
      </div>

      {/* 선호 선배 성별(단일) */}
      <div className="flex flex-col gap-3 mt-7">
        <div className="text-[18px] font-extrabold text-neutral-900">
          선호하는 선배님 성별이 있으신가요?
        </div>
        <ChipGroup
          options={MENTOR_GENDER as unknown as string[]}
          value={mentorGender}
          onChange={(v) => setMentorGender(v as typeof mentorGender)}
          multiple={false}
          brand={BRAND}
        />
      </div>

      {/* 원하는 선배 유형(다중) */}
      <div className="flex flex-col gap-3 mt-7">
        <div className="text-[18px] font-extrabold text-neutral-900">
          어떤 선배님을 만나고 싶으신가요?
        </div>
        <ChipGroup
          options={MENTOR_TYPES as unknown as string[]}
          value={mentorTypes}
          onChange={(v) => setMentorTypes(v as typeof mentorTypes)}
          multiple
          brand={BRAND}
        />
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
          brand={BRAND}
        />
      </div>

      {/* 가능한 요일/시간대(다중) */}
      <div className="flex flex-col gap-3 mt-7">
        <div className="text-[18px] font-extrabold text-neutral-900">
          가능한 요일 · 시간대를 알려주세요.
        </div>
        <ChipGroup
          options={DAYS as unknown as string[]}
          value={days}
          onChange={(v) => setDays(v as typeof days)}
          multiple
          brand={BRAND}
        />
        <ChipGroup
          options={TIMES as unknown as string[]}
          value={times}
          onChange={(v) => setTimes(v as typeof times)}
          multiple
          brand={BRAND}
        />
      </div>

      {/* 희망 과외비 */}
      <div className="flex flex-col gap-3 mt-7">
        <div className="text-[18px] font-extrabold text-neutral-900">
          과외비 한도를 입력해주세요.
        </div>
        <PriceInput
          value={price}
          onChange={setPrice}
          unit={unit}
          onUnitChange={setUnit}
          negotiable={negotiable}
          onToggleNegotiable={() => setNegotiable(v => !v)}
          brand={BRAND}
        />
      </div>

      <div className="mt-7">
        <PhotoUpload brand={BRAND} />
      </div>

      <div className="h-8" />
    </div>
  );
}

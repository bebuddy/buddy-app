"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import RegisterActionBar from "@/components/RegisterActionBar";
import Disclosure from "@/components/Disclosure";
import LabeledInput from "@/components/LabeledInput";
import LabeledTextarea from "@/components/LabeledTextarea";
import ChipGroup from "@/components/ChipGroup";
import PriceInput from "@/components/PriceInput";
import PhotoUpload from "@/components/PhotoUpload";
// import { savePost } from "@/lib/clientRepo"; // ⚠️ 미사용: 제거
import { createPost } from "@/actions/createPost";

const BRAND = "#6163FF";

const LEVELS = ["입문", "초보", "심화"] as const;
const MENTOR_GENDER = ["남자 선배님", "여자 선배님", "상관없음"] as const;
const MENTOR_TYPES = [
  "실무 경험 풍부한","전문 지식","협업인","문제 해결","다방면에 능통한","친절한",
  "배려심 깊은","솔직한","믿음직한","열정적인","유머러스한","현실적인",
  "차분한","꼼꼼한 피드백","든든한 조력자","인생 선배","롤모델","치어리더",
] as const;
const MEET_PREF = ["대면이 좋아요","비대면이 좋아요","상관없어요"] as const;
const DAYS = ["월","화","수","목","금","토","일","요일 협의"] as const;
const TIMES = [
  "아침 (06:00 ~ 10:00)","오전 (10:00 ~ 12:00)","오후 (12:00 ~ 18:00)",
  "저녁 (18:00 ~ 22:00)","야간 (22:00 이후)","시간대 협의",
] as const;

// ✅ '협의' 상수 타입을 해당 유니온으로 지정해 any 캐스트 제거
const DAY_ANY: (typeof DAYS)[number] = "요일 협의";
const TIME_ANY: (typeof TIMES)[number] = "시간대 협의";

type Unit = "시간" | "건당";

async function filesToDataUrls(files: File[]): Promise<string[]> {
  const reads = files.map(
    (f) =>
      new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result));
        r.onerror = reject;
        r.readAsDataURL(f);
      })
  );
  return Promise.all(reads);
}

export default function WritePage() {
  const router = useRouter();

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
  const [photos, setPhotos] = useState<File[]>([]);

  const isValid = useMemo(() => {
    const hasTitle = title.trim().length > 0;
    const hasDesc = desc.trim().length > 0;
    const hasMeet = !!meetPref;
    const hasPrice = negotiable || (price.trim().length > 0 && /^\d+$/.test(price));
    return hasTitle && hasDesc && hasMeet && hasPrice;
  }, [title, desc, meetPref, price, negotiable]);

  // 🔹 협의 선택 로직 (disabled 목록은 string[])
  const dayDisabled = days.includes(DAY_ANY)
    ? (DAYS.filter((d) => d !== DAY_ANY) as string[])
    : ([] as string[]);
  const timeDisabled = times.includes(TIME_ANY)
    ? (TIMES.filter((t) => t !== TIME_ANY) as string[])
    : ([] as string[]);

  // ✅ any 캐스트 제거: 런타임 가드로 타입 좁히기
  function handleDaysChange(next: string[] | string | null) {
    const arr = Array.isArray(next) ? next : [];
    if (arr.includes(DAY_ANY)) {
      setDays([DAY_ANY]);
    } else {
      const valid = arr.filter(
        (d): d is (typeof DAYS)[number] => (DAYS as readonly string[]).includes(d)
      );
      setDays(valid);
    }
  }

  function handleTimesChange(next: string[] | string | null) {
    const arr = Array.isArray(next) ? next : [];
    if (arr.includes(TIME_ANY)) {
      setTimes([TIME_ANY]);
    } else {
      const valid = arr.filter(
        (t): t is (typeof TIMES)[number] => (TIMES as readonly string[]).includes(t)
      );
      setTimes(valid);
    }
  }

  async function handleSubmit() {
    if (!isValid) return;

    try {
      const imageUrls = await filesToDataUrls(photos);

      // 💡 서버 액션(createPost)으로 보낼 데이터를 DB 스키마에 맞게 구성
      const postData = {
        title: title,
        content: desc,
        category: "식물",
        level: level,
        senior_type: mentorTypes,
        class_type: meetPref,
        days: days,
        times: times,
        budget: price ? Number(price) : 0,
        budget_type: unit,
        senior_gender: mentorGender,
        imageUrls: imageUrls,
      };

      const result = await createPost(postData);

      if (result.success && result.id) {
        router.push(`/post/${result.id}`);
      } else {
        console.error("게시물 등록 실패:", result.error);
        alert(`게시물 등록에 실패했습니다: ${result.error}`);
      }
    } catch (error) {
      console.error("처리 중 예외 발생:", error);
      alert("게시물을 등록하는 중 오류가 발생했습니다.");
    }
  }

  return (
    <div className="px-4" style={{ paddingBottom: "calc(16px + env(safe-area-inset-bottom))" }}>
      <RegisterActionBar isValid={isValid} onSubmit={handleSubmit} brand={BRAND} />

      {/* 주제 선택(접이식) */}
      <Disclosure title="배우고 싶은 주제를 선택해주세요.">
        <div className="text-[15px] text-neutral-600">(주제 목록은 추후 연결)</div>
      </Disclosure>

      <div className="h-5" />

      <LabeledInput
        label="배우고 싶은 내용을 한 문장으로 표현해주세요!"
        largeLabel
        value={title}
        onChange={setTitle}
        placeholder="예) 스트레칭 루틴을 익히고 싶어요"
      />

      <div className="h-5" />

      <LabeledTextarea
        label="수업을 통해 달성하고 싶은 목표, 선배님께 바라는 점 등을 입력해주세요."
        value={desc}
        onChange={setDesc}
        placeholder="예) 허리 통증 완화, 주 2회 대면 수업 등"
        rows={4}
      />

      <div className="my-6 border-t border-neutral-200" />

      {/* 배움 정도 */}
      <div className="flex flex-col gap-3 mt-7">
        <div className="text-[18px] font-extrabold text-neutral-900">후배님의 현재 배움의 정도</div>
        <ChipGroup
          options={[...LEVELS]}          // readonly → string[] 로 안전 변환
          value={level}
          onChange={(v) => setLevel(v as (typeof LEVELS)[number] | null)}
          multiple={false}
          brand={BRAND}
        />
      </div>

      {/* 선호 선배 성별 */}
      <div className="flex flex-col gap-3 mt-7">
        <div className="text-[18px] font-extrabold text-neutral-900">선호하는 선배님 성별</div>
        <ChipGroup
          options={[...MENTOR_GENDER]}
          value={mentorGender}
          onChange={(v) => setMentorGender(v as (typeof MENTOR_GENDER)[number] | null)}
          multiple={false}
          brand={BRAND}
        />
      </div>

      {/* 원하는 선배 유형 */}
      <div className="flex flex-col gap-3 mt-7">
        <div className="text-[18px] font-extrabold text-neutral-900">어떤 선배님을 원하세요?</div>
        <ChipGroup
          options={[...MENTOR_TYPES]}
          value={mentorTypes}
          onChange={(v) => setMentorTypes((v ?? []) as (typeof MENTOR_TYPES)[number][])}
          multiple
          brand={BRAND}
        />
      </div>

      {/* 활동 방식 */}
      <div className="flex flex-col gap-3 mt-7">
        <div className="text-[18px] font-extrabold text-neutral-900">활동 방식</div>
        <ChipGroup
          options={[...MEET_PREF]}
          value={meetPref}
          onChange={(v) => setMeetPref(v as (typeof MEET_PREF)[number] | null)}
          multiple={false}
          brand={BRAND}
        />
      </div>

      {/* 요일/시간대 */}
      <div className="flex flex-col gap-3 mt-7">
        <div className="text-[18px] font-extrabold text-neutral-900">가능한 요일 · 시간대</div>

        {/* 🔹 요일: '요일 협의'를 누르면 나머지 비활성화 */}
        <ChipGroup
          options={[...DAYS]}
          value={days}
          onChange={handleDaysChange}
          multiple
          brand={BRAND}
          disabledOptions={dayDisabled}
        />

        {/* 🔹 시간대: '시간대 협의'를 누르면 나머지 비활성화 */}
        <ChipGroup
          options={[...TIMES]}
          value={times}
          onChange={handleTimesChange}
          multiple
          brand={BRAND}
          disabledOptions={timeDisabled}
        />
      </div>

      {/* 과외비 */}
      <div className="flex flex-col gap-3 mt-7">
        <div className="text-[18px] font-extrabold text-neutral-900">과외비 한도</div>
        <PriceInput
          value={price}
          onChange={setPrice}
          unit={unit}
          onUnitChange={setUnit}
          negotiable={negotiable}
          onToggleNegotiable={() =>
            setNegotiable((prev) => {
              const next = !prev;
              if (next) { setPrice(""); setUnit(null); }
              return next;
            })
          }
          brand={BRAND}
        />
      </div>

      {/* 사진 등록 */}
      <div className="mt-7">
        <PhotoUpload brand={BRAND} onFilesChange={setPhotos} />
      </div>

      <div className="h-8" />
    </div>
  );
}

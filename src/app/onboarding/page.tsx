"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Search } from "lucide-react";
// 경로 별칭(@/) 대신 상대 경로를 사용합니다.
import OnboardingNav from "../../components/OnboardingNav";
import SelectionCard from "../../components/SelectionCard";
import OnboardingComplete from "../../components/OnboardingComplete";

// 대한민국 행정동 데이터 (샘플)
// 실제 서비스에서는 전체 데이터를 API로 가져오거나 별도 파일로 관리해야 합니다.
const KOREAN_DONGS = [
  "개포동", "논현동", "대치동", "도곡동", "삼성동", "세곡동", "수서동", "신사동",
  "압구정동", "역삼동", "율현동", "일원동", "자곡동", "청담동", "포이동",
  "가락동", "거여동", "마천동", "문정동", "방이동", "삼전동", "석촌동", "송파동",
  "오금동", "잠실동", "장지동", "풍납동",
];

type Role = "후배" | "선배";
interface FormData {
  location: string;
  age: string;
  gender: "남자" | "여자" | null;
  role: Role | null;
  wantsMatching: boolean | null;
}

const TOTAL_STEPS = 5;

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    location: "",
    age: "",
    gender: null,
    role: null,
    wantsMatching: null,
  });

  // 동 검색 기능 상태
  const [locationSearch, setLocationSearch] = useState("");
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);

  const filteredDongs = useMemo(() => {
    if (!locationSearch) return [];
    return KOREAN_DONGS.filter((dong) => dong.includes(locationSearch));
  }, [locationSearch]);

  const handleNext = () =>
    setStep((prev) => (prev < TOTAL_STEPS + 1 ? prev + 1 : prev));
  const handleBack = () => setStep((prev) => (prev > 1 ? prev - 1 : prev));

  // ✅ any 제거: 제네릭으로 키-값 타입 안전하게
  function updateFormData<K extends keyof FormData>(field: K, value: FormData[K]) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  const isNextDisabled = () => {
    switch (step) {
      case 1:
        return !KOREAN_DONGS.includes(formData.location); // 실제 동 목록에 있는지 확인
      case 2:
        return formData.age.trim() === "" || !/^\d+$/.test(formData.age);
      case 3:
        return formData.gender === null;
      case 4:
        return formData.role === null;
      case 5:
        return formData.wantsMatching === null;
      default:
        return false;
    }
  };

  if (step > TOTAL_STEPS) return <OnboardingComplete />;

  const progressPercentage = (step / TOTAL_STEPS) * 100;

  return (
    <div className="w-full flex justify-center bg-white">
      <div className="w-full max-w-[420px] min-h-screen flex flex-col">
        {/* 상단 로고 (가운데 정렬 + 축소) */}
        <header className="h-16 flex items-center justify-center px-6">
          <Image src="/logo.svg" alt="Buddy Logo" width={40} height={10} priority />
        </header>

        {/* 진행률 바 */}
        <div className="w-full h-1 bg-neutral-200">
          <div
            className="h-full brand-bg transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        <main className="flex-1 p-6">
          <div className="mt-8">
            {/* Step 1: Location */}
            {step === 1 && (
              <div>
                <h1 className="text-2xl font-extrabold">거주하시는 지역은 어디인가요?</h1>
                <div className="relative mt-6">
                  <input
                    type="text"
                    placeholder="읍/면/동으로 검색"
                    value={locationSearch}
                    onChange={(e) => {
                      setLocationSearch(e.target.value);
                      setShowLocationDropdown(true);
                      updateFormData("location", ""); // 검색 중에는 선택된 값 초기화
                    }}
                    onFocus={() => setShowLocationDropdown(true)}
                    onBlur={() => setTimeout(() => setShowLocationDropdown(false), 150)} // 포커스 잃을 때 드롭다운 숨김
                    className="w-full h-14 pl-5 pr-12 rounded-lg border-2 border-neutral-200 focus:border-[var(--brand)] outline-none"
                  />
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-neutral-400" />
                  {showLocationDropdown && filteredDongs.length > 0 && (
                    <ul className="absolute z-10 w-full mt-2 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {filteredDongs.map((dong) => (
                        <li
                          key={dong}
                          onMouseDown={() => {
                            // onClick 대신 onMouseDown 사용 (blur 전에 선택)
                            updateFormData("location", dong);
                            setLocationSearch(dong);
                            setShowLocationDropdown(false);
                          }}
                          className="px-4 py-2 hover:bg-neutral-100 cursor-pointer"
                        >
                          {dong}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Age */}
            {step === 2 && (
            <div>
                <h1 className="text-2xl font-extrabold">연령을 알려주세요.</h1>
                <div className="relative mt-6 flex items-center gap-2">
                <input
                    // 🔒 number 대신 text + inputMode 로 강제
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete="off"
                    placeholder="00"
                    value={formData.age}
                    onChange={(e) => {
                    // 붙여넣기/드래그 등 모든 경로를 정규식으로 정리
                    const onlyDigits = e.target.value.replace(/\D+/g, "");
                    updateFormData("age", onlyDigits);
                    }}
                    // 키 입력 자체를 미리 차단 (e/E/+/-/./, 포함)
                    onBeforeInput={(e) => {
                    // React는 e.nativeEvent에 InputEvent가 들어있음
                    const ne = e.nativeEvent as InputEvent;
                    const data = ne.data ?? "";
                    // composition(한글 조합) 중이면 그대로 두고, 데이터가 있고 숫자가 아니면 차단
                    if (ne.isComposing) return;
                    if (data && /\D/.test(data)) e.preventDefault();
                    }}
                    onPaste={(e) => {
                    const text = e.clipboardData.getData("text");
                    if (/\D/.test(text)) {
                        e.preventDefault();
                        // 숫자만 뽑아서 붙여넣기 적용
                        const onlyDigits = text.replace(/\D+/g, "");
                        const next = (formData.age + onlyDigits).slice(0, 3); // 필요시 길이 제한
                        updateFormData("age", next);
                    }
                    }}
                    // 선택: 길이 제한(예: 3자리까지)
                    maxLength={3}
                    className="w-24 h-14 px-5 rounded-lg border-2 border-neutral-200 focus:border-[var(--brand)] outline-none text-center text-lg"
                />
                <span className="text-lg font-bold">세</span>
                </div>
            </div>
            )}

            {/* Step 3: Gender */}
            {step === 3 && (
              <div>
                <h1 className="text-2xl font-extrabold">성별을 선택해주세요.</h1>
                <div className="mt-6 space-y-3">
                  <SelectionCard
                    label="남자"
                    isSelected={formData.gender === "남자"}
                    onClick={() => updateFormData("gender", "남자")}
                  />
                  <SelectionCard
                    label="여자"
                    isSelected={formData.gender === "여자"}
                    onClick={() => updateFormData("gender", "여자")}
                  />
                </div>
              </div>
            )}

            {/* Step 4: Role */}
            {step === 4 && (
              <div>
                <h1 className="text-2xl font-extrabold">어떤 유형으로 가입하시겠어요?</h1>
                <p className="mt-1 text-neutral-600">가입하실 유형을 선택해주세요.</p>
                <div className="mt-6 space-y-3">
                  <SelectionCard
                    label="후배"
                    description="선배님을 찾고 있어요"
                    isSelected={formData.role === "후배"}
                    onClick={() => updateFormData("role", "후배")}
                    bgColor="bg-[#6163FF]/[0.06]"
                    selectedColor="bg-[#6163FF]"
                  />
                  <SelectionCard
                    label="선배"
                    description="후배님을 찾고 있어요"
                    isSelected={formData.role === "선배"}
                    onClick={() => updateFormData("role", "선배")}
                    bgColor="bg-[#FF883F]/[0.06]"
                    selectedColor="bg-[#FF883F]"
                  />
                </div>
              </div>
            )}

            {/* Step 5: Matching */}
            {step === 5 && (
              <div>
                <h1 className="text-2xl font-extrabold">
                  {formData.role === "후배" ? "선배님을 찾고 계신가요?" : "후배님을 찾고 계신가요?"}
                </h1>
                <p className="mt-1 text-neutral-600">바로 매칭을 도와드려요.</p>
                <div className="mt-6 space-y-3">
                  <SelectionCard
                    label="빠른 매칭 원해요"
                    isSelected={formData.wantsMatching === true}
                    onClick={() => updateFormData("wantsMatching", true)}
                  />
                  <SelectionCard
                    label="괜찮아요"
                    isSelected={formData.wantsMatching === false}
                    onClick={() => updateFormData("wantsMatching", false)}
                  />
                </div>
              </div>
            )}
          </div>
        </main>

        <OnboardingNav
          onBack={handleBack}
          onNext={handleNext}
          isFirstStep={step === 1}
          isNextDisabled={isNextDisabled()}
        />
      </div>
    </div>
  );
}

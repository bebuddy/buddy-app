// app/(auth)/sign-up/page.tsx
"use client";

import React from "react";
import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import OnboardingNav from "@/components/OnboardingNav";
import OnboardingTopbar from "@/components/OnboardingTopbar";

const BRAND = "#6163FF";
const BRAND_MENTOR = "#FF883F";
const Role = ["후배(멘티)", "선배(멘토)"] as const;

/** TODO: 읍/면/동 데이터 연동 전 임시 유효성 체크
 *  - 실제론 API로 존재 여부 확인 → true/false 반환
 *  - 여기선 '한글만' + 길이 2자 이상일 때만 임시 true
 */
function validateDongLocallyOnly(hangulOnly: string) {
  return hangulOnly.length >= 2;
}

/** 입력에서 허용: 한글(가-힣·ㄱ-ㅎ·ㅏ-ㅣ) + 공백만 */
function hangulOnlyFilter(raw: string) {
  return raw.replace(/[^가-힣ㄱ-ㅎㅏ-ㅣ\s]/g, "");
}

/** 닉네임: 한글/영문/숫자/_(언더스코어)만, 공백/다른 특수문자 불가 */
function sanitizeNickname(raw: string) {
  return raw.replace(/[^a-zA-Z0-9가-힣ㄱ-ㅎㅏ-ㅣ_]/g, "");
}

export default function SignUpPage() {
  const router = useRouter();

  // 0~4 (총 5단계)
  const [step, setStep] = useState(0);

  // step 0
  const [dong, setDong] = useState("");               // 거주지역(한글만)
  const dongOk = useMemo(
    () => validateDongLocallyOnly(dong.trim()),
    [dong]
  );

  // step 1
  const [age, setAge] = useState<string>("");
  const ageNum = useMemo(() => Number(age), [age]);
  const ageOk = useMemo(
    () => Number.isInteger(ageNum) && ageNum >= 1 && ageNum <= 119,
    [ageNum]
  );

  // step 2
  const [gender, setGender] = useState<"남자" | "여자" | null>(null);

  // step 3
  const [name, setName] = useState("");               // 닉네임(필수)
  const [photo, setPhoto] = useState<File | null>(null); // 사진(선택)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const nameOk = useMemo(() => {
    if (!name) return false;
    if (name.length < 2 || name.length > 12) return false;
    // 실제 중복 체크는 서버에서: /api/users/check-nickname
    return true;
  }, [name]);

  // step 4
  const [role, setRole] = useState<(typeof Role)[number] | null>(null);

  /** 진행 바 (0~1): 1/6, 2/6, 3/6, 4/6, 5/6 */
  const [progress, setProgress] = useState(1 / 6);
  useEffect(() => {
    setProgress((step + 1) / 6);
  }, [step]);

  // 사진 프리뷰 관리
  useEffect(() => {
    if (!photo) {
      setPhotoPreview(null);
      return;
    }
    const url = URL.createObjectURL(photo);
    setPhotoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  // 각 단계의 Next 버튼 활성 조건
  const isNextDisabled = useMemo(() => {
    switch (step) {
      case 0: return !dongOk;
      case 1: return !ageOk;
      case 2: return !gender;
      case 3: return !nameOk; // 사진은 선택
      case 4: return !role;
      default: return true;
    }
  }, [step, dongOk, ageOk, gender, nameOk, role]);

  function next() {
    if (step < 4) {
      setStep((s) => s + 1);
      return;
    }

    // 최종 완료: 기본정보 저장 후 라우팅
    const basic = {
      dong: dong.trim(),
      age: ageNum,
      gender,
      name,
      role,
    };

    try {
      // TODO: 실제 가입 API 호출 전 로컬에 임시 저장
      localStorage.setItem("ob.basic", JSON.stringify(basic));
      // TODO: 파일 업로드는 S3 등 업로드 → 받은 URL을 함께 저장
      if (photo) localStorage.setItem("ob.photoName", photo.name);
    } catch {}

    // role 분기
    if (role === "후배(멘티)") router.push("/onboarding/junior");
    else router.push("/onboarding/expert");
  }

  function back() {
    if (step === 0) return router.push("/"); // 첫 단계에서 뒤로 → 메인
    setStep((s) => s - 1);
  }

  // step 0의 초록 체크(애니메이션)
  const CheckDot = ({ show }: { show: boolean }) => (
    <div
      className={[
        "absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center",
        "w-6 h-6 rounded-full border",
        show ? "border-green-500 bg-green-500/10" : "border-transparent"
      ].join(" ")}
      aria-hidden
    >
      <svg
        className={[
          "w-4 h-4",
          "transition-transform duration-200",
          show ? "scale-100 text-green-600" : "scale-0"
        ].join(" ")}
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path d="M16.707 5.293a1 1 0 0 1 0 1.414l-7.25 7.25a1 1 0 0 1-1.414 0l-3-3a1 1 0 1 1 1.414-1.414L8.5 11.586l6.543-6.543a1 1 0 0 1 1.664.25z" />
      </svg>
    </div>
  );

  // 파일 선택 트리거
  const fileRef = useRef<HTMLInputElement | null>(null);
  const openPicker = () => fileRef.current?.click();

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-[440px] min-h-screen bg-white px-5 pb-28">
        {/* 헤더 (progress는 0~0.8까지 표시, 완료 시 다음 페이지에서 1.0) */}
        <OnboardingTopbar flow="signup" progress={progress} showSkip={false} bottomGap={8} />

        {/* 스텝 컨텐츠 */}
        <div className="mt-6 space-y-6">
          {/* 0. 거주지역 */}
          {step === 0 && (
            <>
              <div className="text-[22px] font-bold">거주하는 지역은 어디인가요?</div>
              <div className="relative">
                <input
                  value={dong}
                  onChange={(e) => setDong(hangulOnlyFilter(e.target.value))}
                  placeholder="읍/면/동으로 입력"
                  className="w-full h-12 rounded-lg border px-3 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  inputMode="search"
                  // 숫자/영문/특수문자 입력 자체를 막지는 않지만 onChange에서 필터링
                />
                <CheckDot show={dongOk} />
              </div>
              <p className="text-xs text-neutral-500">
                한글만 입력 가능해요. (예: 신촌동)
              </p>
            </>
          )}

          {/* 1. 나이 */}
          {step === 1 && (
            <>
              <div className="text-[22px] font-bold">연령을 알려주세요.</div>
              <div className="flex items-center gap-2">
                <input
                  value={age}
                  onChange={(e) => {
                    // 숫자만 유지
                    const digits = e.target.value.replace(/\D/g, "");
                    setAge(digits);
                  }}
                  placeholder="00"
                  inputMode="numeric"
                  className="w-24 h-12 rounded-lg border px-3 text-center"
                />
                <span>세</span>
              </div>
              {!ageOk && age !== "" && (
                <p className="text-xs text-red-500">1~119 사이의 정수만 가능합니다.</p>
              )}
            </>
          )}

          {/* 2. 성별 */}
          {step === 2 && (
            <>
              <div className="text-[22px] font-bold">성별을 선택해주세요.</div>
              <div className="flex flex-col gap-3">
                {(["남자", "여자"] as const).map((g) => {
                  const active = gender === g;
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g)}
                      className={[
                        "w-full h-12 rounded-xl border px-4",
                        "transition-colors"
                      ].join(" ")}
                      style={{
                        backgroundColor: active ? BRAND : "transparent",
                        color: active ? "#fff" : "#111827",
                        borderColor: active ? BRAND : "#CBD5E1",
                      }}
                    >
                      {g}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* 3. 프로필(닉네임 + 사진 선택) */}
          {step === 3 && (
            <>
              <div className="text-[22px] font-bold">프로필을 설정해주세요.</div>

              {/* 사진 (선택) */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  {/* 아바타 영역: 더 크게 */}
                  <div className="w-40 h-40 rounded-full bg-neutral-100  overflow-hidden flex items-center justify-center">
                    {photoPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={photoPreview}
                        alt="미리보기"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      // 간단한 기본 일러스트 대체 (원한다면 SVG로 교체)
                      <div className="flex flex-col items-center text-neutral-400">
                        <div className="w-16 h-16 rounded-full bg-white/70" />
                        <div className="h-2" />
                        <div className="w-14 h-2 bg-white/60 rounded-full" />
                      </div>
                    )}
                  </div>

                  {/* 우상단 X(삭제) - 사진이 있을 때만 */}
                  {photoPreview && (
                    <button
                      type="button"
                      onClick={() => setPhoto(null)}
                      className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white shadow border flex items-center justify-center"
                      aria-label="사진 삭제"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeWidth="2" strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
                      </svg>
                    </button>
                  )}

                  {/* 우하단 카메라(선택) */}
                  <button
                    type="button"
                    onClick={openPicker}
                    className="absolute -bottom-1 -right-1 w-10 h-10 rounded-full bg-white shadow flex items-center justify-center"
                    aria-label="사진 선택"
                  >
                    {/* 카메라 아이콘 */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-neutral-600" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9.4 5.2c.2-.5.7-.9 1.3-.9h2.6c.6 0 1.1.4 1.3.9l.3.8h1.9A2.2 2.2 0 0 1 19 8.2v8a2.2 2.2 0 0 1-2.2 2.2H7.2A2.2 2.2 0 0 1 5 16.2v-8A2.2 2.2 0 0 1 7.2 6h1.9l.3-.8ZM12 16.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm0-1.8a1.7 1.7 0 1 1 0-3.4 1.7 1.7 0 0 1 0 3.4Z" />
                    </svg>
                  </button>
                </div>

                {/* 숨겨진 파일 입력 */}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setPhoto(f);
                  }}
                />
              </div>


              {/* 닉네임 (필수) */}
              <div className="space-y-1">
                <input
                  value={name}
                  onChange={(e) => setName(sanitizeNickname(e.target.value))}
                  placeholder="닉네임(이름)"
                  className="w-full h-12 rounded-lg border px-3"
                />
                <p className="text-xs text-neutral-500">
                  닉네임은 2~12자, <strong>한글/영문/숫자/_</strong>만 가능합니다.
                </p>
              </div>
            </>
          )}

          {/* 4. 가입 유형 */}
          {step === 4 && (
            <>
              <div className="text-[22px] font-bold">어떤 유형으로 가입하시겠어요?</div>
              <div className="flex flex-col gap-3">
                {/* 후배(멘티) */}
                <button
                  type="button"
                  onClick={() => setRole("후배(멘티)")}
                  className={[
                    "w-full rounded-xl border text-left px-4 py-4",
                    "transition-colors"
                  ].join(" ")}
                  style={{
                    backgroundColor: role === "후배(멘티)" ? `${BRAND}99` : "#F6F7FF", // 60% ≈ 0x99
                    borderColor: role === "후배(멘티)" ? BRAND : "#E5E7EB",
                    color: "#111827",
                  }}
                >
                  <div className="text-[20px] font-semibold">후배</div>
                  <div className="text-[18px] text-neutral-600 mt-1">선배님을 찾고 있어요.</div>
                  <div className="text-[15px] text-neutral-400 mt-0.5">*1분만에 간편하게 가입하기</div>
                </button>

                {/* 선배(멘토) */}
                <button
                  type="button"
                  onClick={() => setRole("선배(멘토)")}
                  className={[
                    "w-full rounded-xl border text-left px-4 py-4",
                    "transition-colors"
                  ].join(" ")}
                  style={{
                    backgroundColor: role === "선배(멘토)" ? `${BRAND_MENTOR}99` : "#FFF7F1",
                    borderColor: role === "선배(멘토)" ? BRAND_MENTOR : "#F2E8E3",
                    color: "#111827",
                  }}
                >
                  <div className="text-[20px] font-semibold">선배</div>
                  <div className="text-[18px] text-neutral-600 mt-1">후배님을 찾고 있어요.</div>
                  <div className="text-[15px] text-neutral-400 mt-0.5">*3분만에 간편하게 가입하기</div>
                </button>
              </div>
            </>
          )}
        </div>

        {/* 하단 네비 */}
        <OnboardingNav
          onBack={back}
          onNext={next}
          isNextDisabled={isNextDisabled}
          isFirstStep={step === 0}
          nextLabel={step < 4 ? "다음" : "시작하기"}
        />
      </div>
    </div>
  );
}

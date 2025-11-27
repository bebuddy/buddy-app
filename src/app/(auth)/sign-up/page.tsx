"use client";

import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import OnboardingNav from "@/components/OnboardingNav";
import OnboardingTopbar from "@/components/OnboardingTopbar";

// ===== 색상 / 상수 =====
const BRAND = "#6163FF";
const BRAND_MENTOR = "#FF883F";
const Role = ["후배(멘티)", "선배(멘토)"] as const;

type User = {
  auth_id: string;
  location: string | null;
  birth_date: string | null;
  gender: "남성" | "여성" | null;
  nick_name: string | null;
  profile_image: string | null;
  introduction: string | null;
  status?: "DONE" | "PENDING";
};

type UserUpdates = Partial<
  Pick<
    User,
    "location" | "birth_date" | "gender" | "nick_name" | "introduction" | "status" | "profile_image"
  >
>;


/** 읍/면/동 임시 유효성 체크 */
function validateDongLocallyOnly(hangulOnly: string) {
  return hangulOnly.length >= 2;
}

/** 한글만 필터 */
function hangulOnlyFilter(raw: string) {
  return raw.replace(/[^가-힣ㄱ-ㅎㅏ-ㅣ\s]/g, "");
}

/** 닉네임 허용 문자 */
function sanitizeNickname(raw: string) {
  return raw.replace(/[^a-zA-Z0-9가-힣ㄱ-ㅎㅏ-ㅣ_]/g, "");
}

export default function SignUpPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-screen text-gray-600">
          회원 정보를 불러오는 중입니다...
        </div>
      }
    >
      <SignUpPageContent />
    </Suspense>
  );
}

function SignUpPageContent() {
  const router = useRouter();
  const params = useSearchParams();
  const authId = params.get("auth_id");

  // 유저 정보
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 1. 기존 유저 정보 불러오기
  useEffect(() => {
    if (!authId) return;
    const fetchUser = async () => {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("auth_id", authId)
        .single();

      if (!error && data) setUser(data);
      setLoading(false);
    };
    fetchUser();
  }, [authId]);

  // 2. 온보딩 상태값
  const [step, setStep] = useState(0);
  const [dong, setDong] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<"남성" | "여성" | null>(null);
  const [name, setName] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  // 3. 기존 유저 데이터 프리필
  useEffect(() => {
    if (!user) return;
    if (user.location) setDong(user.location);
    if (user.birth_date)
      setAge(String(new Date().getFullYear() - new Date(user.birth_date).getFullYear()));
    if (user.nick_name) setName(user.nick_name);
    if (user.profile_image) setPhotoPreview(user.profile_image);
    if (user.introduction) setRole(user.introduction);
  }, [user]);

  // step별 유효성
  const dongOk = useMemo(() => validateDongLocallyOnly(dong.trim()), [dong]);
  const ageNum = useMemo(() => Number(age), [age]);
  const ageOk = useMemo(
    () => Number.isInteger(ageNum) && ageNum >= 1 && ageNum <= 119,
    [ageNum]
  );
  const nameOk = useMemo(() => {
    if (!name) return false;
    if (name.length < 2 || name.length > 12) return false;
    return true;
  }, [name]);

  const isNextDisabled = useMemo(() => {
    switch (step) {
      case 0:
        return !dongOk;
      case 1:
        return !ageOk;
      case 2:
        return !gender;
      case 3:
        return !nameOk;
      case 4:
        return !role;
      default:
        return true;
    }
  }, [step, dongOk, ageOk, gender, nameOk, role]);

  // 프로그레스바
  const [progress, setProgress] = useState(1 / 6);
  useEffect(() => {
    setProgress((step + 1) / 6);
  }, [step]);

  // 사진 프리뷰
  useEffect(() => {
    if (!photo) {
      setPhotoPreview(null);
      return;
    }
    const url = URL.createObjectURL(photo);
    setPhotoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  // DB 업데이트
  const handleNext = async () => {
    if (!authId) return;

    const updates: UserUpdates = {};

    if (step === 0) updates.location = dong;
    if (step === 1 && age) {
      const birthYear = new Date().getFullYear() - Number(age);
      updates.birth_date = `${birthYear}-01-01`;
    }
    if (step === 2 && gender) updates.gender = gender;
    if (step === 3) updates.nick_name = name;
    if (step === 4) {
      updates.status = "DONE";
      updates.introduction = role; // 역할을 introduction에 임시 저장
    }

    // (선택) 사진 업로드 로직: 추후 Supabase Storage로 추가
    // if (photo) {
    //   const fileName = `${authId}_${photo.name}`;
    //   const { data: uploadData, error: uploadError } = await supabase.storage
    //     .from("profile")
    //     .upload(fileName, photo);
    //   if (!uploadError && uploadData) {
    //     updates.profile_image = uploadData.path;
    //   }
    // }

    // 업데이트 실행
    if (Object.keys(updates).length > 0) {
      const { error } = await supabase
        .from("users")
        .update(updates)
        .eq("auth_id", authId);

      if (error) {
        console.error("Update error:", error);
        alert("회원 정보 업데이트 실패");
        return;
      }
    }

    // 단계 이동
    if (step < 4) {
      setStep((s) => s + 1);
    }
    else {
      if (role === "후배(멘티)") {
        router.push("/onboarding/junior")
      }
      if (role === "선배(멘토)") {
        router.push("/onboarding/expert")
      }
    }
  };

  // 뒤로가기
  function back() {
    if (step === 0) return router.push("/");
    setStep((s) => s - 1);
  }

  // 체크 아이콘
  const CheckDot = ({ show }: { show: boolean }) => (
    <div
      className={[
        "absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center",
        "w-6 h-6 rounded-full border",
        show ? "border-green-500 bg-green-500/10" : "border-transparent",
      ].join(" ")}
      aria-hidden
    >
      <svg
        className={[
          "w-4 h-4",
          "transition-transform duration-200",
          show ? "scale-100 text-green-600" : "scale-0",
        ].join(" ")}
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path d="M16.707 5.293a1 1 0 0 1 0 1.414l-7.25 7.25a1 1 0 0 1-1.414 0l-3-3a1 1 0 1 1 1.414-1.414L8.5 11.586l6.543-6.543a1 1 0 0 1 1.664.25z" />
      </svg>
    </div>
  );

  // 파일 선택
  const fileRef = useRef<HTMLInputElement | null>(null);
  const openPicker = () => fileRef.current?.click();

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-600">
        회원 정보를 불러오는 중입니다...
      </div>
    );

  // =======================
  // UI 시작
  // =======================
  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-[768px] min-h-screen bg-white px-5 pb-28">
        <OnboardingTopbar flow="signup" progress={progress} showSkip={false} bottomGap={8} />

        {/* --------------------- */}
        {/* 단계별 콘텐츠 */}
        {/* --------------------- */}
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
                />
                <CheckDot show={dongOk} />
              </div>
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
                {(["남성", "여성"] as const).map((g) => {
                  const active = gender === g;
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g)}
                      className="w-full h-12 rounded-xl border px-4 transition-colors"
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

          {/* 3. 프로필 */}
          {step === 3 && (
            <>
              <div className="text-[22px] font-bold">프로필을 설정해주세요.</div>

              {/* 사진 */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="w-40 h-40 rounded-full bg-neutral-100 overflow-hidden flex items-center justify-center">
                    {photoPreview ? (
                      <img
                        src={photoPreview}
                        alt="미리보기"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center text-neutral-400">
                        <div className="w-16 h-16 rounded-full bg-white/70" />
                        <div className="h-2" />
                        <div className="w-14 h-2 bg-white/60 rounded-full" />
                      </div>
                    )}
                  </div>

                  {photoPreview && (
                    <button
                      type="button"
                      onClick={() => setPhoto(null)}
                      className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white shadow border flex items-center justify-center"
                      aria-label="사진 삭제"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                      >
                        <path strokeWidth="2" strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
                      </svg>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={openPicker}
                    className="absolute -bottom-1 -right-1 w-10 h-10 rounded-full bg-white shadow flex items-center justify-center"
                    aria-label="사진 선택"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5 text-neutral-600"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M9.4 5.2c.2-.5.7-.9 1.3-.9h2.6c.6 0 1.1.4 1.3.9l.3.8h1.9A2.2 2.2 0 0 1 19 8.2v8a2.2 2.2 0 0 1-2.2 2.2H7.2A2.2 2.2 0 0 1 5 16.2v-8A2.2 2.2 0 0 1 7.2 6h1.9l.3-.8ZM12 16.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm0-1.8a1.7 1.7 0 1 1 0-3.4 1.7 1.7 0 0 1 0 3.4Z" />
                    </svg>
                  </button>
                </div>
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

              {/* 닉네임 */}
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

          {/* 4. 가입유형 */}
          {step === 4 && (
            <>
              <div className="text-[22px] font-bold">어떤 유형으로 가입하시겠어요?</div>
              <div className="flex flex-col gap-3">
                {Role.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className="w-full rounded-xl border text-left px-4 py-4 transition-colors"
                    style={{
                      backgroundColor:
                        role === r ? (r === "후배(멘티)" ? `${BRAND}99` : `${BRAND_MENTOR}99`) : "#F9FAFB",
                      borderColor: role === r ? (r === "후배(멘티)" ? BRAND : BRAND_MENTOR) : "#E5E7EB",
                    }}
                  >
                    <div className="text-[20px] font-semibold">{r.split("(")[0]}</div>
                    <div className="text-[18px] text-neutral-600 mt-1">
                      {r === "후배(멘티)" ? "선배님을 찾고 있어요." : "후배님을 찾고 있어요."}
                    </div>
                    <div className="text-[15px] text-neutral-400 mt-0.5">
                      *{r === "후배(멘티)" ? "1분만에 간편하게" : "3분만에 간편하게"} 가입하기
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* 하단 네비게이션 */}
        <OnboardingNav
          onBack={back}
          onNext={handleNext}
          isNextDisabled={isNextDisabled}
          isFirstStep={step === 0}
          nextLabel={step < 4 ? "다음" : "시작하기"}
        />
      </div>
    </div>
  );
}

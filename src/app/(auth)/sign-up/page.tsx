// app/(auth)/sign-up/page.tsx
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import OnboardingNav from "@/components/OnboardingNav";

const BRAND = "#6163FF"; // 기본

const Role = ["후배(멘티)", "선배(멘토)"] as const;

export default function SignUpPage() {
  const router = useRouter();

  // A 단계들
  const [step, setStep] = React.useState(0);
  const [dong, setDong] = React.useState("");           // 거주지역
  const [age, setAge] = React.useState<string>("");
  const [gender, setGender] = React.useState<"남자"|"여자"|null>(null);
  const [name, setName] = React.useState("");           // 프로필 이름
  const [role, setRole] = React.useState<typeof Role[number] | null>(null);

  const isNextDisabled = [
    dong.trim().length === 0,
    !(age && /^\d+$/.test(age) && Number(age) > 0),
    !gender,
    name.trim().length === 0,
    !role,
  ][step];

  function next() {
    if (step < 4) return setStep(s => s + 1);

    // 최종: 기본정보 로컬 저장
    const basic = { dong, age: Number(age), gender, name, role };
    try { localStorage.setItem("ob.basic", JSON.stringify(basic)); } catch {}

    // 분기
    if (role === "후배(멘티)") router.push("/onboarding/junior");
    else router.push("/onboarding/expert");
  }
  function back() {
    if (step === 0) return router.push("/"); // 첫 단계에서 뒤로 → 메인
    setStep(s => s - 1);
  }

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-[440px] min-h-screen bg-white px-5 pb-28">
        {/* 헤더 */}
        <div className="h-12" />
        <h1 className="text-[18px] font-extrabold text-neutral-900">회원가입</h1>
        <div className="mt-1 text-[13px] text-neutral-500">간단한 정보를 입력해주세요.</div>

        {/* 스텝 컨텐츠 */}
        <div className="mt-6 space-y-4">
          {step === 0 && (
            <>
              <div className="text-[15px] font-bold">거주하는 지역은 어디인가요?</div>
              <input
                value={dong}
                onChange={(e)=>setDong(e.target.value)}
                placeholder="읍/면/동으로 검색"
                className="w-full h-12 rounded-lg border px-3"
              />
            </>
          )}

          {step === 1 && (
            <>
              <div className="text-[15px] font-bold">연령을 알려주세요.</div>
              <div className="flex items-center gap-2">
                <input
                  value={age}
                  onChange={(e)=>setAge(e.target.value)}
                  placeholder="00"
                  inputMode="numeric"
                  className="w-24 h-12 rounded-lg border px-3"
                />
                <span>세</span>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="text-[15px] font-bold">성별을 선택해주세요.</div>
              <div className="flex gap-2">
                {(["남자","여자"] as const).map(g=>(
                  <button
                    key={g}
                    type="button"
                    onClick={()=>setGender(g)}
                    className="px-4 h-10 rounded-full border"
                    style={{
                      backgroundColor: gender===g? BRAND : "transparent",
                      color: gender===g? "#fff":"#111827",
                      borderColor: gender===g? BRAND:"#CBD5E1"
                    }}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="text-[15px] font-bold">프로필을 설정해주세요.</div>
              <input
                value={name}
                onChange={(e)=>setName(e.target.value)}
                placeholder="닉네임(이름)"
                className="w-full h-12 rounded-lg border px-3"
              />
              {/* 사진 업로드는 추후 */}
            </>
          )}

          {step === 4 && (
            <>
              <div className="text-[15px] font-bold">어떤 유형으로 가입하시겠어요?</div>
              <div className="flex flex-col gap-2">
                {Role.map(r=>(
                  <button
                    key={r}
                    type="button"
                    onClick={()=>setRole(r)}
                    className="w-full h-12 rounded-lg border text-left px-4"
                    style={{
                      backgroundColor: role===r? BRAND : "transparent",
                      color: role===r? "#fff":"#111827",
                      borderColor: role===r? BRAND:"#CBD5E1"
                    }}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* 하단 네비 */}
        <OnboardingNav
          onBack={back}
          onNext={next}
          isNextDisabled={!!isNextDisabled}
          isFirstStep={step===0}
          nextLabel={step<4 ? "다음" : "시작하기"}
        />
      </div>
    </div>
  );
}

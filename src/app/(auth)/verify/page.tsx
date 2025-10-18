'use client';
import { useState, useEffect } from "react";
import FillButton from "@/components/common/FillButton";
import { useRouter } from "next/navigation";
import { getUserInfoAction } from "@/actions/user";
import { supabase } from "@/lib/supabase";

export default function VerifyPage() {
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [time, setTime] = useState(0);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  /* -----------------------------
     자동 하이픈 처리
  ----------------------------- */
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9]/g, "");
    if (value.length < 4) value = value;
    else if (value.length < 8) value = `${value.slice(0, 3)}-${value.slice(3)}`;
    else value = `${value.slice(0, 3)}-${value.slice(3, 7)}-${value.slice(7, 11)}`;
    setPhone(value);
  };

  function formatToE164(phone: string) {
    const cleaned = phone.replace(/[^0-9]/g, "");
    if (cleaned.startsWith("0")) return `+82${cleaned.slice(1)}`;
    return cleaned;
  }

  /* -----------------------------
     인증요청 (mock)
  ----------------------------- */
  async function verifyPhone() {
    setErrorMsg("");
    setIsLoading(true);

    try {
      const userInfo = await getUserInfoAction(phone);
      const cleanNumber = formatToE164(phone.replace(/-/g, ""));

      // 이미 가입되어 있다면 바로 이동
      if (userInfo && userInfo.isOnboardingComplete) {
        router.push("/junior");
        return;
      }

      if (userInfo && !userInfo.isOnboardingComplete) {
        router.push(`/sign-up?userId=${userInfo.id}`);
        return;
      }

      // 실제로는 OTP를 보내야 하지만 지금은 mock 단계
      console.log(`📨 MOCK: OTP sent to ${cleanNumber}`);
      setTime(300);
      setIsOtpSent(true);
    } catch (e) {
      console.error(e);
      setErrorMsg("인증 요청 중 문제가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  }

  /* -----------------------------
     인증번호 검증 (mock success)
  ----------------------------- */
  /* -----------------------------
     인증번호 검증 (mock success)
  ----------------------------- */
  async function handleOtpVerification() {
    setErrorMsg("");
    setIsLoading(true);

    try {
      const cleanNumber = formatToE164(phone.replace(/-/g, ""));

      // ✅ 실제 verifyOtp는 생략하고 바로 성공 처리
      console.log(`✅ MOCK VERIFY: ${cleanNumber} verified with code ${otp}`);

      // ✅ Supabase users 테이블에 바로 insert
      const { data, error: insertError } = await supabase
        .from("users")
        .insert([
          {
            auth_id: crypto.randomUUID(), // mock용 ID
            provider: "PHONE",
            status: "PENDING",
            phone_number: Number(phone),
          },
        ])
        .select("id") // 👈 생성된 user의 id를 반환받기 위해 select 추가
        .single();   // 한 개만 받기

      if (insertError) throw insertError;

      const userId = data?.id;
      console.log("✅ User inserted with ID:", userId);

      // ✅ userId 쿼리로 함께 라우팅
      router.push(`/sign-up?userId=${userId}`);
    } catch (e) {
      console.error(e);
      setErrorMsg("인증 처리 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  }

  /* -----------------------------
     타이머
  ----------------------------- */
  useEffect(() => {
    if (time <= 0) return;
    const timer = setInterval(() => setTime((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [time]);

  const formatTime = (t: number) => {
    const m = Math.floor(t / 60);
    const s = t % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  /* -----------------------------
     UI
  ----------------------------- */
  return (
    <>
      <div className="w-full px-[27px] min-h-dvh flex flex-col justify-center">
        <h1 className="font-bold-20 text-[#333333] mb-5">휴대폰 인증</h1>

        {!isOtpSent ? (
          <input
            type="text"
            value={phone}
            onChange={handlePhoneChange}
            placeholder="휴대폰 번호를 입력하세요"
            maxLength={13}
            className="w-full border border-gray-300 rounded-[6px] px-4 py-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-secondary-500 placeholder:text-gray-400 font-medium-16"
          />
        ) : (
          <>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm text-gray-600">인증번호</label>
              <span className="text-sm text-secondary-500 font-medium">
                남은시간 {formatTime(time)}
              </span>
            </div>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
              maxLength={6}
              placeholder="인증번호 6자리 입력"
              className="w-full border border-gray-300 rounded-[6px] px-4 py-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-secondary-500 placeholder:text-gray-400 font-medium-16"
            />
          </>
        )}

        {errorMsg && <p className="text-red-500 text-sm mt-2">{errorMsg}</p>}
      </div>

      <div
        style={{ bottom: "calc(env(safe-area-inset-bottom) + 32px)" }}
        className="fixed left-7 right-7"
      >
        {!isOtpSent ? (
          <FillButton
            name="인증번호 발송"
            onClick={verifyPhone}
            isLoading={isLoading}
          />
        ) : (
          <FillButton
            name="인증하기"
            onClick={handleOtpVerification}
            isLoading={isLoading}
          />
        )}
      </div>
    </>
  );
}

"use client";

export default function OnboardingComplete() {
  const handleStart = () => {
    window.location.href = '/';
  };

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center p-6 bg-white">
      <div className="flex flex-col items-center text-center">
        <div className="text-6xl mb-6">🎉</div>
        <h1 className="text-2xl font-extrabold text-neutral-900">축하합니다!</h1>
        <h1 className="text-2xl font-extrabold text-neutral-900 mt-1">가입이 완료되었습니다.</h1>
      </div>

      <div
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[768px] p-4"
        style={{ paddingBottom: "calc(16px + env(safe-area-inset-bottom))" }}
      >
         <button
          onClick={handleStart}
          className="w-full h-[52px] rounded-lg brand-bg text-white font-bold"
        >
          소식 둘러보기
        </button>
      </div>
    </div>
  );
}


"use client";

// 'next/navigation' 모듈을 찾지 못하는 오류를 해결하기 위해 useRouter를 사용하지 않습니다.
// import { useRouter } from 'next/navigation';

export default function OnboardingComplete() {
  // const router = useRouter(); // useRouter를 사용하지 않으므로 이 줄을 제거합니다.

  const handleStart = () => {
    // TODO: 백엔드에 온보딩 데이터 저장 로직 추가
    // router.push('/') 대신 window.location.href를 사용하여 페이지를 이동합니다.
    window.location.href = '/';
  };

  return (
    // ✅ 화면 전체를 차지하고 내용을 중앙 정렬하도록 수정
    <div className="fixed inset-0 flex flex-col items-center justify-center p-6 bg-white">
      <div className="flex flex-col items-center text-center">
        {/* 아이콘/이미지 영역 (폭죽 이미지 등) */}
        <div className="text-6xl mb-6">🎉</div>
        <h1 className="text-2xl font-extrabold text-neutral-900">회원가입이 완료됐어요.</h1>
        <p className="mt-2 text-neutral-600">둘러보러 가볼까요?</p>
      </div>

      {/* ✅ 시작 버튼 컨테이너를 다른 Nav 컴포넌트와 동일한 방식으로 중앙 정렬합니다. */}
      <div 
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[440px] p-4"
        style={{ paddingBottom: "calc(16px + env(safe-area-inset-bottom))" }}
      >
         <button
          onClick={handleStart}
          className="w-full h-[52px] rounded-lg brand-bg text-white font-bold"
        >
          시작
        </button>
      </div>
    </div>
  );
}


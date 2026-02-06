"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, Share, Plus } from "lucide-react"; // 아이콘 추가
import { apiFetch } from "@/lib/apiFetch";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

// =======================================================
// --- 유틸리티 함수 ---
// =======================================================

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}


// =======================================================
// --- 백엔드 API 호출 함수 (⚠️ 백엔드 구현 필요) ---
// =======================================================

async function subscribeUser(subscription: any) {
    try {
        const res = await apiFetch('/api/notifications/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(subscription),
        });
        if (!res.ok) throw new Error("Subscription API failed.");
        console.log("Subscription sent to server successfully.");
    } catch (error) {
        console.error("Error during subscription API call:", error);
    }
}

async function unsubscribeUser() {
    // 💡 구독 해제 시 DB에서 해당 endpoint를 삭제하도록 해야
    try {
        const res = await apiFetch('/api/notifications/unsubscribe', {
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
        });
        if (!res.ok) throw new Error("Unsubscribe API failed.");
        console.log("Unsubscription processed by server.");
    } catch (error) {
        console.error("Error during unsubscription API call:", error);
    }
}

async function sendNotification(message: string) {
    // 💡 백엔드에서 테스트 알림을 발송하는 로직 필요
    try {
        const res = await apiFetch('/api/notifications/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, userId: 'current_logged_in_user_uuid' }),
        });
        const result = await res.json();
        if (res.ok) {
            alert(`테스트 알림 발송 요청 성공! 서버 응답: ${result.message}`);
        } else {
            alert(`테스트 알림 발송 실패. 오류: ${result.message}`);
        }
    } catch (error) {
        console.error("Error during test notification API call:", error);
        alert("네트워크 오류로 테스트 알림 발송에 실패했습니다.");
    }
}

// =======================================================
// --- 1. PushNotificationManager 컴포넌트 ---
// =======================================================

function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false)
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)
  const [message, setMessage] = useState('')
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');

  // Service Worker 등록 확인 및 초기 구독 상태 로드
  const registerServiceWorker = useCallback(async () => {
    try {
        const registration = await navigator.serviceWorker.ready; // next-pwa가 등록한 sw.js를 기다림
        setPermissionStatus(Notification.permission);
        const sub = await registration.pushManager.getSubscription();
        setSubscription(sub);
    } catch (e) {
        console.error("Service Worker or Subscription check failed:", e);
    }
  }, []);

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window && VAPID_PUBLIC_KEY) {
      setIsSupported(true)
      registerServiceWorker()
    }
  }, [registerServiceWorker])


  async function subscribeToPush() {
    if (permissionStatus !== 'granted') {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);
      if (permission !== 'granted') {
        alert("알림 권한이 거부되었습니다. 브라우저 설정을 확인해주세요.");
        return;
      }
    }

    try {
        const registration = await navigator.serviceWorker.ready
        const sub = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY!),
        })
        setSubscription(sub)
        const serializedSub = JSON.parse(JSON.stringify(sub))
        await subscribeUser(serializedSub)
        alert("푸시 알림 구독이 완료되었습니다!");
    } catch (e) {
        console.error("Subscription process failed:", e);
        alert("푸시 알림 구독에 실패했습니다. VAPID 키 설정 또는 네트워크를 확인해주세요.");
    }
  }

  async function unsubscribeFromPush() {
    try {
        await subscription?.unsubscribe()
        setSubscription(null)
        await unsubscribeUser()
        alert("푸시 알림 구독이 해제되었습니다.");
    } catch (e) {
        console.error("Unsubscription process failed:", e);
    }
  }

  async function sendTestNotification() {
    if (subscription) {
      await sendNotification(message)
      setMessage('')
    }
  }

  if (!isSupported) {
    return (
        <div className="p-4 bg-red-100 text-red-700 border border-red-200 rounded-lg">
            <p className="font-semibold">⚠️ 푸시 알림 미지원</p>
            <p className="text-sm">현재 브라우저에서는 푸시 알림이 지원되지 않거나 VAPID 키가 로드되지 않았습니다.</p>
        </div>
    )
  }

  return (
    <div className="p-6 border border-gray-200 rounded-xl shadow-lg bg-white space-y-4">
      <h3 className="text-xl font-bold text-indigo-700">푸시 알림 관리</h3>
      <p className="text-sm text-gray-600">현재 브라우저의 알림 상태와 구독을 관리합니다.</p>
      
      {subscription ? (
        <div className="space-y-3">
          <p className="text-green-600 font-medium">✅ 구독 상태: 구독 중</p>
          <button 
            onClick={unsubscribeFromPush}
            className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition duration-150 active:scale-[0.98]"
          >
            알림 구독 해제
          </button>
          <div className="pt-2">
            <input
              type="text"
              placeholder="테스트 메시지 입력"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button 
              onClick={sendTestNotification}
              disabled={!message}
              className={`w-full mt-2 py-2 rounded-lg transition duration-150 active:scale-[0.98] ${
                  message ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              테스트 알림 발송 (백엔드 필요)
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-orange-500 font-medium">❌ 구독 상태: 미구독 (권한: {permissionStatus})</p>
          <p className="text-sm text-gray-500">알림을 받으려면 구독을 시작해야 합니다.</p>
          <button 
            onClick={subscribeToPush}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition duration-150 active:scale-[0.98]"
          >
            알림 구독 시작 및 권한 요청
          </button>
        </div>
      )}
    </div>
  )
}

// =======================================================
// --- 2. InstallPrompt 컴포넌트 ---
// =======================================================

function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  
  useEffect(() => {
    // PWA 설치 상태 및 iOS 여부 확인
    setIsIOS(
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    )

    // 'standalone' 모드 (설치된 PWA 앱)인지 확인
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches)
  }, [])

  if (isStandalone) {
    return null // 이미 설치되어 있다면 표시하지 않음
  }
  
  // A2HS (Add to Home Screen) 버튼 클릭 처리
  const handleInstallClick = () => {
    // iOS에서는 사용자에게 직접 설명해주는 것이 유일한 방법입니다.
    if (isIOS) {
        alert("iOS 기기에서는 Safari 하단의 '공유' 버튼을 누른 후, '홈 화면에 추가'를 선택해주세요.");
    } else if ((window as any).deferredPrompt) {
        // Android 및 기타 크롬 기반 브라우저 A2HS 프롬프트 트리거 (현재 코드에는 deferredPrompt 저장이 빠져있으므로 메시지만 표시)
        alert("앱 설치 팝업이 나타나지 않으면, 브라우저 설정(점 세 개 버튼)에서 '앱 설치'를 찾아보세요.");
    }
  };

  return (
    <div className="p-6 border border-gray-200 rounded-xl shadow-lg bg-white mt-6 space-y-4">
      <h3 className="text-xl font-bold text-teal-700">앱 설치 (PWA)</h3>
      
      <button 
        onClick={handleInstallClick}
        className="w-full bg-teal-500 text-white py-3 rounded-lg font-semibold hover:bg-teal-600 transition duration-150 active:scale-[0.98]"
      >
        홈 화면에 추가 (앱 설치)
      </button>

      {isIOS && (
        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md border border-gray-200">
          <span className="font-semibold text-teal-700">💡 iOS 안내:</span>
          <br />
          Safari에서 하단의
          <Share className="inline-block w-4 h-4 mx-1 align-sub" /> 
          버튼을 누른 후, "홈 화면에 추가"
          <Plus className="inline-block w-4 h-4 mx-1 align-sub" />
          를 선택하여 앱을 설치할 수 있습니다.
        </p>
      )}
    </div>
  )
}

// =======================================================
// --- 3. 최종 페이지 컴포넌트 ---
// =======================================================

export default function Page() {
  return (
    <div className="p-4 space-y-6 max-w-lg mx-auto">
      {/* 상단 Header */}
      <div className="flex items-center gap-2 mb-4">
        <button
          type="button"
          aria-label="뒤로가기"
          // onClick={() => router.back()} // useRouter import가 없으므로 주석 처리
          className="p-1 -ml-1 rounded-full active:scale-95"
        >
          <ChevronLeft size={28} />
        </button>
        <div className="text-[18px] font-semibold">PWA 및 알림 설정</div>
      </div>

      <PushNotificationManager />
      <InstallPrompt />
      
      <div className="h-10"></div> {/* 하단 여백 */}
    </div>
  )
}

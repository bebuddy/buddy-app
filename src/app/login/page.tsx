"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
// ✅ 올바른 Supabase 클라이언트 경로로 수정했습니다.
import { supabase } from '@/lib/supabase'; 
import { ChevronLeft } from 'lucide-react'; // 아이콘 추가

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Gmail(Google)로 로그인하는 함수
  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    setError('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
    if (error) {
      setError(error.message);
      setIsSubmitting(false);
    }
  };

  // 이메일/비밀번호로 로그인하는 함수
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setError('이메일 또는 비밀번호가 올바르지 않습니다.');
    } else {
      router.push('/'); // 성공 시 메인 페이지로 이동
      router.refresh(); // 페이지를 새로고침하여 서버 세션을 다시 가져옴
    }
    setIsSubmitting(false);
  };

  return (
    // ✅ 다른 페이지와 통일성을 맞추기 위해 레이아웃 구조를 변경했습니다.
    <div className="w-full flex justify-center bg-gray-50">
      <div className="w-full max-w-[420px] min-h-screen bg-white flex flex-col p-6">

        <div className="flex-1 flex flex-col justify-center">
          <div className="text-left mb-10">
            <h1 className="text-2xl font-extrabold text-gray-900">
              로그인하고<br/>
              벗을 만나보세요!
            </h1>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={handleGoogleLogin}
              disabled={isSubmitting}
              type="button"
              className="w-full flex justify-center items-center gap-2 py-3 px-4 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 disabled:opacity-50"
            >
              <svg className="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.46 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span>Gmail 계정으로 로그인</span>
            </button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">또는</span>
              </div>
            </div>
            
            <form onSubmit={handleSignIn} className="space-y-4">
              <input
                type="email"
                placeholder="이메일 주소"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--brand)] focus:border-[var(--brand)]"
              />
              <input
                type="password"
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--brand)] focus:border-[var(--brand)]"
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full brand-bg py-3 px-4 text-sm font-semibold text-white rounded-md shadow-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--brand)] disabled:opacity-50"
              >
                {isSubmitting ? '로그인 중...' : '로그인'}
              </button>
            </form>
          </div>
          
          <p className="mt-8 text-sm text-center text-gray-600">
            계정이 없으신가요?{' '}
            <Link href="/onboarding" className="font-medium text-[var(--brand)] hover:underline">
              회원가입
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
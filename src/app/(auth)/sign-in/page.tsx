"use client";

import React from "react";

export default function SigninPage() {
    // Handlers (swap with your real auth logic)
    const handleProviderSignIn = async (provider: "google" | "apple") => {
        console.log(`Sign in with ${provider}`);
        // e.g., await signIn(provider)
    };

    const handleSelfSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        const email = String(form.get("email") || "").trim();
        const password = String(form.get("password") || "").trim();
        console.log({ email, password });
        // e.g., await signInWithCredentials({ email, password })
    };

    return (
        <div className="min-h-[100dvh] w-full bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 flex items-center justify-center p-4">
            <div className="w-full max-w-[440px]">
                {/* Brand */}
                <div className="mb-8 text-center">
                    <div className="mx-auto h-12 w-12 rounded-2xl bg-black/90 dark:bg-white/90 flex items-center justify-center shadow-lg">
                        <span className="text-white dark:text-black font-bold text-xl">B</span>
                    </div>
                    <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">로그인</h1>
                </div>

                <div className="rounded-2xl bg-white/80 dark:bg-slate-900/60 backdrop-blur ring-1 ring-slate-200 dark:ring-slate-800 shadow-xl">
                    <div className="p-6 md:p-8">
                        {/* OAuth Buttons */}
                        <div className="grid gap-3">
                            <button
                                onClick={() => handleProviderSignIn("google")}
                                className="cursor-pointer group inline-flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/50"
                                aria-label="Sign in with Google"
                            >
                                <span>Google로 계속하기</span>
                            </button>

                            <button
                                onClick={() => handleProviderSignIn("apple")}
                                className="cursor-pointer group inline-flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-3 text-sm font-medium text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/50"
                                aria-label="Sign in with Apple"
                            >
                                <span>Apple로 계속하기</span>
                            </button>
                        </div>

                        {/* Divider */}
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                            </div>
                            <div className="relative flex justify-center">
                                <span className="bg-white dark:bg-slate-900 px-3 text-xs uppercase tracking-wider text-slate-400">또는</span>
                            </div>
                        </div>

                        {/* Native Sign-in */}
                        <form onSubmit={handleSelfSignIn} className="grid gap-4">
                            <div className="grid gap-2">
                                <label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                    이메일
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    placeholder="you@example.com"
                                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950 px-3 py-2.5 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400/50"
                                />
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center justify-between">
                                    <label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                        비밀번호
                                    </label>
                                    <a href="/forgot" className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 underline-offset-2 hover:underline">
                                        비밀번호를 잊으셨나요?
                                    </a>
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    minLength={8}
                                    placeholder="••••••••"
                                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950 px-3 py-2.5 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400/50"
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <label className="inline-flex items-center gap-2 select-none">
                                    <input type="checkbox" name="remember" className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400" />
                                    <span className="text-sm text-slate-600 dark:text-slate-300">로그인 상태 유지</span>
                                </label>
                            </div>

                            <button
                                type="submit"
                                className="inline-flex items-center justify-center rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-4 py-2.5 text-sm font-semibold shadow-sm hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/50"
                            >
                                로그인
                            </button>
                        </form>

                        {/* Footer */}
                        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
                            계정이 없나요? {" "}
                            <a href="/signup" className="font-medium text-slate-700 dark:text-slate-200 hover:underline underline-offset-2">
                                회원가입
                            </a>
                        </p>
                    </div>
                </div>

                {/* Legal */}
                <p className="mt-6 text-center text-xs text-slate-400">
                    로그인 시{' '}
                    <a href="/terms" className="underline underline-offset-2">이용약관</a>과{' '}
                    <a href="/privacy" className="underline underline-offset-2">개인정보처리방침</a>에 동의하게 됩니다.
                </p>
            </div>
        </div>
    );
}
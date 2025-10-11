import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  // 수정하고 반환할 수 있는 응답(response) 객체를 생성합니다.
  let res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  // 1. 미들웨어에서 사용할 Supabase 클라이언트를 생성합니다.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          // 쿠키가 설정되면 요청의 쿠키를 먼저 업데이트합니다.
          req.cookies.set({
            name,
            value,
            ...options,
          })
          // 응답 객체는 불변이므로 새로 만들어야 합니다.
          res = NextResponse.next({
            request: {
              headers: req.headers,
            },
          })
          // 새로 만든 응답에 쿠키를 설정합니다.
          res.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          // 쿠키가 제거되면 요청의 쿠키를 먼저 업데이트합니다.
          req.cookies.set({
            name,
            value: '',
            ...options,
          })
          res = NextResponse.next({
            request: {
              headers: req.headers,
            },
          })
          // 새로 만든 응답에서 쿠키를 제거(빈 값으로 설정)합니다.
          res.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // 2. 현재 로그인된 사용자 세션 정보를 가져옵니다.
  const { data: { session } } = await supabase.auth.getSession()
  
  const { pathname } = req.nextUrl;

  // 3. 로그인이 안 된 사용자가 로그인 페이지가 아닌 다른 곳으로 가려 할 때
  if (!session && pathname !== '/login') {
    // 로그인 페이지로 리다이렉트시킵니다.
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // 4. 이미 로그인 된 사용자가 로그인 페이지로 가려 할 때
  if (session && pathname === '/login') {
    // 메인 페이지로 리다이렉트시킵니다.
    const url = req.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }


  return res
}

// 미들웨어가 실행될 경로를 지정합니다.
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
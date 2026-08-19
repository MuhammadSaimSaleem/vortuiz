import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => 
            request.cookies.set(name, value)
          )

          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })

          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const currentPath = request.nextUrl.pathname

  const publicPages = ['/', '/auth', '/auth/callback', '/features', '/teachers', '/students', '/pricing']
  const isPublicPage = publicPages.includes(currentPath)

  // 1. Unauthenticated users trying to access protected pages
  if (!user && !isPublicPage) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth'
      url.searchParams.set('next', currentPath) 
      return NextResponse.redirect(url)
  }

  // 2. Authenticated user logic
  if (user) {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role;

    if (profileError) {
      console.error("proxy: failed to fetch profile role", profileError);
    }

    // A. If they try to go back to the home page or login page, send them to their dashboard
    if (currentPath === '/auth' || currentPath === '/') {
      // Role isn't set yet (e.g. mid-onboarding) or the lookup failed — don't
      // build a /undefineds/dashboard URL for an unknown role.
      if (role !== 'teacher' && role !== 'student') {
        if (currentPath === '/auth') {
          return response // let them stay on /auth to finish onboarding
        }
        return NextResponse.redirect(new URL('/auth', request.url));
      }
      return NextResponse.redirect(new URL(`/${role}s/dashboard`, request.url));
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
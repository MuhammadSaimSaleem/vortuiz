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

  const publicPages = ['/', '/auth', '/auth/callback', '/teachers', '/students', '/pricing']
  const isPublicPage = publicPages.includes(currentPath)

  // 1. Unauthenticated users trying to access protected pages
  if (!user && !isPublicPage) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth'
      url.searchParams.set('next', currentPath) 
      return NextResponse.redirect(url)
  }

  // 2. Authenticated users trying to access /auth OR the main landing page '/'
  if (user && (currentPath === '/auth' || currentPath === '/')) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role;

    if (role) {
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
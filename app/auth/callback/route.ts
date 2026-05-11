import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // 1. Grab the code from the URL (the one Google gave the user)
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const supabase = await createClient();
    
    // 2. Exchange the temporary code for a permanent session
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (!exchangeError) {
      const { data: { user } } = await supabase.auth.getUser();

      // 1. Fetch the profile, but specifically check the 'role'
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user?.id)
        .maybeSingle();

      // New user = identity just created AND no complete profile yet  
      const isNewUser = !profile || !profile.role;

      const userData = {
        isNewUser,
        email: user?.email,
        full_name: user?.user_metadata.full_name || user?.user_metadata.name,
        provider: user?.app_metadata.provider,
      };
    
    
      return new NextResponse(
        `
        <html>
          <body>
            <script>
              window.opener.postMessage(
                { type: 'auth-success', data: ${JSON.stringify(userData)} }, 
                window.location.origin
              );
              window.close();
            </script>
          </body>
        </html>
        `,
        { headers: { 'Content-Type': 'text/html' } }
      );
    }
  }
  // If something goes wrong, send them to an error page
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
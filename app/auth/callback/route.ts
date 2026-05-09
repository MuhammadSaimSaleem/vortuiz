import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // 1. Grab the code from the URL (the one Google gave the user)
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const supabase = await createClient();
    
    // 2. Exchange the temporary code for a permanent session
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    // Inside your auth/callback/route.ts
    const { data: { user } } = await supabase.auth.getUser();

    // Check if this is a fresh signup
    const identity = user?.identities?.[0];
    const identityIsNew = !!identity && identity.created_at === identity.updated_at;

    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user?.id)
      .maybeSingle();

    // New user = identity just created AND no complete profile yet  
    const isNewUser = identityIsNew || !existingProfile;

    const userData = {
      isNewUser,
      email: user?.email,
      full_name: user?.user_metadata.full_name || user?.user_metadata.name,
    };
    
    if(!error){
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
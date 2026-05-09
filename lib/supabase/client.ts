import { createBrowserClient } from '@supabase/ssr'

export const createClient = () => createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface ConnectGoogleProps {
  onNewUser?: () => void;
}

export const connectGoogle = async ({ onNewUser }: ConnectGoogleProps) => {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      skipBrowserRedirect: true,
    },
  });

  if (error || !data.url) {
    console.error("Error getting auth URL:", error?.message);
    return;
  }

  const width = 500;
  const height = 600;
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2;

  const popup = window.open(
    data.url,
    "Google Login",
    `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,status=yes`
  );

  if (!popup || popup.closed || typeof popup.closed === 'undefined') {
    console.error("Popup was blocked! Please enable popups for this site.");
    return;
  }

  const handleMessage = (event: MessageEvent) => {
    if (event.origin !== window.location.origin) return;
    if (event.data.type !== 'auth-success') return;

    window.removeEventListener('message', handleMessage);

    const { isNewUser } = event.data.data;

    if (isNewUser) {
      onNewUser?.();
    } else {
      window.location.href = '/students/dashboard';
    }
  };

  window.addEventListener('message', handleMessage);
};
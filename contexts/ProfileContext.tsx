'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Profile } from '@/lib/data';
import { supabase } from '@/lib/supabase/client';

interface ProfileContextType {
  profile: Profile | null | undefined;
  isLoading: boolean;
  error: Error | null;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  // supabase-js restores the session from storage asynchronously. If we call
  // supabase.auth.getUser() before that finishes, it looks like "no user" even
  // though the person is logged in, and the query below would resolve to a
  // false-negative `null` profile instead of waiting. onAuthStateChange fires
  // an INITIAL_SESSION event once the client has finished checking storage, so
  // we use that to know when it's actually safe to ask "who is the user?".
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'INITIAL_SESSION') {
        setAuthReady(true);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['current-user-profile'],
    enabled: authReady,
    queryFn: async () => {
      // 1. Get the current active Auth session user ID
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError) {
        // A stale/invalid refresh token (revoked session, expired, etc.) can otherwise
        // hang every subsequent Supabase call. Clear it out instead of leaving it stuck.
        await supabase.auth.signOut();
        return null;
      }

      if (!user) return null;

      // 2. Fetch the profile row + role-specific data via joins
      const { data, error: profileError } = await supabase
        .from('profiles')
        .select(`
          id, institution_id, full_name, email, role, avatar_url, avatar_initials,
          created_at, last_login_at, connected_google, connected_microsoft,
          two_factor_enabled, two_factor_method, email_notifications,
          push_notifications, sms_alerts, profile_visibility, dark_mode, language,
          password_last_changed_at,
          institutions ( name ),
          students ( student_code, department, grade_level, reg_id, overall_percentile, top_percentile, accuracy_rate, top_subject ),
          teachers ( teacher_code, department, primary_subject, class_size, students_avg_performance, change_in_performance )
        `)
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      // Flatten the joined institution/student/teacher rows into the shape the rest of the app expects
      const { students, teachers, institutions, ...base } = data as typeof data & {
        students: Record<string, unknown> | null;
        teachers: Record<string, unknown> | null;
        institutions: { name: string | null } | null;
      };
      const roleData = base.role === 'student' ? students : base.role === 'teacher' ? teachers : null;

      return {
        ...base,
        ...roleData,
        institution: institutions?.name ?? null,
      } as Profile;
    },
    staleTime: 1000 * 60 * 10, // Cache profile structure globally for 10 mins
    retry: 1,
  });

  return (
    <ProfileContext.Provider
      value={{ profile, isLoading: !authReady || isLoading, error }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}
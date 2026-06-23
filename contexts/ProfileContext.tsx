'use client';

import { createContext, useContext, ReactNode } from 'react';
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
  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['current-user-profile'],
    queryFn: async () => {
      // 1. Get the current active Auth session user ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // 2. Fetch the comprehensive profile row matching that ID
      const { data, error: profileError } = await supabase
        .from('profiles')
        .select(`
          id, institution_id, full_name, email, role, avatar_url, avatar_initials,
          created_at, last_login_at, department, primary_subject, class_size,
          grade_level, student_id, subject, connected_google, connected_microsoft,
          two_factor_enabled, two_factor_method, email_notifications,
          push_notifications, sms_alerts, profile_visibility, dark_mode, language
        `)
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;
      return data as Profile;
    },
    staleTime: 1000 * 60 * 10, // Cache profile structure globally for 10 mins
  });

  return (
    <ProfileContext.Provider value={{ profile, isLoading, error }}>
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
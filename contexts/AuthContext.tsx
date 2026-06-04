'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client'; 
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  role: string | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
  // Move the function definition inside the effect
  const fetchUserRole = async (currentUser: User) => {
    if (currentUser.user_metadata?.role) {
      setRole(currentUser.user_metadata.role);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', currentUser.id)
      .single();

    if (!error && data) {
      setRole(data.role);
    } else {
      setRole('user'); 
    }
    setLoading(false);
  };

  // Check active session on mount
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session?.user) {
      setUser(session.user);
      fetchUserRole(session.user);
    } else {
      setLoading(false);
    }
  });

  // Listen for auth state changes
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        await fetchUserRole(session.user);
      } else {
        setUser(null);
        setRole(null);
        setLoading(false);
      }
    }
  );

  return () => subscription.unsubscribe();
}, [supabase.auth, supabase]); // Add supabase.auth here just to satisfy the linter completely

  return (
    <AuthContext.Provider value={{ user, role, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
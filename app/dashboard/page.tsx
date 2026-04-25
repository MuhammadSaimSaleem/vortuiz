"use client"

// import { createClient } from '@/utils/supabase/server';
import TeacherView from './_components/TeacherView';
import StudentView from './_components/StudentView';
import { useUserRole } from '@/contexts/UserRoleContext';

export default function DashboardPage() {
  const {isTeacher, setRole} = useUserRole();


  // const supabase = createClient();
  
  // // 1. Get the current user session
  // const { data: { user } } = await supabase.auth.getUser();

  // // 2. Fetch the role from your custom 'profiles' table
  // const { data: profile } = await supabase
  //   .from('profiles')
  //   .select('role')
  //   .eq('id', user?.id)
  //   .single();

  // 3. Conditional Rendering
  if (isTeacher) {
    return <TeacherView />;
  }

  return <StudentView />;
}
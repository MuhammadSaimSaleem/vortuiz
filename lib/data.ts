export interface AnalyticsData {
  totalStudents: number | null;
  activeQuizzes: number | null;
  averagePerformance: number | null;
  changeFromPrev: number | null;
  engagementPerformance: number | null;
  engagementRate: number | null;
}

export type QuizStatus = 'completed' | 'available' | 'in_progress' | 'unavailable' | 'published' | 'draft';

export interface Quiz {
  id?: string;
  creator_id: string;
  subject_id: string;
  subjects: Subject[];
  name: string;
  topics: string;
  description: string;
  duration_minutes: number;
  grading_type: string;
  total_marks: number;
  passing_marks: number;
  question_count: number;
  difficulty: string;
  join_code: string;
  status: QuizStatus;
  participant_count: number;
  color_theme: string;
  created_at?: string;
  closed_at?: string | null;
}

export interface Student {
  id: string;
  user_id: string;
  top_percentile: number | null;
  overall_percentile: number | null;
  accuracy_rate: number | null;
  top_subject: string | null;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  slug: string;
  description: string | null;
  icon_name: string | null;
  color_theme: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer' | 'coding_response';

export interface Question {
  id: string;
  quiz_id: string;
  question: string;
  type: QuestionType;
  order_index: number;
  options?: string[]; 
  answer: string | null;
  marks: number;
}

export interface Profile {
  id: string;
  institution_id: string | null;
  institution: string | null;
  full_name: string | null;
  email: string;
  role: 'teacher' | 'student' | string | null; // Expand strings based on your roles
  avatar_url: string | null;
  avatar_initials: string | null;
  created_at: string;
  last_login_at: string | null;
  
  // Teacher / Staff specific fields
  department: string | null;
  primary_subject: string | null;
  class_size: number | null;
  grade_level: string | null;
  
  // Student specific fields
  student_code: string | null;
  subject: string | null;
  
  // Settings & Preferences
  connected_google: boolean;
  connected_microsoft: boolean;
  two_factor_enabled: boolean | null;
  two_factor_method: 'email' | 'sms' | 'totp' | null;
  email_notifications: boolean | null;
  push_notifications: boolean | null;
  sms_alerts: boolean | null;
  profile_visibility: 'public' | 'private' | string | null;
  dark_mode: 'light' | 'dark' | 'system' | string | null;
  language: string | null;
  password_last_changed_at: string | null;
}

export interface QuestionResponse {
  id: string;
  student_id: string;
  question_id: string;
  selected_option: string | null;
  time_spent_sec: number | null;
  flagged_for_review: boolean;
  text_response: string | null;
  is_correct: boolean | null;
  created_at: string;
}

export type AttemptStatus = 'completed' | 'in_progress';

export interface QuizAttemptRecord {
  id: string;
  quiz_id: string;
  student_id: string;
  score: number;
  percentage: number | null;
  status: string;
  avg_time_per_question_sec: number | null;
  started_at: string;
  submitted_at: string | null;
  time_spent_seconds: number | null;
}

export interface StudentResultSummary {
  student_id: string;
  full_name: string | null;
  avatar_url: string | null;
  avatar_initials: string | null;
  score: number;
  total_points: number;
  percentage: number;
  time_spent_seconds: number;
  status: string;
  started_at: string;
  submitted_at: string | null;
}
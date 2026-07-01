

/**
 * AUTH & USER ROLES
 * Used for sidebar logic and route protection.
 */
export type UserRole = 'student' | 'teacher' | 'admin';

// types/profile.ts


/**
 * QUIZ CONTENT
 * Core data structures for the Quiz Builder and Discovery.
 */

export interface Question {
  id: string;
  quiz_id: string;
  text: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  options?: string[]; // For multiple choice
  correct_answer: string;
  points: number;
}

export interface PerformanceStats {
  average_score: number;
  trend_percentage: number; // e.g., +3.1
  active_quizzes: number;
  total_students: number;
  engagement_rate: number; // e.g., 88%
}

/**
 * UI & NAVIGATION
 * Used for the Sidebar components we built.
 */
export interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  active?: boolean;
}

/**
 * PRO FEATURE TIER
 * For the "Upgrade Now" sidebar card.
 */
export type SubscriptionTier = 'free' | 'pro' | 'enterprise';


export interface SkillScore {
  subject: string;
  score: number;
}

export interface StudentProfileData {
  // Identity
  id: string;
  name: string;
  initials: string;
  avatar?: string;
  email?: string;
  parent?: string;
  groups?: string[];

  // Meta
  studentId: string;
  enrolled?: string;

  // Performance
  overallPercentile: number;
  percentileDelta?: number;
  topPercentile?: number;
  accuracyStudent?: number;
  accuracyClass?: number;
  topSubject?: string;
  topSubjectPercentile?: number;

  // Skills breakdown
  skills?: SkillScore[];

  // Behavioral section
  insights?: BehavioralInsight[];
  quizAttempts?: QuizAttempt[];
}

export interface StudentProfileProps {
  student: StudentProfileData;
  onBack?: () => void;
  onMessage?: (student: StudentProfileData) => void;
  onViewFullHistory?: () => void;
}

export interface BehavioralInsight {
  id: string;
  icon: "fast" | "review" | "resilience" | "methodical";
  title: string;
  description: string;
}

export interface QuizAttempt {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  score: number;
  maxScore: number;
  percentage: number;
  timePerQuestion: string;
  status: "PASSED" | "FAILED";
}

export interface BehavioralInsightsProps {
  insights?: BehavioralInsight[];
  quizAttempts?: QuizAttempt[];
  onViewFullHistory?: () => void;
}

export type ResourceFormat = "QUIZ" | "PDF" | "VIDEO" | "DOC" | "IMAGE" | "LESSON";
export type SortOption = "recently_added" | "name_asc" | "name_desc" | "rating" | "oldest";
export type ViewMode = "grid" | "list";
export type ToastKind = "success" | "error" | "info";

export interface Toast { id: string; message: string; kind: ToastKind; }

export interface Folder {
  id: string;
  name: string;
  color: string;
  resourceIds: string[];
  createdAt: Date;
}

export interface Resource {
  id: string;
  title: string;
  author: string;
  subject: string;
  grade: string;
  format: ResourceFormat;
  rating: number;
  ratingCount: number;
  coverColor: string;
  coverEmoji: string;
  folderId: string | null;
  starred: boolean;
  createdAt: Date;
  tags: string[];
}


// ===================================================================================
// ===================================================================================
// ===================================================================================
// ===================================================================================
// ===================================================================================
// ===================================================================================

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
  cover_gradient: string;
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

export type QuestionType = 'multiple-choice' | 'true-false' | 'short-answer';

export interface Question {
  id: string; // uuid, default: gen_random_uuid()
  quiz_id: string; // uuid, foreign key
  body: string;
  type: QuestionType;
  order_index: number; // default: 0
  points: number; // default: 1
  title: string | null;
  options?: string[]; // jsonb
  answer: string | null;
  feedback: string | null;
  topic: string | null;
}

export interface Profile {
  id: string;
  institution_id: string | null;
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
  student_id: string | null;
  subject: string | null;
  
  // Settings & Preferences
  connected_google: boolean;
  connected_microsoft: boolean;
  two_factor_enabled: boolean | null;
  two_factor_method: string | null;
  email_notifications: boolean | null;
  push_notifications: boolean | null;
  sms_alerts: boolean | null;
  profile_visibility: 'public' | 'private' | string | null;
  dark_mode: 'light' | 'dark' | 'system' | string | null;
  language: string | null;
  password_last_changed_at: string | null;
}
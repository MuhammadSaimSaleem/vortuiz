// types.ts

/**
 * AUTH & USER ROLES
 * Used for sidebar logic and route protection.
 */
export type UserRole = 'student' | 'teacher' | 'admin';

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  institution: string | null;
  role: string | null;
  avatar_initials: string | null;
  // Security / preferences stored in the same row
  two_factor_enabled: boolean | null;
  email_notifications: boolean | null;
  push_notifications: boolean | null;
  sms_alerts: boolean | null;
  profile_visibility: string | null;
  dark_mode: string | null;
  language: string | null;
  // Connected accounts (stored as simple booleans / metadata)
  connected_google: boolean | null;
  connected_microsoft: boolean | null;
  password_last_changed_days: number | null;
}

/**
 * QUIZ CONTENT
 * Core data structures for the Quiz Builder and Discovery.
 */
export type QuizStatus = 'active' | 'draft' | 'archived';

export interface Quiz {
  id: string;
  name?: string;
  subtitle?: string;
  instructorId?: string;
  title?: string;
  description?: string;
  joinCode: string; // e.g., "ARC-452"
  status: QuizStatus;
  participantCount?: number;
  createdAt?: string;
  subjectCategory?: string;
}

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

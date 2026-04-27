// types.ts

/**
 * AUTH & USER ROLES
 * Used for sidebar logic and route protection.
 */
export type UserRole = 'student' | 'teacher' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  organization?: string;
  created_at: string;
}

/**
 * QUIZ CONTENT
 * Core data structures for the Quiz Builder and Discovery.
 */
export type QuizStatus = 'active' | 'draft' | 'archived';

export interface Quiz {
  id: string;
  instructor_id: string;
  title: string;
  description: string;
  join_code: string; // e.g., "ARC-452"
  status: QuizStatus;
  participant_count: number;
  created_at: string;
  subject_category: string;
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

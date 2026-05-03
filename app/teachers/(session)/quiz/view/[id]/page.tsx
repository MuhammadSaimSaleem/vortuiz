"use client";

import Link from "next/link";
import { notFound, useParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Clock,
  FileText,
  Flag,
  Shield,
  Star,
  Timer,
  Wifi,
  PlayCircle,
  ChevronLeft,
  BookOpen,
  FlaskConical,
  Globe,
  Sigma,
} from "lucide-react";

// ─── All quiz data ─────────────────────────────────────────────────────────────
const QUIZZES = [
  {
    id: "advanced-biology",
    title: "Advanced Biology Quiz",
    subject: "Biology",
    subjectIcon: <FlaskConical className="h-4 w-4" />,
    subjectColor: "bg-emerald-100 text-emerald-700",
    description:
      "A comprehensive assessment covering molecular genetics, evolutionary biology, and complex cellular structures.",
    level: "Advanced Level",
    difficulty: "Advanced",
    duration: 45,
    questions: 30,
    passingScore: 70,
    coverGradient: "from-blue-950 via-indigo-900 to-blue-800",
    coverAccent: "bg-blue-400/10",
    dotColor: "white",
    textColor: "text-blue-200",
    topics: [
      "Molecular Genetics",
      "Evolutionary Theory",
      "Cell Biology",
      "Photosynthesis",
      "Ecology",
      "Metabolic Pathways",
    ],
    assignedLearner: {
      name: "Alex Johnson",
      role: "Biology Major, Year 3",
      initials: "AJ",
      avatarGradient: "from-blue-900 to-indigo-700",
    },
    stats: { rating: 4.8, attempts: 1284, avgScore: 74 },
    instructions: [
      {
        icon: <Wifi className="h-4 w-4" />,
        color: "bg-blue-100 text-blue-600",
        text: "Ensure you have a stable internet connection before beginning the quiz.",
      },
      {
        icon: <Timer className="h-4 w-4" />,
        color: "bg-amber-100 text-amber-600",
        text: "The countdown timer starts the moment you click 'Start Quiz' and cannot be paused.",
      },
      {
        icon: <Flag className="h-4 w-4" />,
        color: "bg-rose-100 text-rose-600",
        text: "You can flag difficult questions to return to them later using the bookmark feature.",
      },
    ],
  },
  {
    id: "algebra-fundamentals",
    title: "Algebra Fundamentals",
    subject: "Mathematics",
    subjectIcon: <Sigma className="h-4 w-4" />,
    subjectColor: "bg-orange-100 text-orange-700",
    description:
      "Master the core concepts of algebra including linear and quadratic equations, inequalities, and functions.",
    level: "Intermediate Level",
    difficulty: "Intermediate",
    duration: 30,
    questions: 20,
    passingScore: 65,
    coverGradient: "from-orange-950 via-amber-900 to-yellow-800",
    coverAccent: "bg-amber-400/10",
    dotColor: "white",
    textColor: "text-amber-200",
    topics: [
      "Linear Equations",
      "Quadratic Functions",
      "Inequalities",
      "Systems of Equations",
      "Factorisation",
      "Graphing",
    ],
    assignedLearner: {
      name: "Sarah Mitchell",
      role: "Mathematics, Year 2",
      initials: "SM",
      avatarGradient: "from-orange-800 to-amber-600",
    },
    stats: { rating: 4.6, attempts: 976, avgScore: 71 },
    instructions: [
      {
        icon: <Wifi className="h-4 w-4" />,
        color: "bg-orange-100 text-orange-600",
        text: "A stable connection is required — your progress is saved automatically every 2 minutes.",
      },
      {
        icon: <Timer className="h-4 w-4" />,
        color: "bg-amber-100 text-amber-600",
        text: "You have 30 minutes once you click 'Start Quiz'. The timer cannot be paused.",
      },
      {
        icon: <Flag className="h-4 w-4" />,
        color: "bg-rose-100 text-rose-600",
        text: "Flag any question to revisit it before the final submission.",
      },
    ],
  },
  {
    id: "world-geography",
    title: "World Geography",
    subject: "Geography",
    subjectIcon: <Globe className="h-4 w-4" />,
    subjectColor: "bg-teal-100 text-teal-700",
    description:
      "Explore physical geography, countries, capitals, climate zones and human geography concepts.",
    level: "Beginner Level",
    difficulty: "Beginner",
    duration: 25,
    questions: 25,
    passingScore: 60,
    coverGradient: "from-teal-950 via-cyan-900 to-teal-800",
    coverAccent: "bg-teal-400/10",
    dotColor: "white",
    textColor: "text-teal-200",
    topics: [
      "Continents & Oceans",
      "Climate Zones",
      "Physical Features",
      "Human Geography",
      "Map Skills",
      "Population",
    ],
    assignedLearner: {
      name: "Jamie Torres",
      role: "Geography, Year 1",
      initials: "JT",
      avatarGradient: "from-teal-800 to-cyan-600",
    },
    stats: { rating: 4.3, attempts: 2105, avgScore: 78 },
    instructions: [
      {
        icon: <Wifi className="h-4 w-4" />,
        color: "bg-teal-100 text-teal-600",
        text: "Ensure a stable connection before starting — the quiz includes interactive map questions.",
      },
      {
        icon: <Timer className="h-4 w-4" />,
        color: "bg-amber-100 text-amber-600",
        text: "You have 25 minutes. The timer begins immediately on 'Start Quiz'.",
      },
      {
        icon: <Flag className="h-4 w-4" />,
        color: "bg-rose-100 text-rose-600",
        text: "Bookmark any question to come back to it before you submit.",
      },
    ],
  },
  {
    id: "cell-biology-intro",
    title: "Cell Biology Intro",
    subject: "Biology",
    subjectIcon: <FlaskConical className="h-4 w-4" />,
    subjectColor: "bg-emerald-100 text-emerald-700",
    description:
      "Introduction to cell theory, organelles, cell division, and membrane transport mechanisms.",
    level: "Beginner Level",
    difficulty: "Beginner",
    duration: 20,
    questions: 15,
    passingScore: 60,
    coverGradient: "from-green-950 via-emerald-900 to-green-800",
    coverAccent: "bg-green-400/10",
    dotColor: "white",
    textColor: "text-emerald-200",
    topics: [
      "Cell Theory",
      "Organelles",
      "Mitosis & Meiosis",
      "Membrane Transport",
      "Prokaryotes vs Eukaryotes",
      "Cell Cycle",
    ],
    assignedLearner: {
      name: "Priya Nair",
      role: "Biology, Year 1",
      initials: "PN",
      avatarGradient: "from-green-800 to-emerald-600",
    },
    stats: { rating: 4.9, attempts: 3412, avgScore: 82 },
    instructions: [
      {
        icon: <Wifi className="h-4 w-4" />,
        color: "bg-emerald-100 text-emerald-600",
        text: "A stable connection ensures diagrams and images load correctly during the quiz.",
      },
      {
        icon: <Timer className="h-4 w-4" />,
        color: "bg-amber-100 text-amber-600",
        text: "20-minute timer begins on 'Start Quiz' and cannot be paused.",
      },
      {
        icon: <Flag className="h-4 w-4" />,
        color: "bg-rose-100 text-rose-600",
        text: "Flag uncertain questions and return before submitting.",
      },
    ],
  },
  {
    id: "calculus-derivatives",
    title: "Calculus: Derivatives",
    subject: "Mathematics",
    subjectIcon: <Sigma className="h-4 w-4" />,
    subjectColor: "bg-orange-100 text-orange-700",
    description:
      "Deep dive into differential calculus — limits, derivative rules, and real-world optimisation applications.",
    level: "Advanced Level",
    difficulty: "Advanced",
    duration: 60,
    questions: 35,
    passingScore: 75,
    coverGradient: "from-rose-950 via-pink-900 to-rose-800",
    coverAccent: "bg-pink-400/10",
    dotColor: "white",
    textColor: "text-rose-200",
    topics: [
      "Limits",
      "Derivative Rules",
      "Chain Rule",
      "Product & Quotient Rule",
      "Implicit Differentiation",
      "Optimisation",
    ],
    assignedLearner: {
      name: "David Chen",
      role: "Mathematics, Year 4",
      initials: "DC",
      avatarGradient: "from-rose-900 to-pink-700",
    },
    stats: { rating: 4.7, attempts: 641, avgScore: 66 },
    instructions: [
      {
        icon: <Wifi className="h-4 w-4" />,
        color: "bg-rose-100 text-rose-600",
        text: "Stable internet required — answers auto-save every 90 seconds.",
      },
      {
        icon: <Timer className="h-4 w-4" />,
        color: "bg-amber-100 text-amber-600",
        text: "60-minute exam — the timer is strict and cannot be stopped once started.",
      },
      {
        icon: <Flag className="h-4 w-4" />,
        color: "bg-rose-100 text-rose-600",
        text: "Bookmark complex problems to revisit before final submission.",
      },
    ],
  },
  {
    id: "literature-analysis",
    title: "Literature Analysis",
    subject: "English",
    subjectIcon: <BookOpen className="h-4 w-4" />,
    subjectColor: "bg-violet-100 text-violet-700",
    description:
      "Critical reading and literary analysis of prose, poetry, and drama from world literature.",
    level: "Intermediate Level",
    difficulty: "Intermediate",
    duration: 40,
    questions: 22,
    passingScore: 65,
    coverGradient: "from-violet-950 via-purple-900 to-violet-800",
    coverAccent: "bg-violet-400/10",
    dotColor: "white",
    textColor: "text-violet-200",
    topics: [
      "Poetry Analysis",
      "Prose Techniques",
      "Themes & Motifs",
      "Literary Devices",
      "Character Study",
      "Contextual Analysis",
    ],
    assignedLearner: {
      name: "Elena Rossi",
      role: "English Literature, Year 3",
      initials: "ER",
      avatarGradient: "from-violet-900 to-purple-700",
    },
    stats: { rating: 4.5, attempts: 889, avgScore: 73 },
    instructions: [
      {
        icon: <Wifi className="h-4 w-4" />,
        color: "bg-violet-100 text-violet-600",
        text: "Stable connection ensures all passage excerpts load fully before the timer starts.",
      },
      {
        icon: <Timer className="h-4 w-4" />,
        color: "bg-amber-100 text-amber-600",
        text: "40 minutes once started — read each passage carefully before answering.",
      },
      {
        icon: <Flag className="h-4 w-4" />,
        color: "bg-rose-100 text-rose-600",
        text: "Flag questions you want to re-read and return to before submitting.",
      },
    ],
  },
] as const;

type QuizId = (typeof QUIZZES)[number]["id"];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function QuizDetailPage() {
  const params  = useParams<{ id: string }>();
  const quiz    = QUIZZES.find(q => q.id === params.id);

  const pathname = usePathname();

  if (!quiz) notFound();

  return (
    <div className="min-h-full bg-surface">
      {/* Back breadcrumb */}
      <div className="px-6 pt-5 pb-0">
        <Link
          href="/student/quiz/view"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-subtitle hover:text-brand-navy transition-colors group"
        >
          <ChevronLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
          Back to My Quizzes
        </Link>
      </div>

      <div className="p-6 space-y-5 max-w-400">
        {/* ── Hero cover ── */}
        <div className={`relative rounded-2xl overflow-hidden bg-gradient-to-br ${quiz.coverGradient} h-56`}>
          {/* Decorative blobs */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-[-60px] right-[-60px] w-64 h-64 rounded-full bg-white/5 blur-2xl" />
            <div className={`absolute bottom-[-40px] left-[40%] w-48 h-48 rounded-full ${quiz.coverAccent} blur-2xl`} />
          </div>
          {/* Dot pattern */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
          <div className="absolute bottom-6 left-7 right-7">
            {/* Level badge */}
            <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm border border-white/25 text-white text-[11px] font-bold px-3 py-1.5 rounded-full mb-3">
              <Star className="h-3 w-3 fill-white" />
              {quiz.level.toUpperCase()}
            </span>
            <h1 className="text-3xl font-bold text-white tracking-tight drop-shadow-sm">
              {quiz.title}
            </h1>
            <p className={`${quiz.textColor} text-sm mt-1.5 leading-relaxed max-w-xl`}>
              {quiz.description}
            </p>
          </div>
        </div>

        {/* ── Quick Stats + Instructions ── */}
        <div className="grid grid-cols-2 gap-5">
          {/* Quick Stats */}
          <div className="rounded-2xl border border-border bg-white p-6">
            <h2 className="text-base font-bold text-brand-dark mb-5">Quick Stats</h2>
            <div className="space-y-4">
              {[
                { icon: <Clock   className="h-4 w-4 text-brand-blue" />, label: "Duration",      value: `${quiz.duration} mins`  },
                { icon: <FileText className="h-4 w-4 text-brand-blue" />, label: "Questions",    value: `${quiz.questions} Items` },
                { icon: <Shield  className="h-4 w-4 text-brand-blue" />, label: "Passing Score", value: `${quiz.passingScore}%`   },
              ].map(({ icon, label, value }) => (
                <div key={label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-sm text-brand-subtitle">
                    {icon}{label}
                  </div>
                  <span className="text-sm font-bold text-brand-navy">{value}</span>
                </div>
              ))}
            </div>

            {/* Divider + extra stats */}
            <div className="mt-5 pt-4 border-t border-border grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-xs text-brand-subtitle">Rating</p>
                <p className="text-sm font-bold text-brand-dark mt-0.5">{quiz.stats.rating} ★</p>
              </div>
              <div>
                <p className="text-xs text-brand-subtitle">Attempts</p>
                <p className="text-sm font-bold text-brand-dark mt-0.5">{quiz.stats.attempts.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-brand-subtitle">Avg Score</p>
                <p className="text-sm font-bold text-brand-dark mt-0.5">{quiz.stats.avgScore}%</p>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="rounded-2xl border border-border bg-white p-6">
            <h2 className="text-base font-bold text-brand-dark mb-5">Instructions</h2>
            <div className="space-y-4">
              {quiz.instructions.map(({ icon, color, text }, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${color}`}>
                    {icon}
                  </div>
                  <p className="text-sm text-brand-subtitle leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Topics Covered ── */}
        <div className="rounded-2xl border border-border bg-white p-6">
          <h2 className="text-base font-bold text-brand-dark mb-4">Topics Covered</h2>
          <div className="flex flex-wrap gap-2">
            {quiz.topics.map(topic => (
              <span
                key={topic}
                className="text-sm font-medium text-brand-navy bg-brand-light border border-brand-light px-4 py-1.5 rounded-full hover:bg-blue-100 transition-colors cursor-default"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>

        {/* ── Assigned learner + CTA ── */}
        <div className="rounded-2xl border border-border bg-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`h-12 w-12 rounded-full bg-gradient-to-br ${quiz.assignedLearner.avatarGradient} flex items-center justify-center shrink-0`}>
              <span className="text-sm font-bold text-white">{quiz.assignedLearner.initials}</span>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-brand-subtitle mb-0.5">
                Assigned Learner
              </p>
              <p className="text-lg font-bold text-brand-dark">{quiz.assignedLearner.name}</p>
              <p className="text-sm text-brand-subtitle">{quiz.assignedLearner.role}</p>
            </div>
          </div>

          <Link href={`${pathname}/take`}>
            <Button
              className="bg-brand-navy hover:bg-brand-blue text-white font-bold text-base px-8 rounded-2xl gap-3 transition-all duration-200 hover:shadow-lg hover:shadow-brand-navy/25 hover:scale-[1.02]"
              style={{ height: "52px" }}
            >
              Start Quiz
              <PlayCircle className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
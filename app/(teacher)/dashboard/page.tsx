"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Bell,
  BookOpen,
  ChevronRight,
  Download,
  Plus,
  Share2,
  TrendingUp,
  Users,
  ClipboardList,
} from "lucide-react";

// --- Types ---
type QuizStatus = "ACTIVE" | "DRAFT";

interface Quiz {
  id: string;
  name: string;
  subtitle: string;
  joinCode: string;
  status: QuizStatus;
  participants: number;
}

// --- Data ---
const quizzes: Quiz[] = [
  { id: "1", name: "Modern Architecture History", subtitle: "Midterm Preparation", joinCode: "ARC-452", status: "ACTIVE", participants: 142 },
  { id: "2", name: "Quantum Physics Basics", subtitle: "Weekly Knowledge Check", joinCode: "PHY-991", status: "DRAFT", participants: 0 },
  { id: "3", name: "Introduction to UX Design", subtitle: "Case Study Review", joinCode: "DES-021", status: "ACTIVE", participants: 86 },
  { id: "4", name: "Macroeconomics 101", subtitle: "Final Semester Revision", joinCode: "ECO-111", status: "ACTIVE", participants: 312 },
];

// --- Sub-components ---

function StatusBadge({ status }: { status: QuizStatus }) {
  const isActive = status === "ACTIVE";
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${isActive ? "text-emerald-600" : "text-brand-subtitle"}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`} />
      {status}
    </span>
  );
}

function JoinCodeBadge({ code }: { code: string }) {
  return (
    <span className="inline-flex items-center rounded-md bg-blue-50 px-2.5 py-1 text-xs font-bold text-brand-blue tracking-wide font-mono border border-blue-100">
      {code}
    </span>
  );
}

function CircleProgress({ value }: { value: number }) {
  const r = 32;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" className="-rotate-90">
      <circle cx="40" cy="40" r={r} fill="none" stroke="#F1F5F9" strokeWidth="6" />
      <circle
        cx="40" cy="40" r={r} fill="none"
        stroke="#10b981" strokeWidth="6"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function TeacherDashboard() {
  const [search, setSearch] = useState("");

  return (
    <div className="bg-surface flex-1 flex flex-col min-h-screen">

      {/* Main Content */}
      <main className="p-8 max-w-400 mx-auto w-full space-y-8">
        {/* Page Header */}
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-brand-navy tracking-tight">Teacher&apos;s Dashboard</h1>
            <p className="text-slate-500 mt-1 text-base">Welcome back, Professor Abdullah. Here is what&apos;s happening today.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="h-11 px-5 gap-2 border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 shadow-sm">
              <Download className="h-4 w-4" />
              Export Report
            </Button>
            <Button className="h-11 px-5 gap-2 bg-brand-navy hover:bg-brand-navy/90 text-white rounded-xl shadow-md transition-all">
              <Plus className="h-4 w-4" />
              Create New Quiz
            </Button>
          </div>
        </div>

        {/* Top Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-slate-100 shadow-soft rounded-2xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <Users className="h-5 w-5 text-slate-600" />
                </div>
                <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 border-none font-bold">+12%</Badge>
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-brand-subtitle">Total Students</p>
              <p className="text-4xl font-black text-slate-900 mt-1">1,284</p>
            </CardContent>
          </Card>

          <Card className="border-slate-100 shadow-soft rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <ClipboardList className="h-5 w-5 text-slate-600" />
                </div>
                <span className="text-xs font-bold text-brand-subtitle uppercase tracking-widest">Steady</span>
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-brand-subtitle">Active Quizzes</p>
              <p className="text-4xl font-black text-slate-900 mt-1">24</p>
            </CardContent>
          </Card>

          <Card className="border-none col-span-2 shadow-lg bg-linear-to-br from-brand-navy to-brand-blue text-white rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div className="flex gap-1 items-end h-6">
                  {[2, 4, 3, 6, 5].map((h, i) => (
                    <div key={i} style={{ height: `${h * 4}px` }} className="w-1 rounded-full bg-white/40" />
                  ))}
                </div>
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-blue-100">Average Performance</p>
              <div className="flex items-baseline gap-2 mt-1">
                <p className="text-4xl font-black">82.4%</p>
                <p className="text-xs font-medium text-blue-200">↑ 3.1%</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Grid Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Table Area */}
          <Card className="lg:col-span-2 border-slate-100 shadow-soft rounded-2xl h-fit">
            <CardHeader className="px-6 pt-6 pb-2 flex-row items-center justify-between">
              <CardTitle className="text-lg font-bold text-slate-900">Recent Quizzes</CardTitle>
              <Button variant="link" className="text-brand-blue font-bold hover:no-underline">View All</Button>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-100 hover:bg-transparent">
                    <TableHead className="text-[10px] font-bold uppercase tracking-widest text-brand-subtitle">Quiz Name</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-widest text-brand-subtitle">Join Code</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-widest text-brand-subtitle">Status</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-widest text-brand-subtitle text-right">Participants</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quizzes.map((quiz) => (
                    <TableRow key={quiz.id} className="border-slate-100 group cursor-pointer transition-colors">
                      <TableCell className="py-4">
                        <p className="text-sm font-bold text-slate-800 group-hover:text-brand-blue transition-colors">{quiz.name}</p>
                        <p className="text-xs text-brand-subtitle font-medium">{quiz.subtitle}</p>
                      </TableCell>
                      <TableCell><JoinCodeBadge code={quiz.joinCode} /></TableCell>
                      <TableCell><StatusBadge status={quiz.status} /></TableCell>
                      <TableCell className="text-right text-sm font-bold text-slate-700">{quiz.participants}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Right Sidebar Area */}
          <div className="space-y-6">
            <Card className="border-slate-100 shadow-soft rounded-2xl">
              <CardHeader className="px-6 pt-6 pb-4">
                <CardTitle className="text-lg font-bold text-slate-900">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-6 space-y-2">
                {[
                  { icon: Plus, label: "Create New Quiz", sub: "Start a fresh assessment" },
                  { icon: BookOpen, label: "Manage Question Bank", sub: "Browse 2,400 questions" },
                  { icon: Share2, label: "Share Materials", sub: "Send to other educators" },
                ].map(({ icon: Icon, label, sub }) => (
                  <button key={label} className="flex w-full items-center gap-4 rounded-xl p-3 hover:bg-slate-50 transition-all group border border-transparent hover:border-slate-100">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 group-hover:bg-brand-blue/10 transition-colors">
                      <Icon className="h-5 w-5 text-slate-600 group-hover:text-brand-blue" />
                    </div>
                    <div className="text-left flex-1">
                      <p className="text-sm font-bold text-slate-700">{label}</p>
                      <p className="text-[11px] text-brand-subtitle font-medium">{sub}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500" />
                  </button>
                ))}
              </CardContent>
            </Card>

            <Card className="border-slate-100 shadow-soft rounded-2xl">
              <CardHeader className="px-6 pt-6 pb-4">
                <CardTitle className="text-lg font-bold text-slate-900">Engagement Insights</CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <div className="flex items-center gap-5 mb-6">
                  <div className="relative flex items-center justify-center">
                    <CircleProgress value={88} />
                    <span className="absolute text-lg font-black text-slate-800">88%</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 leading-tight">Engagement Rate</p>
                    <p className="text-xs text-brand-subtitle font-medium mt-1">Top 5% in organization</p>
                  </div>
                </div>
                <div className="flex items-end gap-1.5 h-30">
                  {[30, 50, 45, 70, 85, 80, 95].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t-md transition-all duration-500"
                      style={{ 
                        height: `${h}%`, 
                        backgroundColor: h >= (Math.random() * 10) ? 'var(--brand-blue)' : 'var(--brand-light)' 
                      }}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
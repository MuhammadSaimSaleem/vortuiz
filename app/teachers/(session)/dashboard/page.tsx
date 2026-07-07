"use client";

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
  ChevronRight,
  Download,
  Plus,
  Share2,
  TrendingUp,
  Users,
  ClipboardList,
  Check,
} from "lucide-react";
import { AnalyticsData, Quiz } from "@/lib/data";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CircleProgress, StatusBadge } from "@/components/ui/customUI";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/toast";

export default function TeacherDashboard() {
  const router = useRouter();
  const [ analyticsData, setAnalyticsData ] = useState<AnalyticsData | null>(null);
  const [ quizData, setQuizData ] = useState<Quiz[] | null>(null);

  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAll() {
      const {  data: { user }, error: profileError } = await supabase.auth.getUser();

      if( profileError ) console.log('Profile Fetch Error');

      const { count: studentCount, error: affError } = await supabase
        .from('student_teacher_affiliations')
        .select('*', {count: 'exact'})
        .eq('teacher_id', user?.id);

      if(affError) console.log(affError);

      const { data: quizData, count: quizCount, error: quizError } = await supabase
        .from('quizzes')
        .select(`
          id, 
          name, 
          description,
          status,
          join_code, 
          participant_count
        `, { count: "exact"})
        .eq('creator_id', user?.id)
        .limit(4);

      if (quizError) console.log('Error Fetching Quiz Data', quizError);

      const { data: teacherData, error: teacherError } = await supabase
        .from('teachers')
        .select('students_avg_performance, change_in_performance')
        .eq('user_id', user?.id)
        .single();

      if (teacherError) console.log(teacherError);

      setAnalyticsData(prev => ({
        totalStudents: studentCount ?? null,
        activeQuizzes: quizCount ?? null,
        averagePerformance: teacherData?.students_avg_performance ?? null,
        changeFromPrev: teacherData?.change_in_performance ?? null,
        engagementPerformance: prev?.engagementPerformance ?? null,
        engagementRate: prev?.engagementRate ?? null,
      }));

      const formattedQuizzes = quizData?.map(quiz => ({
        id: quiz.id,
        name: quiz.name,
        description: quiz.description,
        join_code: quiz.join_code,
        status: quiz.status,
        participant_count: quiz.participant_count,
      })) as Quiz[];

      setQuizData(formattedQuizzes);
    }

    fetchAll();
  })
      

  function handleCopyJoinCode(joinCode: string) {
    if (!joinCode) return;
    navigator.clipboard.writeText(joinCode).then(() => {
      setCopiedCode(joinCode);
      toast("Join Code copied to clipboard!", "success")
      setTimeout(() => setCopiedCode(prev => (prev === joinCode ? null : prev)), 1500);
    });
  }

  return (
    <div className="bg-surface flex-1 flex flex-col min-h-screen">

      {/* Main Content */}
      <main className="p-8 max-w-400 mx-auto w-full space-y-8">
        {/* Page Header */}
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-brand-navy tracking-tight">Teacher&apos;s Dashboard</h1>
            <p className="text-slate-500 mt-1 text-base">Welcome back. Here is what&apos;s happening today.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="h-11 px-5 gap-2 border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 shadow-sm">
              <Download className="h-4 w-4" />
              Export Report
            </Button>
            <Link href={'/teachers/quiz/create'}>
              <Button className="h-11 px-5 gap-2 bg-brand-navy hover:bg-brand-navy/90 text-white rounded-xl shadow-md transition-all">
                <Plus className="h-4 w-4" />
                Create New Quiz
              </Button>
            </Link>
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
              <p className="text-4xl font-black text-brand-navy mt-1">{analyticsData?.totalStudents }</p>
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
              <p className="text-4xl font-black text-brand-navy mt-1">{analyticsData?.activeQuizzes }</p>
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
                <p className="text-4xl font-black">{analyticsData?.averagePerformance }%</p>
                <p className="text-xs font-medium text-blue-200">↑ {analyticsData?.changeFromPrev }%</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Grid Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Table Area */}
          <Card className="lg:col-span-2 border-slate-100 shadow-soft rounded-2xl h-fit">
            <CardHeader className="px-6 pt-6 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold text-brand-navy">Recent Quizzes</CardTitle>
                <Link href={'/teachers/quiz/view'}><Button variant="link" className="text-brand-blue font-bold hover:no-underline">View All</Button></Link>
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-100 hover:bg-transparent">
                    <TableHead className="text-[10px] font-bold uppercase tracking-widest text-brand-subtitle">Quiz Name</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-widest text-brand-subtitle text-center">Join Code</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-widest text-brand-subtitle text-center">Status</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-widest text-brand-subtitle text-center">Participants</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quizData?.map((quiz) => (
                    <TableRow key={quiz.id} className="border-slate-100 group transition-colors">
                      <TableCell 
                        className="max-w-90 py-4 cursor-pointer"
                        onClick={() => router.push(`/teachers/quiz/${quiz.id}/view`)}>
                        <p className="text-sm font-bold text-slate-800 group-hover:text-brand-blue transition-colors">{quiz.name}</p>
                        <p className="text-xs text-brand-subtitle font-medium truncate">{quiz.description}</p>
                      </TableCell>
                      <TableCell 
                        className="text-center  cursor-pointer"
                        onClick={() => handleCopyJoinCode(quiz.join_code)}
                      >
                        <span className={`inline-flex items-center rounded-md bg-blue-50 px-2.5 py-1 text-xs font-bold ${copiedCode === quiz.join_code ? "text-green-600" : "text-brand-navy"} transition-all tracking-wide font-mono border border-blue-100`}>
                          {copiedCode === quiz.join_code ? <Check className="h-3.5 w-3.5 text-emerald-500 mr-1"/> : ""}
                          {copiedCode === quiz.join_code ? "Copied" : quiz.join_code}
                        </span>
                      </TableCell>
                      <TableCell className="text-center"><StatusBadge status={quiz.status} /></TableCell>
                      <TableCell className="text-center text-sm font-bold text-slate-700">{quiz.participant_count}</TableCell>
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
                <CardTitle className="text-lg font-bold text-brand-navy">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-6 space-y-2">
                {[
                  { icon: Plus, label: "Create New Quiz", sub: "Start a fresh assessment", link: "/teachers/quiz/create" },
                  { icon: Share2, label: "Share Materials", sub: "Send to other educators", link: "/share-material" }, //should open a modal
                ].map(({ icon: Icon, label, sub, link}) => (
                  <button key={label} className="flex w-full items-center rounded-xl p-3 hover:bg-slate-50 transition-all group border border-transparent hover:border-slate-100">
                    <Link href={link} className="flex w-full items-center gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 group-hover:bg-brand-blue/10 transition-colors">
                        <Icon className="h-5 w-5 text-slate-600 group-hover:text-brand-blue" />
                      </div>
                      <div className="text-left flex-1">
                        <p className="text-sm font-bold text-slate-700">{label}</p>
                        <p className="text-[11px] text-brand-subtitle font-medium">{sub}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500" />
                    </Link>
                  </button>
                ))}
              </CardContent>
            </Card>

            <Card className="border-slate-100 shadow-soft rounded-2xl">
              <CardHeader className="px-6 pt-6 pb-4">
                <CardTitle className="text-lg font-bold text-brand-navy">Engagement Insights</CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <div className="flex items-center gap-5 mb-6">
                  <div className="relative flex items-center justify-center">
                    <CircleProgress value={analyticsData?.engagementRate ?? 0} />
                    <span className="absolute text-lg font-black text-slate-800">{analyticsData?.engagementRate }%</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 leading-tight">Engagement Rate</p>
                    <p className="text-xs text-brand-subtitle font-medium mt-1">Top {analyticsData?.engagementPerformance }% in organization</p>
                  </div>
                </div>
                  {[30, 50, 45, 70, 85, 80, 95].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t-md transition-all duration-500"
                      style={{ 
                        height: `${h}%`, 
                        backgroundColor: h >= 50 ? 'var(--brand-blue)' : 'var(--brand-light)' 
                      }}
                    />
                  ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
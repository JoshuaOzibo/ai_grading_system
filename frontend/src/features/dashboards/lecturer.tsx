import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Brain, FileText, Users, Trophy, PlusCircle, Sparkles, Download, Loader2, BookOpen, ArrowRight, BarChart3 } from "lucide-react";
import { useState } from "react";
import { api } from "@/lib/api-client";
import { useRole } from "@/lib/role-context";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";

interface Exam {
  id: string;
  title: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
}

interface ExamStats {
  exam: {
    id: string;
    title: string;
    status: string;
  };
  stats: {
    totalSubmissions: number;
    averageScore: number;
    highestScore: number;
    lowestScore: number;
    statusDistribution: { status: string; count: number }[];
  };
}

interface Submission {
  id: string;
  examId: string;
  studentId: string;
  score: number | null;
  status: "STARTED" | "SUBMITTED" | "GRADED";
  startedAt: string;
  submittedAt: string | null;
  student?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export function LecturerDashboard() {
  const navigate = useNavigate();
  const { user } = useRole();
  const [selectedExamId, setSelectedExamId] = useState<string>("");

  // Fetch Exams list owned by lecturer
  const { data: examsData, isLoading: isLoadingExams } = useQuery({
    queryKey: ["exams"],
    queryFn: async () => {
      const res = await api.get<{ data: Exam[] }>("/exams");
      return res.data;
    },
  });

  const exams = examsData || [];
  const activeExamId = selectedExamId || (exams.length > 0 ? exams[0].id : "");

  // Fetch Exam Analytics
  const { data: analyticsData, isLoading: isLoadingAnalytics } = useQuery({
    queryKey: ["exam-analytics", activeExamId],
    queryFn: async () => {
      if (!activeExamId) return null;
      const res = await api.get<{ data: ExamStats }>(`/analytics/exam/${activeExamId}`);
      return res.data;
    },
    enabled: !!activeExamId,
  });

  // Fetch recent submissions for the selected exam
  const { data: submissionsData, isLoading: isLoadingSubmissions } = useQuery({
    queryKey: ["submissions", activeExamId],
    queryFn: async () => {
      if (!activeExamId) return [];
      const res = await api.get<{ data: Submission[] }>(`/exams/${activeExamId}/submissions`);
      return res.data;
    },
    enabled: !!activeExamId,
  });

  // Greet with user's first name
  const greetingName = user?.firstName || (user?.lastName ? `Dr. ${user.lastName}` : "Lecturer");

  // Determine greeting based on current time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  // Compute stats
  const stats = analyticsData?.stats;
  const averageScore = stats ? Math.round(stats.averageScore) : 0;
  const highestScore = stats ? stats.highestScore : 0;
  const lowestScore = stats ? stats.lowestScore : 0;
  const totalSubmissions = stats ? stats.totalSubmissions : 0;

  // Build chart distribution data based on statusDistribution
  const chartData = stats?.statusDistribution.map((sd) => ({
    name: sd.status.toLowerCase(),
    submissions: sd.count,
  })) || [
    { name: "started", submissions: 0 },
    { name: "submitted", submissions: 0 },
    { name: "graded", submissions: 0 },
  ];

  const gradedCount = stats?.statusDistribution.find((s) => s.status === "GRADED")?.count || 0;
  const completionRate = totalSubmissions > 0 ? Math.round((gradedCount / totalSubmissions) * 100) : 0;

  const handleExport = () => {
    if (!stats) return;
    const csvContent =
      "data:text/csv;charset=utf-8," +
      `Metric,Value\n` +
      `Exam,${analyticsData.exam.title}\n` +
      `Total Submissions,${totalSubmissions}\n` +
      `Average Score,${averageScore}\n` +
      `Highest Score,${highestScore}\n` +
      `Lowest Score,${lowestScore}\n`;
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `exam_analytics_${activeExamId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderBoldFirstLetter = (str: string) => {
    if (!str) return "";
    return (
      <span>
        <span className="font-bold">{str.charAt(0).toUpperCase()}</span>
        {str.slice(1)}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={<>{getGreeting()}, {renderBoldFirstLetter(greetingName)}</>}
        description="Here's a review of your exams' grading metrics and student progress reports."
        actions={
          <>
            <Button
              variant="outline"
              className="rounded-full gap-2 cursor-pointer"
              onClick={handleExport}
              disabled={!stats}
            >
              <Download className="h-4 w-4" /> Export Stats
            </Button>
            <Button asChild className="rounded-full bg-gradient-primary shadow-glow gap-2 cursor-pointer">
              <Link to="/exams/create">
                <PlusCircle className="h-4 w-4" /> New Exam
              </Link>
            </Button>
          </>
        }
      />

      {/* Select active exam to view details */}
      {exams.length > 0 && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center bg-card p-4 rounded-xl border border-border/50">
          <div className="flex items-center gap-2 text-sm font-medium">
            <BookOpen className="h-4 w-4 text-primary" />
            <span>Switch Exam:</span>
          </div>
          <div className="flex-1 max-w-md">
            {isLoadingExams ? (
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            ) : (
              <Select
                value={activeExamId}
                onValueChange={(val) => {
                  setSelectedExamId(val);
                }}
              >
                <SelectTrigger className="w-full bg-background rounded-full">
                  <SelectValue placeholder="Select an exam" />
                </SelectTrigger>
                <SelectContent>
                  {exams.map((ex) => (
                    <SelectItem key={ex.id} value={ex.id}>
                      {ex.title} ({ex.status.toLowerCase()})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      )}

      {exams.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed p-8 text-center bg-card/30">
          <FileText className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-lg font-semibold">No exams created yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Get started by creating a new exam assessment paper.
          </p>
          <Button asChild className="mt-4 rounded-full bg-gradient-primary cursor-pointer gap-2">
            <Link to="/exams/create">
              <PlusCircle className="h-4 w-4" /> Create First Exam
            </Link>
          </Button>
        </div>
      ) : isLoadingAnalytics ? (
        <div className="flex h-64 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground animate-pulse">Computing analytics data...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Submissions Logged"
              value={String(totalSubmissions)}
              delta="Active sessions included"
              icon={Users}
              accent="primary"
            />
            <StatCard
              label="AI Average Score"
              value={`${averageScore} pts`}
              delta={`Class overall mean`}
              icon={Trophy}
              accent="green"
            />
            <StatCard
              label="Highest Score Awarded"
              value={`${highestScore} pts`}
              delta="Class maximum grade"
              icon={Sparkles}
              accent="purple"
            />
            <StatCard
              label="Lowest Score Awarded"
              value={`${lowestScore} pts`}
              delta="Class minimum grade"
              icon={FileText}
              accent="blue"
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {/* Status Chart (Left Column) */}
            <Card className="lg:col-span-2 shadow-card bg-background border border-border/60 flex flex-col justify-between overflow-hidden">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
                <div>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    Session States Distribution
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">Real-time status breakdown for student exams</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {chartData.map((d) => {
                    const statusStyles: Record<string, string> = {
                      started: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
                      submitted: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
                      graded: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
                    };
                    return (
                      <Badge
                        key={d.name}
                        variant="outline"
                        className={`capitalize gap-1.5 px-2.5 py-1 text-xs border ${statusStyles[d.name] || "bg-muted text-muted-foreground"}`}
                      >
                        <span className="font-semibold">{d.name}:</span>
                        <span className="font-extrabold">{d.submissions}</span>
                      </Badge>
                    );
                  })}
                </div>
              </CardHeader>
              <CardContent className="h-72 p-4 pt-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} vertical={false} />
                    <XAxis
                      dataKey="name"
                      stroke="var(--muted-foreground)"
                      fontSize={12}
                      className="capitalize"
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis stroke="var(--muted-foreground)" fontSize={12} allowDecimals={false} tickLine={false} axisLine={false} />
                    <Tooltip
                      cursor={{ fill: "var(--muted)", opacity: 0.15 }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="rounded-xl border border-border/80 bg-background/95 p-3 shadow-xl backdrop-blur-md text-xs space-y-1">
                              <p className="font-bold capitalize text-foreground">{data.name} Phase</p>
                              <p className="text-muted-foreground">
                                Total Submissions: <span className="font-extrabold text-primary">{data.submissions}</span>
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="submissions" radius={[12, 12, 0, 0]} barSize={44}>
                      {chartData.map((entry, index) => {
                        const fillColors: Record<string, string> = {
                          started: "#3b82f6",
                          submitted: "#f59e0b",
                          graded: "#10b981",
                        };
                        return <Cell key={`cell-${index}`} fill={fillColors[entry.name] || "var(--primary)"} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* AI Insights Card (Right Column) */}
            <Card className="shadow-card bg-background border border-border/60 flex flex-col justify-between overflow-hidden">
              <CardHeader className="border-b pb-4">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                  AI Evaluation Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-muted-foreground">Automated Grading Rate</span>
                    <span className="text-primary font-bold">{completionRate}%</span>
                  </div>
                  <Progress value={completionRate} className="h-2.5 rounded-full" />
                </div>

                <div className="rounded-2xl border bg-gradient-soft p-3.5 border-primary/20 space-y-1.5 shadow-xs">
                  <div className="flex items-center gap-1.5">
                    <Badge className="bg-primary/20 text-primary border-none text-[10px] uppercase tracking-wider px-2 py-0.5 font-bold">
                      Class Performance
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed pt-1">
                    The overall average score is <strong className="text-foreground">{averageScore} pts</strong> across graded papers.
                  </p>
                </div>

                <div className="rounded-2xl border p-3.5 text-xs border-border/60 bg-muted/20 space-y-1">
                  <p className="font-semibold text-foreground flex items-center gap-1">
                    💡 Quick Action
                  </p>
                  <p className="text-muted-foreground text-[11px] leading-relaxed">
                    Review and override grade justifications directly from the student results details panels.
                  </p>
                </div>

                <Button asChild variant="outline" className="w-full rounded-full cursor-pointer hover:bg-primary hover:text-primary-foreground text-xs gap-1.5 transition-all">
                  <Link to="/results" search={{ examId: activeExamId }}>
                    View Student Results Sheet <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Submissions List Table */}
          <Card className="shadow-card bg-background border border-border/60">
            <CardHeader className="flex-row items-center justify-between border-b pb-4">
              <CardTitle className="text-base">Recent Submissions</CardTitle>
              <Button asChild variant="ghost" size="sm" className="rounded-full cursor-pointer hover:bg-muted/80 gap-1 text-xs">
                <Link to="/results" search={{ examId: activeExamId }}>
                  View Results Sheet <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b bg-muted/40 uppercase text-3xs tracking-wider text-muted-foreground">
                      <th className="px-5 py-3.5 font-semibold">Student</th>
                      <th className="px-5 py-3.5 font-semibold">Started At</th>
                      <th className="px-5 py-3.5 font-semibold">Submitted At</th>
                      <th className="px-5 py-3.5 font-semibold">AI Score</th>
                      <th className="px-5 py-3.5 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoadingSubmissions ? (
                      <tr>
                        <td colSpan={5} className="py-10 text-center">
                          <Loader2 className="h-5 w-5 animate-spin text-primary mx-auto" />
                        </td>
                      </tr>
                    ) : submissionsData && submissionsData.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-10 text-center text-muted-foreground">
                          No submissions logged for this exam yet.
                        </td>
                      </tr>
                    ) : (
                      submissionsData?.slice(0, 5).map((s) => (
                        <tr key={s.id} className="border-b last:border-0 hover:bg-muted/20">
                          <td className="px-5 py-3 font-medium">
                            {s.student ? `${s.student.firstName} ${s.student.lastName}` : "Unknown Student"}
                          </td>
                          <td className="px-5 py-3 text-muted-foreground">
                            {new Date(s.startedAt).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                          </td>
                          <td className="px-5 py-3 text-muted-foreground">
                            {s.submittedAt
                              ? new Date(s.submittedAt).toLocaleString([], { dateStyle: "short", timeStyle: "short" })
                              : "N/A"}
                          </td>
                          <td className="px-5 py-3 font-semibold text-primary">
                            {s.score !== null ? `${s.score} pts` : "Pending"}
                          </td>
                          <td className="px-5 py-3">
                            <Badge
                              variant="secondary"
                              className={
                                s.status === "GRADED"
                                  ? "bg-success/15 text-success rounded-full"
                                  : s.status === "SUBMITTED"
                                    ? "bg-primary/15 text-primary rounded-full"
                                    : "bg-warning/15 text-warning-foreground rounded-full"
                              }
                            >
                              {s.status.toLowerCase()}
                            </Badge>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

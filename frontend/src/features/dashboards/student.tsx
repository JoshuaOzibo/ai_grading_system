import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { GraduationCap, Trophy, Clock, BookOpen, Upload, ArrowRight, Loader2 } from "lucide-react";
import { api } from "@/lib/api-client";
import { useRole } from "@/lib/role-context";

interface Exam {
  id: string;
  title: string;
  description: string | null;
  duration: number;
  startDate: string;
  endDate: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
}

interface Submission {
  id: string;
  examId: string;
  studentId: string;
  score: number | null;
  status: "STARTED" | "SUBMITTED" | "GRADED";
  startedAt: string;
  submittedAt: string | null;
}

export function StudentDashboard() {
  const navigate = useNavigate();
  const { user } = useRole();

  // Fetch all published exams
  const { data: examsData, isLoading: isLoadingExams } = useQuery({
    queryKey: ["exams"],
    queryFn: async () => {
      const res = await api.get<{ data: Exam[] }>("/exams");
      return res.data;
    },
  });

  // Fetch all student submissions
  const { data: submissionsData, isLoading: isLoadingSubmissions } = useQuery({
    queryKey: ["submissions"],
    queryFn: async () => {
      const res = await api.get<{ data: Submission[] }>("/submissions");
      return res.data;
    },
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const name = user?.firstName || "Student";
  const exams = examsData || [];
  const submissions = submissionsData || [];

  // Compute stat card metrics
  const completedExams = submissions.filter((s) => s.status === "GRADED" || s.status === "SUBMITTED");
  const completedCount = completedExams.length;
  
  const gradedExams = submissions.filter((s) => s.status === "GRADED" && s.score !== null);
  const averageScore = gradedExams.length > 0
    ? Math.round(gradedExams.reduce((sum, s) => sum + (s.score || 0), 0) / gradedExams.length)
    : 0;

  // Filter exams that are active/upcoming and haven't been completed yet
  const upcomingExams = exams.filter((ex) => {
    const isCompleted = submissions.some((sub) => sub.examId === ex.id && (sub.status === "GRADED" || sub.status === "SUBMITTED"));
    const isExpired = new Date(ex.endDate).getTime() < Date.now();
    return !isCompleted && !isExpired;
  });

  const handleExamAction = (exam: Exam) => {
    // Navigate to take exam page passing examId
    navigate({ to: "/upload", search: { examId: exam.id } });
  };

  const renderBoldFirstLetter = (str: string) => {
    if (!str) return "";
    return (
      <span>
        <span className="font-extrabold text-primary">{str.charAt(0)}</span>
        {str.slice(1)}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={<>{getGreeting()}, {renderBoldFirstLetter(name)}</>}
        description="Stay on top of your exams, track your grades, and review feedback."
        actions={
          <Button asChild className="rounded-full bg-gradient-primary shadow-glow gap-2 cursor-pointer">
            <Link to="/results">
              <GraduationCap className="h-4 w-4" /> View Results
            </Link>
          </Button>
        }
      />

      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Upcoming Exams"
          value={isLoading ? "..." : String(upcomingExams.length)}
          icon={Clock}
          accent="primary"
        />
        <StatCard
          label="Completed Exams"
          value={isLoading ? "..." : String(completedCount)}
          delta={`${submissions.filter((s) => s.status === "STARTED").length} in progress`}
          icon={GraduationCap}
          accent="blue"
        />
        <StatCard
          label="Your Average Score"
          value={isLoading ? "..." : `${averageScore}%`}
          delta={gradedExams.length > 0 ? `From ${gradedExams.length} graded exams` : "No graded exams yet"}
          icon={Trophy}
          accent="green"
        />
        <StatCard
          label="Available Assessments"
          value={isLoading ? "..." : String(exams.length)}
          icon={BookOpen}
          accent="purple"
        />
      </div>

      {/* Upcoming Exams Panel */}
      <Card className="shadow-card bg-background border border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Available Exams Queue</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : upcomingExams.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No new assessments are available to take.
            </p>
          ) : (
            upcomingExams.map((e) => {
              const startDate = new Date(e.startDate);
              const isFuture = startDate.getTime() > Date.now();
              const hasStartedSession = submissions.some((s) => s.examId === e.id && s.status === "STARTED");
              
              return (
                <div
                  key={e.id}
                  className="flex flex-col gap-3 rounded-xl border p-4 transition hover:border-primary/40 hover:bg-muted/15 sm:flex-row sm:items-center sm:justify-between border-border/60"
                >
                  <div className="space-y-0.5">
                    <p className="font-semibold text-sm text-foreground">{e.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Opens: {startDate.toLocaleString([], { dateStyle: "short", timeStyle: "short" })} · Duration: {e.duration} mins
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className={
                        isFuture
                          ? "bg-warning/15 text-warning border-warning/30"
                          : hasStartedSession
                            ? "bg-primary/15 text-primary border-primary/30"
                            : "bg-success/15 text-success border-success/30"
                      }
                    >
                      {isFuture ? "Locked" : hasStartedSession ? "In Progress" : "Available"}
                    </Badge>
                    {!isFuture && (
                      <Button
                        size="sm"
                        className="rounded-full gap-1 cursor-pointer bg-gradient-primary text-primary-foreground shadow-soft"
                        onClick={() => handleExamAction(e)}
                      >
                        {hasStartedSession ? "Resume" : "Start"} <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}

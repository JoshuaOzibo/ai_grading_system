import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import {
  Sparkles,
  Brain,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Award,
  BookOpen,
  ArrowLeft,
  ChevronRight,
  HelpCircle,
  User,
} from "lucide-react";
import { useState } from "react";
import { api } from "@/lib/api-client";
import { useRole } from "@/lib/role-context";
import { z } from "zod";

const aiGradingSearchSchema = z.object({
  submissionId: z.string().optional(),
});

export const Route = createFileRoute("/_app/ai-grading")({
  component: AIGrading,
  validateSearch: (search) => aiGradingSearchSchema.parse(search),
});

interface Answer {
  id: string;
  questionId: string;
  studentInput: string;
  score: number | null;
  feedback: string | null;
  isGraded: boolean;
  question: {
    type: "MCQ" | "ESSAY";
    text: string;
    points: number;
    expectedAnswer: string | null;
    aiMarkingGuide: string | null;
    options?: string[];
  };
}

interface SubmissionDetails {
  id: string;
  examId: string;
  studentId: string;
  score: number | null;
  status: "STARTED" | "SUBMITTED" | "GRADED";
  startedAt: string;
  submittedAt: string | null;
  student: {
    firstName: string;
    lastName: string;
    matricNumber: string | null;
    email: string;
  };
  exam: {
    title: string;
    duration: number;
  };
  answers: Answer[];
}

function AIGrading() {
  const navigate = useNavigate();
  const { role } = useRole();
  const { submissionId } = Route.useSearch();

  // Fetch Submission details (polls automatically while background grading is in progress)
  const { data: submission, isLoading, error } = useQuery({
    queryKey: ["submission-details", submissionId],
    queryFn: async () => {
      if (!submissionId) return null;
      const res = await api.get<{ data: SubmissionDetails }>(`/submissions/${submissionId}`);
      return res.data;
    },
    enabled: !!submissionId,
    refetchInterval: (query) => {
      // Poll every 3 seconds if status is SUBMITTED (meaning AI is still grading in background)
      const data = query.state.data as SubmissionDetails | undefined;
      return data?.status === "SUBMITTED" ? 3000 : false;
    },
  });

  if (!submissionId) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="AI Grading Engine"
          description="Access detailed evaluation reports directly from the Exam Results sheets."
        />
        <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed p-8 text-center bg-card/30">
          <Brain className="h-10 w-10 text-primary animate-pulse mb-3" />
          <p className="text-lg font-semibold">Select a submission to grade or review</p>
          <p className="mt-1 text-sm text-muted-foreground max-w-sm">
            AI Grading is triggered automatically upon exam completion. View the results list to inspect student reports.
          </p>
          <Button
            onClick={() => navigate({ to: "/results" })}
            className="mt-4 rounded-full bg-gradient-primary cursor-pointer gap-2"
          >
            Go to Results Sheet
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Retrieving submission details...</p>
        </div>
      </div>
    );
  }

  if (error || !submission) {
    return (
      <Card className="border-destructive/35 bg-destructive/5 p-6 max-w-2xl mx-auto mt-8">
        <div className="flex items-center gap-3 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <span className="font-semibold">Error Loading Submission</span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {(error as any)?.message || "Submission report is not accessible."}
        </p>
        <Button onClick={() => navigate({ to: "/results" })} className="mt-4 rounded-full">
          Back to Results
        </Button>
      </Card>
    );
  }

  const totalPossiblePoints = submission.answers.reduce((sum, ans) => sum + ans.question.points, 0);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="rounded-full gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
          onClick={() => navigate({ to: "/results" })}
        >
          <ArrowLeft className="h-4 w-4" /> Back to Results
        </Button>
      </div>

      {/* Main Submission Header Card */}
      <Card className="shadow-card bg-background border border-border/60 overflow-hidden">
        <div className="bg-gradient-soft border-b border-border/40 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              {submission.exam.title}
            </Badge>
            <h1 className="text-2xl font-bold tracking-tight mt-1">
              {submission.student.firstName} {submission.student.lastName}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
              <span className="flex items-center gap-1">
                <User className="h-3.5 w-3.5" /> Matric: {submission.student.matricNumber || "N/A"}
              </span>
              <span className="flex items-center gap-1">
                <BookOpen className="h-3.5 w-3.5" /> Session ID: {submission.id.substring(0, 8)}...
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-muted-foreground uppercase font-semibold">Overall Score</p>
              <p className="text-3xl font-extrabold text-primary">
                {submission.score !== null ? (
                  <>
                    {submission.score} <span className="text-sm text-muted-foreground font-normal">/ {totalPossiblePoints}</span>
                  </>
                ) : (
                  "Pending"
                )}
              </p>
            </div>
            <div className="h-10 w-px bg-border/80" />
            <Badge
              variant="secondary"
              className={
                submission.status === "GRADED"
                  ? "bg-success/15 text-success border-success/30 px-3 py-1 rounded-full capitalize"
                  : submission.status === "SUBMITTED"
                    ? "bg-primary/15 text-primary border-primary/30 px-3 py-1 rounded-full animate-pulse capitalize"
                    : "bg-warning/15 text-warning border-warning/30 px-3 py-1 rounded-full capitalize"
              }
            >
              {submission.status.toLowerCase()}
            </Badge>
          </div>
        </div>
      </Card>

      {/* Active Evaluation Running (polling status) */}
      {submission.status === "SUBMITTED" && (
        <Card className="border-primary/35 bg-primary/5 p-4 flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-primary shrink-0" />
          <div className="text-sm">
            <p className="font-semibold text-primary">AI Evaluation In Progress</p>
            <p className="text-muted-foreground text-xs">
              Gemini is currently grading the student's essay answers. Results will populate automatically.
            </p>
          </div>
        </Card>
      )}

      {/* Answer Scripts Detail Cards */}
      <div className="space-y-6">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" /> Evaluation Sheet ({submission.answers.length} Questions)
        </h2>

        {submission.answers.map((ans, idx) => {
          const q = ans.question;
          const isCorrect = q.type === "MCQ" && ans.studentInput === q.expectedAnswer; // wait, for MCQ expectedAnswer is correctOption
          return (
            <Card key={ans.id} className="shadow-card bg-background border border-border/60 overflow-hidden">
              {/* Question Header Bar */}
              <div className="bg-muted/30 p-4 border-b border-border/40 flex justify-between items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-background border flex items-center justify-center text-xs font-bold shadow-soft">
                    {idx + 1}
                  </div>
                  <Badge
                    variant="secondary"
                    className={
                      q.type === "ESSAY" ? "bg-chart-3/10 text-chart-3" : "bg-primary/10 text-primary"
                    }
                  >
                    {q.type}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-sm font-semibold">
                  <span>Score:</span>
                  <span className="text-primary font-bold">
                    {ans.score !== null ? `${ans.score} / ${q.points}` : `Pending / ${q.points}`}
                  </span>
                </div>
              </div>

              <CardContent className="p-5 space-y-4">
                {/* Question Text */}
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground">Question Prompt:</span>
                  <p className="text-sm font-medium text-foreground">{q.text}</p>
                </div>

                {/* Student's Response */}
                <div className="space-y-1 border-l-2 border-primary/30 pl-3">
                  <span className="text-xs font-semibold text-muted-foreground">Student Response:</span>
                  <p className="text-sm text-foreground bg-muted/20 p-2.5 rounded-lg border border-border/40 font-mono text-xs whitespace-pre-wrap">
                    {ans.studentInput || <span className="italic text-muted-foreground font-sans">No response submitted.</span>}
                  </p>
                </div>

                {/* MCQ Options Display */}
                {q.type === "MCQ" && q.options && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 text-xs">
                    {q.options.map((opt, oIdx) => {
                      const letter = String.fromCharCode(65 + oIdx);
                      const isSelected = ans.studentInput === letter;
                      // Wait! For MCQ, correctOption contains correct letter
                      // Let's see: on safe questions correctOption is stripped for students, but in getSubmissionDetails (lecturer/student graded details) is correctOption returned?
                      // Wait, getSubmissionDetails returns the full Question schema to owners/evaluated students!
                      // Let's check: in getSubmissionDetails, the question object contains correctOption!
                      const isCorrectAnswer = (q as any).correctOption === letter;
                      return (
                        <div
                          key={oIdx}
                          className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                            isCorrectAnswer
                              ? "border-success/45 bg-success/10 text-success font-medium"
                              : isSelected
                                ? "border-destructive/40 bg-destructive/10 text-destructive font-medium"
                                : "border-border/60 bg-muted/25 text-muted-foreground"
                          }`}
                        >
                          <div className={`h-5 w-5 rounded-full border flex items-center justify-center text-2xs font-bold ${
                            isCorrectAnswer
                              ? "bg-success text-success-foreground border-success"
                              : isSelected
                                ? "bg-destructive text-destructive-foreground border-destructive"
                                : "border-border"
                          }`}>
                            {letter}
                          </div>
                          <span>{opt}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Expected Answer & Rubric (Visible only to Lecturers/Admins or graded ESSAY) */}
                {role !== "student" && q.type === "ESSAY" && (
                  <div className="grid gap-3 sm:grid-cols-2 pt-2 border-t text-xs">
                    <div className="space-y-1 bg-primary/5 border border-primary/15 p-2.5 rounded-lg">
                      <span className="font-semibold text-primary block">Expected Ideal Answer:</span>
                      <p className="text-muted-foreground whitespace-pre-wrap">{q.expectedAnswer || "None specified."}</p>
                    </div>
                    <div className="space-y-1 bg-chart-3/5 border border-chart-3/15 p-2.5 rounded-lg">
                      <span className="font-semibold text-chart-3 block">AI Marking Rubric:</span>
                      <p className="text-muted-foreground whitespace-pre-wrap">{q.aiMarkingGuide || "None specified."}</p>
                    </div>
                  </div>
                )}

                {/* AI Justification & Feedback */}
                {ans.isGraded && ans.feedback && (
                  <div className="bg-gradient-soft border border-primary/15 p-3.5 rounded-xl space-y-1.5 mt-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                      <Brain className="h-3.5 w-3.5 animate-pulse" />
                      <span>AI Evaluator Assessment:</span>
                    </div>
                    <p className="text-xs text-foreground/90 leading-relaxed font-medium">
                      {ans.feedback}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

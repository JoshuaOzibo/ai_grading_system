import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  UploadCloud,
  FileText,
  X,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Loader2,
  BookOpen,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { api } from "@/lib/api-client";
import { z } from "zod";

const uploadSearchSchema = z.object({
  examId: z.string().optional(),
});

export const Route = createFileRoute("/_app/upload")({
  component: UploadAnswers,
  validateSearch: (search) => uploadSearchSchema.parse(search),
});

interface Question {
  id: string;
  type: "MCQ" | "ESSAY";
  text: string;
  points: number;
  options?: string[];
}

interface ExamSession {
  submissionId: string;
  startedAt: string;
  duration: number;
  title: string;
  questions: Question[];
}

function UploadAnswers() {
  const navigate = useNavigate();
  const { examId } = Route.useSearch();
  const [files, setFiles] = useState<{ id: string; name: string; size: string; progress: number }[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files).map((f) => {
      const sizeMB = (f.size / (1024 * 1024)).toFixed(1);
      const id = Math.random().toString(36).substring(7);
      return {
        id,
        name: f.name,
        size: `${sizeMB} MB`,
        progress: 0,
      };
    });

    setFiles((prev) => [...prev, ...newFiles]);

    // Simulate upload progress
    newFiles.forEach((newFile) => {
      let currentProgress = 0;
      const interval = setInterval(() => {
        currentProgress += Math.floor(Math.random() * 20) + 10;
        if (currentProgress >= 100) {
          currentProgress = 100;
          clearInterval(interval);
        }
        setFiles((prev) =>
          prev.map((item) => (item.id === newFile.id ? { ...item, progress: currentProgress } : item))
        );
      }, 150);
    });
  };

  const handleRemoveFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  // Active exam session states
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  // Fetch or resume Exam Session
  const { data: sessionData, isLoading: isLoadingSession, error: sessionError } = useQuery({
    queryKey: ["exam-session", examId],
    queryFn: async () => {
      if (!examId) return null;
      const res = await api.post<{ data: ExamSession }>(`/exams/${examId}/start`);
      return res.data;
    },
    enabled: !!examId,
    retry: false,
  });

  // Submit Exam Mutation
  const submitExamMutation = useMutation({
    mutationFn: async () => {
      if (!examId) return;
      const answersArray = Object.entries(answers).map(([qId, input]) => ({
        questionId: qId,
        studentInput: input,
      }));
      const res = await api.post<{ message: string; data: any }>(`/exams/${examId}/submit`, { answers: answersArray });
      return res;
    },
    onSuccess: (data: any) => {
      toast.success(data?.message || "Exam submitted successfully!");
      navigate({ to: "/results" });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to submit exam");
    },
  });

  // Countdown timer setup
  useEffect(() => {
    if (!sessionData) return;

    const startedTime = new Date(sessionData.startedAt).getTime();
    const durationMs = sessionData.duration * 60 * 1000;
    const endTime = startedTime + durationMs;

    const updateTimer = () => {
      const remaining = endTime - Date.now();
      if (remaining <= 0) {
        setTimeLeft(0);
        // Automatically submit answers
        toast.warning("Time is up! Submitting your answers automatically...");
        submitExamMutation.mutate();
      } else {
        setTimeLeft(remaining);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [sessionData]);

  const formatTime = (ms: number) => {
    const totalSecs = Math.floor(ms / 1000);
    const hours = Math.floor(totalSecs / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    const seconds = totalSecs % 60;

    const parts = [
      hours > 0 ? String(hours).padStart(2, "0") : null,
      String(minutes).padStart(2, "0"),
      String(seconds).padStart(2, "0"),
    ].filter(Boolean);

    return parts.join(":");
  };

  const handleSelectMCQ = (qId: string, optionLetter: string) => {
    setAnswers((prev) => ({ ...prev, [qId]: optionLetter }));
  };

  const handleTextEssay = (qId: string, text: string) => {
    setAnswers((prev) => ({ ...prev, [qId]: text }));
  };

  const isPending = submitExamMutation.isPending;

  // Render online take-exam session if examId is provided
  if (examId) {
    if (isLoadingSession) {
      return (
        <div className="flex h-96 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground animate-pulse">Initializing exam session...</p>
          </div>
        </div>
      );
    }

    if (sessionError || !sessionData) {
      return (
        <Card className="border-destructive/35 bg-destructive/5 p-6 space-y-4 max-w-2xl mx-auto mt-8">
          <div className="flex items-center gap-3 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-semibold">Unable to Start Exam</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {(sessionError as any)?.message || "You may have already submitted this exam or the exam window is closed."}
          </p>
          <Button onClick={() => navigate({ to: "/exams" })} className="rounded-full">
            Back to Exams
          </Button>
        </Card>
      );
    }

    const questions = sessionData.questions;
    const currentQuestion = questions[activeQuestionIndex];

    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b pb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{sessionData.title}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Online Assessment Session · Keep this window open
            </p>
          </div>
          <div className="flex items-center gap-3 bg-card border px-4 py-2.5 rounded-2xl shadow-soft">
            <Clock className="h-5 w-5 text-primary animate-pulse" />
            <span className="text-lg font-bold font-mono">
              {timeLeft !== null ? formatTime(timeLeft) : "00:00"}
            </span>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          {/* Question Navigator */}
          <Card className="md:col-span-1 shadow-card bg-background border-border/60">
            <CardHeader className="p-4 border-b">
              <CardTitle className="text-sm">Questions</CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex flex-wrap gap-2 md:grid md:grid-cols-3">
              {questions.map((q, idx) => {
                const isAnswered = !!answers[q.id];
                const isActive = activeQuestionIndex === idx;
                return (
                  <button
                    key={q.id}
                    className={`h-9 w-9 rounded-xl border flex items-center justify-center text-xs font-bold transition cursor-pointer ${
                      isActive
                        ? "bg-primary text-primary-foreground border-primary shadow-glow"
                        : isAnswered
                          ? "bg-success/10 border-success/35 text-success"
                          : "bg-muted/40 border-border/60 text-muted-foreground hover:bg-muted"
                    }`}
                    onClick={() => setActiveQuestionIndex(idx)}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </CardContent>
          </Card>

          {/* Active Question Panel */}
          <div className="md:col-span-3 space-y-4">
            <Card className="shadow-card bg-background border-border/60 min-h-[320px] flex flex-col justify-between">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    Question {activeQuestionIndex + 1} of {questions.length}
                  </Badge>
                  <span className="text-xs text-muted-foreground font-semibold">
                    {currentQuestion.points} points
                  </span>
                </div>

                <p className="text-base font-semibold leading-relaxed text-foreground">
                  {currentQuestion.text}
                </p>

                {currentQuestion.type === "MCQ" ? (
                  <div className="grid gap-3 pt-2">
                    {currentQuestion.options?.map((opt, idx) => {
                      const letter = String.fromCharCode(65 + idx); // A, B, C, D
                      const isSelected = answers[currentQuestion.id] === letter;
                      return (
                        <button
                          key={idx}
                          type="button"
                          className={`w-full text-left p-3.5 rounded-xl border transition cursor-pointer flex items-center gap-3 ${
                            isSelected
                              ? "bg-gradient-soft border-primary text-primary font-medium"
                              : "bg-muted/20 border-border/65 hover:bg-muted/40"
                          }`}
                          onClick={() => handleSelectMCQ(currentQuestion.id, letter)}
                        >
                          <div className={`h-6 w-6 rounded-full border flex items-center justify-center text-xs font-bold ${
                            isSelected
                              ? "bg-primary text-primary-foreground border-primary"
                              : "border-border text-muted-foreground"
                          }`}>
                            {letter}
                          </div>
                          <span className="text-sm">{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-2 pt-2">
                    <label className="text-xs font-semibold text-muted-foreground">Your Answer:</label>
                    <Textarea
                      placeholder="Type your explanation or response here..."
                      rows={8}
                      className="resize-none"
                      value={answers[currentQuestion.id] || ""}
                      onChange={(e) => handleTextEssay(currentQuestion.id, e.target.value)}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                className="rounded-full gap-1.5 cursor-pointer"
                disabled={activeQuestionIndex === 0}
                onClick={() => setActiveQuestionIndex((prev) => prev - 1)}
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </Button>

              {activeQuestionIndex < questions.length - 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full gap-1.5 cursor-pointer"
                  onClick={() => setActiveQuestionIndex((prev) => prev + 1)}
                >
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  className="rounded-full bg-gradient-primary shadow-glow gap-1.5 cursor-pointer"
                  onClick={() => {
                    if (confirm("Are you sure you want to submit your exam answers?")) {
                      submitExamMutation.mutate();
                    }
                  }}
                  disabled={isPending}
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                  Submit Exam
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Fallback / Scanned scripts PDF uploader (default page view)
  return (
    <div className="space-y-6">
      <PageHeader
        title="Upload Answer Scripts"
        description="Drop scanned answer scripts here. PDF, JPG, or PNG up to 20 MB."
      />

      <Card className="shadow-card bg-background border border-border/60">
        <CardContent className="p-6">
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/30 px-6 py-16 text-center transition hover:border-primary/50 hover:bg-accent/30">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow">
              <UploadCloud className="h-8 w-8" />
            </div>
            <p className="mt-5 text-base font-semibold">Drop files here or click to browse</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Supports PDF, JPG, PNG · Max 20 MB per file
            </p>
            <div className="mt-5 inline-flex items-center justify-center rounded-full bg-gradient-primary px-6 py-2 text-sm font-semibold text-primary-foreground shadow-glow hover:opacity-90 transition">
              Choose files
            </div>
            <input 
              type="file" 
              className="hidden" 
              multiple 
              accept="image/*,application/pdf"
              onChange={handleFileChange}
            />
          </label>
        </CardContent>
      </Card>

      <Card className="shadow-card bg-background border border-border/60">
        <CardContent className="p-5">
          <h3 className="mb-4 font-semibold">Uploads ({files.length})</h3>
          <div className="space-y-3">
            {files.map((f) => (
              <div key={f.id} className="flex items-center gap-4 rounded-xl border p-3 bg-muted/10 border-border/50">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{f.name}</span>
                    <span className="text-muted-foreground">{f.size}</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-gradient-primary transition-all"
                      style={{ width: `${f.progress}%` }}
                    />
                  </div>
                </div>
                {f.progress === 100 ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                    <button 
                      onClick={() => handleRemoveFile(f.id)} 
                      className="text-muted-foreground hover:text-destructive cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => handleRemoveFile(f.id)} 
                    className="text-muted-foreground hover:text-destructive cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

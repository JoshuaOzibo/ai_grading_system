import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Brain, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/_app/ai-grading")({
  component: AIGrading,
});

const queue = [
  { student: "Ada Lovelace", exam: "CS 201 Final", confidence: 96, score: 92, status: "ready" },
  { student: "Tunde Adebayo", exam: "CS 201 Final", confidence: 88, score: 78, status: "ready" },
  { student: "Maya Rodriguez", exam: "CS 201 Final", confidence: 92, score: 85, status: "ready" },
  { student: "Kofi Boateng", exam: "CS 201 Final", confidence: 71, score: 64, status: "review" },
  { student: "Lin Wei", exam: "CS 201 Final", confidence: 98, score: 95, status: "ready" },
];

function AIGrading() {
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  const start = () => {
    setRunning(true);
    setProgress(0);
    const id = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(id);
          setRunning(false);
          return 100;
        }
        return p + 8;
      });
    }, 250);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Grading"
        description="Automatically grade submissions and review AI-suggested scores."
        actions={
          <Button onClick={start} disabled={running} className="rounded-full bg-gradient-primary shadow-glow gap-2">
            {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {running ? "Grading..." : "Run AI Grading"}
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-card border-primary/20 bg-gradient-soft">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Brain className="h-4 w-4 text-primary" /> AI Engine
            </div>
            <p className="mt-3 text-2xl font-bold">GradeAI v3.2</p>
            <p className="text-xs text-muted-foreground">Optimized for academic answers</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Avg confidence</p>
            <p className="mt-2 text-2xl font-bold">89%</p>
            <Progress value={89} className="mt-3 h-2" />
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Needs review</p>
            <p className="mt-2 text-2xl font-bold">3</p>
            <p className="mt-1 text-xs text-muted-foreground">Low-confidence answers</p>
          </CardContent>
        </Card>
      </div>

      {(running || progress > 0) && (
        <Card className="shadow-card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {running ? "Grading in progress..." : "Grading complete"}
              </span>
              <span className="text-sm text-muted-foreground">{progress}%</span>
            </div>
            <Progress value={progress} className="mt-3 h-2" />
          </CardContent>
        </Card>
      )}

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Submissions Queue</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {queue.map((q) => (
            <div
              key={q.student}
              className="flex flex-col gap-3 rounded-xl border p-4 transition hover:border-primary/40 sm:flex-row sm:items-center"
            >
              <div className="flex-1">
                <p className="font-semibold">{q.student}</p>
                <p className="text-sm text-muted-foreground">{q.exam}</p>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Confidence</p>
                  <p className="font-semibold">{q.confidence}%</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">AI Score</p>
                  <p className="text-lg font-bold text-gradient">{q.score}</p>
                </div>
                <Badge
                  variant="secondary"
                  className={
                    q.status === "ready"
                      ? "bg-success/15 text-success gap-1"
                      : "bg-warning/15 text-warning-foreground gap-1"
                  }
                >
                  {q.status === "ready" ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : (
                    <AlertCircle className="h-3 w-3" />
                  )}
                  {q.status === "ready" ? "Ready" : "Review"}
                </Badge>
                <Button size="sm" variant="outline" className="rounded-full">
                  Review
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

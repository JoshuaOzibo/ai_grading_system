import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Sparkles, ListChecks, Save, ArrowRight, Loader2, CheckCircle2, X, Plus } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api-client";

export const Route = createFileRoute("/_app/exams/create")({
  component: CreateExam,
});

function CreateExam() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [createdExamId, setCreatedExamId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("60");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // AI Gen states
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [topics, setTopics] = useState<string[]>([]);
  const [currentTopic, setCurrentTopic] = useState("");
  const [aiNumQuestions, setAiNumQuestions] = useState("5");
  const [aiQuestionType, setAiQuestionType] = useState<"MCQ" | "ESSAY">("ESSAY");

  const aiGenerateMutation = useMutation({
    mutationFn: async (vars: { topic: string; numQuestions: number; questionType: string }) => {
      const res = await api.post<{ data: { id: string } }>("/exams/generate", vars);
      return res.data;
    },
    onSuccess: (data) => {
      setCreatedExamId(data.id);
      setAiDialogOpen(false);
      setTopics([]);
      setCurrentTopic("");
      setOpen(true);
      toast.success("Exam and questions generated successfully!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to generate exam using AI");
    },
  });

  const processAndAddTopics = (inputStr: string) => {
    if (!inputStr) return;
    const rawItems = inputStr.split(/[,;\n]+/);
    const parsedItems = rawItems
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    if (parsedItems.length === 0) return;

    let addedCount = 0;
    setTopics((prev) => {
      const updated = [...prev];
      parsedItems.forEach((item) => {
        if (!updated.includes(item)) {
          updated.push(item);
          addedCount++;
        }
      });
      return updated;
    });

    setCurrentTopic("");
    if (addedCount > 0) {
      toast.success(`Added ${addedCount} topic${addedCount > 1 ? "s" : ""}`);
    } else {
      toast.info("Topic(s) already in the list.");
    }
  };

  const removeTopic = (indexToRemove: number) => {
    setTopics(topics.filter((_, index) => index !== indexToRemove));
  };

  const handleAiGenerateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    let finalTopics = [...topics];
    if (currentTopic.trim()) {
      const pendingItems = currentTopic
        .split(/[,;\n]+/)
        .map((t) => t.trim())
        .filter((t) => t.length > 0);
      pendingItems.forEach((item) => {
        if (!finalTopics.includes(item)) {
          finalTopics.push(item);
        }
      });
    }

    if (finalTopics.length === 0) {
      toast.error("Please add at least one topic or syllabus point.");
      return;
    }

    aiGenerateMutation.mutate({
      topic: finalTopics.join(", "),
      numQuestions: parseInt(aiNumQuestions, 10),
      questionType: aiQuestionType,
    });
  };

  const createExamMutation = useMutation({
    mutationFn: async () => {
      const startISO = new Date(startDate).toISOString();
      const endISO = new Date(endDate).toISOString();

      const payload = {
        title,
        description,
        duration: parseInt(duration, 10),
        startDate: startISO,
        endDate: endISO,
      };

      const res = await api.post<{ data: { id: string } }>("/exams", payload);
      return res.data;
    },
    onSuccess: (data) => {
      setCreatedExamId(data.id);
      setOpen(true);
      toast.success("Exam created in draft mode!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create exam");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !startDate || !endDate) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    if (start >= end) {
      toast.error("Start date must be before end date.");
      return;
    }
    if (end <= now) {
      toast.error("End date must be in the future.");
      return;
    }

    createExamMutation.mutate();
  };

  const isPending = createExamMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PageHeader
        title="Create Exam"
        description="Set up your exam details. You can add questions in the next step."
        actions={
          <>
            <Button
              type="button"
              variant="outline"
              className="rounded-full cursor-pointer"
              onClick={() => navigate({ to: "/exams" })}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="rounded-full bg-gradient-primary shadow-glow gap-2 cursor-pointer"
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Create exam
            </Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 shadow-card bg-background border-border/60">
          <CardHeader>
            <CardTitle>Exam Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="title">Exam Title <span className="text-destructive">*</span></Label>
              <Input
                id="title"
                placeholder="e.g. Data Structures Final"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration <span className="text-destructive">*</span></Label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger id="duration">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="90">90 minutes</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                    <SelectItem value="180">3 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                {/* Empty spacer for alignment */}
              </div>

              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date & Time <span className="text-destructive">*</span></Label>
                <Input
                  id="startDate"
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date & Time <span className="text-destructive">*</span></Label>
                <Input
                  id="endDate"
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="desc">Description / Instructions</Label>
              <Textarea
                id="desc"
                placeholder="Instructions for students (e.g., grading criteria, notes)..."
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="shadow-card bg-background border-border/60">
            <CardHeader>
              <CardTitle className="text-base">Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                ["Enable AI auto-grading", true],
                ["Randomize question order", true],
                ["Show results immediately", false],
                ["Allow late submissions", false],
              ].map(([label, def]) => (
                <div key={label as string} className="flex items-center justify-between">
                  <span className="text-sm">{label}</span>
                  <Switch defaultChecked={def as boolean} />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="shadow-card border-primary/30 bg-gradient-soft">
            <CardContent className="p-5">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="font-semibold">Generate with AI</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Let AI draft questions based on a topic or syllabus.
              </p>
              <Button
                type="button"
                className="mt-4 w-full rounded-full bg-gradient-primary cursor-pointer"
                onClick={() => setAiDialogOpen(true)}
              >
                Try AI generation
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* AI Generation Dialog */}
      <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
        <DialogContent className="sm:max-w-md bg-background border border-border">
          <form onSubmit={handleAiGenerateSubmit}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                AI Exam Generator
              </DialogTitle>
              <DialogDescription>
                Describe the topic or subject, and our AI will instantly generate an exam draft populated with graded questions.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-3">
                <Label htmlFor="topic-input">Topics / Syllabus Points</Label>
                <div className="flex gap-2">
                  <Input
                    id="topic-input"
                    placeholder="Paste or type topics separated by commas..."
                    value={currentTopic}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val.includes(",") || val.includes(";")) {
                        processAndAddTopics(val);
                      } else {
                        setCurrentTopic(val);
                      }
                    }}
                    onPaste={(e) => {
                      const pasteText = e.clipboardData.getData("text");
                      if (pasteText.includes(",") || pasteText.includes(";") || pasteText.includes("\n")) {
                        e.preventDefault();
                        processAndAddTopics(pasteText);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        processAndAddTopics(currentTopic);
                      }
                    }}
                    className="rounded-full bg-background"
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="secondary"
                    className="rounded-full shrink-0 cursor-pointer hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                    onClick={() => processAndAddTopics(currentTopic)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-[11px] text-muted-foreground px-1">
                  💡 Tip: You can paste multiple topics separated by commas (e.g. <em>Arrays, Sorting, Recursion</em>).
                </p>

                {/* Topics container */}
                {topics.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-muted/40 border border-border/50 max-h-32 overflow-y-auto">
                    {topics.map((t, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-background text-foreground rounded-full border border-border/80 shadow-sm hover:shadow-md transition-all duration-200"
                      >
                        <span>{t}</span>
                        <button
                          type="button"
                          onClick={() => removeTopic(idx)}
                          className="text-muted-foreground hover:text-destructive transition-colors rounded-full p-0.5 hover:bg-muted cursor-pointer"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="aiNumQuestions">Number of Questions</Label>
                  <Select value={aiNumQuestions} onValueChange={setAiNumQuestions}>
                    <SelectTrigger id="aiNumQuestions" className="rounded-full">
                      <SelectValue placeholder="Select count" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 Questions</SelectItem>
                      <SelectItem value="5">5 Questions</SelectItem>
                      <SelectItem value="10">10 Questions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="aiQuestionType">Question Type</Label>
                  <Select
                    value={aiQuestionType}
                    onValueChange={(val) => setAiQuestionType(val as "MCQ" | "ESSAY")}
                  >
                    <SelectTrigger id="aiQuestionType" className="rounded-full">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MCQ">Multiple Choice (MCQ)</SelectItem>
                      <SelectItem value="ESSAY">Essay / Theory</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                className="rounded-full cursor-pointer"
                onClick={() => setAiDialogOpen(false)}
                disabled={aiGenerateMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-full bg-gradient-primary cursor-pointer gap-2"
                disabled={aiGenerateMutation.isPending}
              >
                {aiGenerateMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate Exam
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-success/15">
              <CheckCircle2 className="h-7 w-7 text-success" />
            </div>
            <DialogTitle className="text-center">Exam created!</DialogTitle>
            <DialogDescription className="text-center">
              Your exam has been successfully saved in draft mode. You can now configure the exam questions.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button
              asChild
              className="rounded-full bg-gradient-primary cursor-pointer"
              onClick={() => setOpen(false)}
            >
              <Link to="/questions" search={{ examId: createdExamId || undefined }}>
                Add Questions
              </Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  );
}

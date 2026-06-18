import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Sparkles,
  Trash2,
  Edit3,
  GripVertical,
  Loader2,
  AlertCircle,
  BookOpen,
} from "lucide-react";
import { useState } from "react";
import { api, APIError } from "@/lib/api-client";
import { z } from "zod";

const questionsSearchSchema = z.object({
  examId: z.string().optional(),
});

export const Route = createFileRoute("/_app/questions")({
  component: Questions,
  validateSearch: (search) => questionsSearchSchema.parse(search),
});

interface Question {
  id: string;
  examId: string;
  type: "MCQ" | "ESSAY";
  text: string;
  points: number;
  options: string[];
  correctOption: string | null;
  expectedAnswer: string | null;
  aiMarkingGuide: string | null;
}

interface Exam {
  id: string;
  title: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
}

function Questions() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { examId } = Route.useSearch();

  // Local dialog/form states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  // Form fields
  const [type, setType] = useState<"MCQ" | "ESSAY">("ESSAY");
  const [text, setText] = useState("");
  const [points, setPoints] = useState("5");
  
  // MCQ specific fields
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");
  const [optionD, setOptionD] = useState("");
  const [correctOption, setCorrectOption] = useState("A");

  // Essay specific fields
  const [expectedAnswer, setExpectedAnswer] = useState("");
  const [aiMarkingGuide, setAiMarkingGuide] = useState("");
  const [isAiSuggesting, setIsAiSuggesting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Fetch Exams list (if no examId in search param, to let user choose)
  const { data: examsData, isLoading: isLoadingExams } = useQuery({
    queryKey: ["exams"],
    queryFn: async () => {
      const res = await api.get<{ data: Exam[] }>("/exams");
      return res.data;
    },
  });

  const selectedExamId = examId || (examsData && examsData.length > 0 ? examsData[0].id : undefined);

  // Fetch Questions for selected exam
  const { data: questionsData, isLoading: isLoadingQuestions, error: questionsError } = useQuery({
    queryKey: ["questions", selectedExamId],
    queryFn: async () => {
      if (!selectedExamId) return [];
      const res = await api.get<{ data: Question[] }>(`/questions?examId=${selectedExamId}`);
      return res.data;
    },
    enabled: !!selectedExamId,
  });

  // AI Suggest Answer Mutation
  const suggestMutation = useMutation({
    mutationFn: async (questionText: string) => {
      const res = await api.post<{ data: { answer: string; markingGuide: string } }>("/questions/ai-suggest", {
        question: questionText,
      });
      return res.data;
    },
    onMutate: () => {
      setIsAiSuggesting(true);
    },
    onSuccess: (data) => {
      setExpectedAnswer(data.answer);
      setAiMarkingGuide(data.markingGuide);
      toast.success("AI suggested ideal answer and grading criteria populated!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to generate AI suggestions");
    },
    onSettled: () => {
      setIsAiSuggesting(false);
    },
  });

  // Create Question Mutation
  const createQuestionMutation = useMutation({
    mutationFn: async (payload: any) => {
      return await api.post<{ data: Question }>("/questions", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions", selectedExamId] });
      setDialogOpen(false);
      resetForm();
      toast.success("Question added successfully!");
    },
    onError: (err: any) => {
      const msg = err.message || "Failed to add question. Please try again.";
      setSubmitError(msg);
      toast.error(msg);
    },
  });

  // Update Question Mutation
  const updateQuestionMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: any }) => {
      return await api.put<{ data: Question }>(`/questions/${id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions", selectedExamId] });
      setDialogOpen(false);
      resetForm();
      toast.success("Question updated successfully!");
    },
    onError: (err: any) => {
      const msg = err.message || "Failed to update question. Please try again.";
      setSubmitError(msg);
      toast.error(msg);
    },
  });

  // Delete Question Mutation
  const deleteQuestionMutation = useMutation({
    mutationFn: async (id: string) => {
      return await api.delete(`/questions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions", selectedExamId] });
      toast.success("Question deleted successfully!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete question");
    },
  });

  const resetForm = () => {
    setEditingQuestion(null);
    setSubmitError(null);
    setType("ESSAY");
    setText("");
    setPoints("5");
    setOptionA("");
    setOptionB("");
    setOptionC("");
    setOptionD("");
    setCorrectOption("A");
    setExpectedAnswer("");
    setAiMarkingGuide("");
  };

  const handleOpenCreateDialog = () => {
    resetForm();
    setSubmitError(null);
    setDialogOpen(true);
  };

  const handleOpenEditDialog = (q: Question) => {
    setSubmitError(null);
    setEditingQuestion(q);
    setType(q.type);
    setText(q.text);
    setPoints(String(q.points));
    if (q.type === "MCQ") {
      setOptionA(q.options?.[0] || "");
      setOptionB(q.options?.[1] || "");
      setOptionC(q.options?.[2] || "");
      setOptionD(q.options?.[3] || "");
      setCorrectOption(q.correctOption || "A");
    } else {
      setExpectedAnswer(q.expectedAnswer || "");
      setAiMarkingGuide(q.aiMarkingGuide || "");
    }
    setDialogOpen(true);
  };

  const handleAiSuggest = () => {
    if (!text.trim()) {
      toast.error("Please enter a question text first.");
      return;
    }
    suggestMutation.mutate(text);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      toast.error("Question text is required.");
      return;
    }

    const payload: any = {
      examId: selectedExamId,
      type,
      text,
      points: parseInt(points, 10),
    };

    if (type === "MCQ") {
      if (!optionA || !optionB) {
        toast.error("MCQ requires at least Option A and Option B.");
        return;
      }
      payload.options = [optionA, optionB];
      if (optionC) payload.options.push(optionC);
      if (optionD) payload.options.push(optionD);
      payload.correctOption = correctOption;
    } else {
      payload.expectedAnswer = expectedAnswer || null;
      payload.aiMarkingGuide = aiMarkingGuide || null;
    }

    if (editingQuestion) {
      updateQuestionMutation.mutate({ id: editingQuestion.id, payload });
    } else {
      createQuestionMutation.mutate(payload);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to remove this question?")) {
      deleteQuestionMutation.mutate(id);
    }
  };

  const activeExam = examsData?.find((ex) => ex.id === selectedExamId);
  const questions = questionsData || [];

  const isMutating =
    createQuestionMutation.isPending ||
    updateQuestionMutation.isPending ||
    deleteQuestionMutation.isPending;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manage Questions"
        description="Configure exam questions, specify correct answers, and generate AI grading guidelines."
        actions={
          selectedExamId && activeExam?.status === "DRAFT" ? (
            <Button
              className="rounded-full bg-gradient-primary shadow-glow gap-2 cursor-pointer"
              onClick={handleOpenCreateDialog}
              disabled={isMutating}
            >
              <Plus className="h-4 w-4" /> Add Question
            </Button>
          ) : undefined
        }
      />

      {/* Exam Selector Dropdown */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center bg-card p-4 rounded-xl border border-border/50">
        <div className="flex items-center gap-2 text-sm font-medium">
          <BookOpen className="h-4 w-4 text-primary" />
          <span>Active Exam:</span>
        </div>
        <div className="flex-1 max-w-md">
          {isLoadingExams ? (
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          ) : (
            <Select
              value={selectedExamId}
              onValueChange={(val) => navigate({ to: "/questions", search: { examId: val } })}
            >
              <SelectTrigger className="w-full bg-background rounded-full">
                <SelectValue placeholder="Select an exam" />
              </SelectTrigger>
              <SelectContent>
                {examsData && examsData.length > 0 ? (
                  examsData.map((ex) => (
                    <SelectItem key={ex.id} value={ex.id}>
                      {ex.title} ({ex.status.toLowerCase()})
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="empty" disabled>
                    No exams available (Empty)
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          )}
        </div>
        {activeExam && (
          <Badge variant="outline" className="sm:ml-auto w-fit capitalize bg-background">
            Status: {activeExam.status.toLowerCase()}
          </Badge>
        )}
      </div>

      {!selectedExamId ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed p-8 text-center bg-card/30">
          <p className="text-lg font-semibold">No active exam selected</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Please create an exam draft or select an existing exam from the dropdown.
          </p>
        </div>
      ) : isLoadingQuestions ? (
        <div className="flex h-64 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Fetching questions...</p>
          </div>
        </div>
      ) : questionsError ? (
        <Card className="border-destructive/35 bg-destructive/5 p-6">
          <div className="flex items-center gap-3 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span className="font-semibold">Failed to load questions</span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {(questionsError as any)?.message || "Verify your ownership of this exam."}
          </p>
        </Card>
      ) : questions.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed p-8 text-center bg-card/30">
          <p className="text-lg font-semibold">No questions added yet</p>
          {activeExam?.status === "DRAFT" ? (
            <>
              <p className="mt-1 text-sm text-muted-foreground">
                Get started by clicking the "Add Question" button.
              </p>
              <Button className="mt-4 rounded-full bg-gradient-primary cursor-pointer gap-2" onClick={handleOpenCreateDialog}>
                <Plus className="h-4 w-4" /> Add First Question
              </Button>
            </>
          ) : (
            <p className="mt-1 text-sm text-muted-foreground">
              This exam is published and cannot have questions added.
            </p>
          )}
        </div>
      ) : (
        <Tabs defaultValue="all">
          <TabsList className="rounded-full bg-muted">
            <TabsTrigger value="all" className="rounded-full">All ({questions.length})</TabsTrigger>
            <TabsTrigger value="mcq" className="rounded-full">MCQ</TabsTrigger>
            <TabsTrigger value="essay" className="rounded-full">Essay</TabsTrigger>
          </TabsList>
          
          {["all", "mcq", "essay"].map((tab) => {
            const list = questions.filter((q) => {
              if (tab === "all") return true;
              return q.type.toLowerCase() === tab;
            });
            return (
              <TabsContent key={tab} value={tab} className="mt-4 space-y-3">
                {list.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-6 text-center">
                    No questions match this filter.
                  </p>
                ) : (
                  list.map((q, i) => (
                    <Card key={q.id} className="shadow-card transition hover:shadow-soft bg-background border-border/60">
                      <CardContent className="flex items-start gap-4 p-4">
                        <div className="mt-1 text-muted-foreground">
                          <GripVertical className="h-4 w-4" />
                        </div>
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-bold">
                          {i + 1}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge
                              variant="secondary"
                              className={
                                q.type === "ESSAY"
                                  ? "bg-chart-3/15 text-chart-3"
                                  : "bg-primary/15 text-primary"
                              }
                            >
                              {q.type}
                            </Badge>
                            <span className="text-xs text-muted-foreground font-semibold">{q.points} pts</span>
                          </div>
                          <p className="text-sm font-medium text-foreground pr-4 pt-1">{q.text}</p>
                          
                          {q.type === "MCQ" && q.options && (
                            <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t text-xs">
                              {q.options.map((opt, idx) => {
                                const letter = String.fromCharCode(65 + idx); // A, B, C, D
                                const isCorrect = q.correctOption === letter;
                                return (
                                  <div
                                    key={idx}
                                    className={`p-2 rounded-lg border ${
                                      isCorrect
                                        ? "border-success/40 bg-success/10 text-success font-medium"
                                        : "border-border/60 bg-muted/30"
                                    }`}
                                  >
                                    <span className="font-bold mr-1.5">{letter}.</span>
                                    {opt}
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {q.type === "ESSAY" && q.expectedAnswer && (
                            <div className="mt-3 pt-2 border-t text-xs space-y-1 bg-muted/20 p-2.5 rounded-lg border border-border/40">
                              <p className="font-semibold text-foreground">Expected Answer Snippet:</p>
                              <p className="text-muted-foreground line-clamp-2">{q.expectedAnswer}</p>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-1">
                          {activeExam?.status === "DRAFT" ? (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 cursor-pointer"
                                onClick={() => handleOpenEditDialog(q)}
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:bg-destructive/10 cursor-pointer"
                                onClick={() => handleDelete(q.id)}
                                disabled={isMutating}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </>
                          ) : (
                            <Badge variant="outline">View Only</Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      )}

      {/* Add / Edit Question Dialog Modal */}
      <Dialog open={dialogOpen} onOpenChange={(val) => !isMutating && setDialogOpen(val)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-background border-border/65">
          <DialogHeader>
            <DialogTitle>{editingQuestion ? "Edit Question" : "Add Question"}</DialogTitle>
            <DialogDescription>
              Provide question prompt, points weight, and grading rubric parameters.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="qType">Question Type</Label>
                <Select value={type} onValueChange={(val) => setType(val as "MCQ" | "ESSAY")}>
                  <SelectTrigger id="qType">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ESSAY">Theory (Essay)</SelectItem>
                    <SelectItem value="MCQ">Objective (MCQ)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="qPoints">Points / Score</Label>
                <Input
                  id="qPoints"
                  type="number"
                  min="1"
                  max="100"
                  value={points}
                  onChange={(e) => setPoints(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="qText">Question Text</Label>
              <Textarea
                id="qText"
                placeholder="Write the question prompt here..."
                rows={3}
                value={text}
                onChange={(e) => setText(e.target.value)}
                required
              />
            </div>

            {type === "MCQ" ? (
              <div className="space-y-4 border-t pt-4">
                <p className="text-sm font-semibold">MCQ Options Configuration</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label htmlFor="optA">Option A</Label>
                    <Input
                      id="optA"
                      placeholder="Choice A text"
                      value={optionA}
                      onChange={(e) => setOptionA(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="optB">Option B</Label>
                    <Input
                      id="optB"
                      placeholder="Choice B text"
                      value={optionB}
                      onChange={(e) => setOptionB(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="optC">Option C (Optional)</Label>
                    <Input
                      id="optC"
                      placeholder="Choice C text"
                      value={optionC}
                      onChange={(e) => setOptionC(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="optD">Option D (Optional)</Label>
                    <Input
                      id="optD"
                      placeholder="Choice D text"
                      value={optionD}
                      onChange={(e) => setOptionD(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="correctOpt">Correct Option</Label>
                  <Select value={correctOption} onValueChange={setCorrectOption}>
                    <SelectTrigger id="correctOpt">
                      <SelectValue placeholder="Correct option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">Option A</SelectItem>
                      <SelectItem value="B">Option B</SelectItem>
                      {optionC && <SelectItem value="C">Option C</SelectItem>}
                      {optionD && <SelectItem value="D">Option D</SelectItem>}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : (
              <div className="space-y-4 border-t pt-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">Essay Evaluation Criteria</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-full text-xs gap-1 border-primary/40 text-primary hover:bg-primary/5 cursor-pointer"
                    onClick={handleAiSuggest}
                    disabled={isAiSuggesting}
                  >
                    {isAiSuggesting ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Sparkles className="h-3 w-3" />
                    )}
                    Generate Guide with Gemini
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expected">Expected Answer</Label>
                  <Textarea
                    id="expected"
                    placeholder="Enter the expected ideal explanation or bullet points..."
                    rows={4}
                    value={expectedAnswer}
                    onChange={(e) => setExpectedAnswer(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rubric">AI Marking Guide / Rubrics</Label>
                  <Textarea
                    id="rubric"
                    placeholder="Provide points breakdown or evaluation guidelines..."
                    rows={4}
                    value={aiMarkingGuide}
                    onChange={(e) => setAiMarkingGuide(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Inline error banner */}
            {submitError && (
              <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            <DialogFooter className="border-t pt-4">
              <Button
                type="button"
                variant="outline"
                className="rounded-full cursor-pointer"
                onClick={() => setDialogOpen(false)}
                disabled={isMutating}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-full bg-gradient-primary cursor-pointer gap-1.5"
                disabled={isMutating}
              >
                {isMutating && <Loader2 className="h-4 w-4 animate-spin" />}
                {editingQuestion ? "Save Changes" : "Create Question"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

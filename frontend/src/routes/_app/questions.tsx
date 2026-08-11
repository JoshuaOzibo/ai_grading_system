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
  X,
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

  // AI Batch Gen states
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [topics, setTopics] = useState<string[]>([]);
  const [currentTopic, setCurrentTopic] = useState("");
  const [aiNumQuestions, setAiNumQuestions] = useState("5");
  const [aiQuestionType, setAiQuestionType] = useState<"MCQ" | "ESSAY">("ESSAY");

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

  const aiBatchGenerateMutation = useMutation({
    mutationFn: async (vars: { topic: string; numQuestions: number; questionType: string }) => {
      const res = await api.post<{ data: Question[] }>(`/exams/${selectedExamId}/generate-questions`, vars);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions", selectedExamId] });
      setAiDialogOpen(false);
      setTopics([]);
      setCurrentTopic("");
      toast.success("AI generated and added questions to exam successfully!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to generate questions using AI");
    },
  });

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

    const count = parseInt(aiNumQuestions, 10);
    if (isNaN(count) || count < 1) {
      toast.error("Please enter a valid number of questions (at least 1).");
      return;
    }

    aiBatchGenerateMutation.mutate({
      topic: finalTopics.join(", "),
      numQuestions: count,
      questionType: aiQuestionType,
    });
  };

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
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                className="rounded-full gap-2 cursor-pointer border-primary/40 hover:bg-primary/10 text-primary font-medium"
                onClick={() => setAiDialogOpen(true)}
                disabled={isMutating || aiBatchGenerateMutation.isPending}
              >
                <Sparkles className="h-4 w-4 text-primary" /> Generate with AI
              </Button>
              <Button
                className="rounded-full bg-gradient-primary shadow-glow gap-2 cursor-pointer"
                onClick={handleOpenCreateDialog}
                disabled={isMutating || aiBatchGenerateMutation.isPending}
              >
                <Plus className="h-4 w-4" /> Add Question
              </Button>
            </div>
          ) : undefined
        }
      />

      {/* Exam Selector Dropdown */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center bg-card p-4 rounded-xl border border-border/50 min-w-0 max-w-full overflow-hidden">
        <div className="flex items-center gap-2 text-sm font-medium shrink-0">
          <BookOpen className="h-4 w-4 text-primary" />
          <span>Active Exam:</span>
        </div>
        <div className="flex-1 w-full sm:max-w-md min-w-0">
          {isLoadingExams ? (
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          ) : (
            <Select
              value={selectedExamId}
              onValueChange={(val) => navigate({ to: "/questions", search: { examId: val } })}
            >
              <SelectTrigger className="w-full bg-background rounded-full min-w-0">
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
          <Badge variant="outline" className="sm:ml-auto w-fit capitalize bg-background shrink-0">
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
        <Tabs defaultValue="all" className="w-full min-w-0">
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
              <TabsContent key={tab} value={tab} className="mt-4 space-y-3 min-w-0">
                {list.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-6 text-center">
                    No questions match this filter.
                  </p>
                ) : (
                  list.map((q, i) => (
                    <Card key={q.id} className="shadow-card transition hover:shadow-soft bg-background border-border/60 overflow-hidden">
                      <CardContent className="flex items-start gap-2.5 sm:gap-4 p-3.5 sm:p-4 min-w-0">
                        <div className="mt-1 text-muted-foreground hidden sm:block shrink-0">
                          <GripVertical className="h-4 w-4" />
                        </div>
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-bold">
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
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
                          <p className="text-sm font-medium text-foreground pt-1 break-words">{q.text}</p>
                          
                          {q.type === "MCQ" && q.options && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pt-2 border-t text-xs">
                              {q.options.map((opt, idx) => {
                                const letter = String.fromCharCode(65 + idx); // A, B, C, D
                                const isCorrect = q.correctOption === letter;
                                return (
                                  <div
                                    key={idx}
                                    className={`p-2 rounded-lg border flex items-start gap-1.5 break-words ${
                                      isCorrect
                                        ? "border-success/40 bg-success/10 text-success font-medium"
                                        : "border-border/60 bg-muted/30"
                                    }`}
                                  >
                                    <span className="font-bold shrink-0">{letter}.</span>
                                    <span className="min-w-0 break-words">{opt}</span>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {q.type === "ESSAY" && q.expectedAnswer && (
                            <div className="mt-3 pt-2 border-t text-xs space-y-1 bg-muted/20 p-2.5 rounded-lg border border-border/40 min-w-0">
                              <p className="font-semibold text-foreground">Expected Answer Snippet:</p>
                              <p className="text-muted-foreground line-clamp-2 break-words">{q.expectedAnswer}</p>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-1 shrink-0 ml-auto">
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
                            <Badge variant="outline" className="text-xs shrink-0">View Only</Badge>
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

      {/* AI Batch Questions Generator Dialog */}
      <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
        <DialogContent className="sm:max-w-md bg-background border border-border">
          <form onSubmit={handleAiGenerateSubmit}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                AI Question Generator
              </DialogTitle>
              <DialogDescription>
                Specify topics and desired question count to instantly generate AI questions for this exam.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-3">
                <Label htmlFor="q-topic-input">Topics / Syllabus Points</Label>
                <div className="flex gap-2">
                  <Input
                    id="q-topic-input"
                    placeholder="Paste or type topics (e.g., Database Normalization, SQL Joins)..."
                    value={currentTopic}
                    onChange={(e) => setCurrentTopic(e.target.value)}
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
                  💡 Tip: Paste topics or paste questions into the input field above, then click <strong>+</strong> or press <strong>Enter</strong> to arrange into tags.
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="aiNumQuestions">Number of Questions</Label>
                  <Input
                    id="aiNumQuestions"
                    type="number"
                    min={1}
                    max={50}
                    value={aiNumQuestions}
                    onChange={(e) => setAiNumQuestions(e.target.value)}
                    placeholder="Enter count (e.g. 5)"
                    className="rounded-full bg-background font-medium"
                  />
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {["3", "5", "10", "15", "20"].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setAiNumQuestions(preset)}
                        className={`text-[11px] px-2.5 py-0.5 rounded-full border transition-all cursor-pointer font-medium ${
                          aiNumQuestions === preset
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-muted/40 text-muted-foreground hover:bg-muted border-border/60"
                        }`}
                      >
                        {preset} Qs
                      </button>
                    ))}
                  </div>
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
                  <p className="text-[11px] text-muted-foreground pt-1">
                    {aiQuestionType === "MCQ"
                      ? "Strictly 4-choice objective questions with correct keys."
                      : "Strictly open-ended theory questions with marking guides."}
                  </p>
                </div>
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                className="rounded-full cursor-pointer"
                onClick={() => setAiDialogOpen(false)}
                disabled={aiBatchGenerateMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-full bg-gradient-primary cursor-pointer gap-2"
                disabled={aiBatchGenerateMutation.isPending}
              >
                {aiBatchGenerateMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate Questions
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

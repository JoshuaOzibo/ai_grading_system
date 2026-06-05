import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Sparkles, ListChecks, Save, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
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

  const createExamMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        title,
        description,
        duration: parseInt(duration, 10),
        startDate,
        endDate,
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
    if (start >= end) {
      toast.error("Start date must be before end date.");
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
              <Button type="button" className="mt-4 w-full rounded-full bg-gradient-primary cursor-pointer">
                Try AI generation
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

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

import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Sparkles, ListChecks, Save, ArrowRight } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/_app/exams/create")({
  component: CreateExam,
});

function CreateExam() {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Exam"
        description="Set up your exam details. You can add questions in the next step."
        actions={
          <>
            <Button variant="outline" className="rounded-full">Save draft</Button>
            <Button onClick={() => setOpen(true)} className="rounded-full bg-gradient-primary shadow-glow gap-2">
              <Save className="h-4 w-4" /> Create exam
            </Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 shadow-card">
          <CardHeader>
            <CardTitle>Exam Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="title">Exam Title</Label>
              <Input id="title" placeholder="e.g. Data Structures Final" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Course</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cs201">CS 201 — Data Structures</SelectItem>
                    <SelectItem value="cs301">CS 301 — Algorithms</SelectItem>
                    <SelectItem value="math210">MATH 210 — Discrete Math</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Duration</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Select duration" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="90">90 minutes</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input id="time" type="time" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="desc">Description</Label>
              <Textarea id="desc" placeholder="Brief instructions for students..." rows={4} />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="shadow-card">
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
              <Button className="mt-4 w-full rounded-full bg-gradient-primary">
                Try AI generation
              </Button>
            </CardContent>
          </Card>

          <Button asChild variant="outline" className="w-full rounded-full gap-2">
            <Link to="/questions">
              <ListChecks className="h-4 w-4" /> Manage questions <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
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
              Your exam has been saved. You can now add questions and assign students.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button asChild className="rounded-full bg-gradient-primary">
              <Link to="/questions">Add Questions</Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

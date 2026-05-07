import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Sparkles, Trash2, Edit3, GripVertical } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export const Route = createFileRoute("/_app/questions")({
  component: Questions,
});

const questions = [
  { id: 1, type: "MCQ", text: "Which data structure uses LIFO order?", points: 5 },
  { id: 2, type: "MCQ", text: "Time complexity of binary search?", points: 5 },
  { id: 3, type: "Theory", text: "Explain the difference between BFS and DFS.", points: 15 },
  { id: 4, type: "Theory", text: "Describe how a hash map handles collisions.", points: 20 },
  { id: 5, type: "Short", text: "Define recursion in one sentence.", points: 5 },
];

function Questions() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Manage Questions"
        description="Add, edit, and organize questions for your exam."
        actions={
          <>
            <Button variant="outline" className="rounded-full gap-2">
              <Sparkles className="h-4 w-4 text-primary" /> AI Generate
            </Button>
            <Button className="rounded-full bg-gradient-primary shadow-glow gap-2">
              <Plus className="h-4 w-4" /> Add Question
            </Button>
          </>
        }
      />

      <Tabs defaultValue="all">
        <TabsList className="rounded-full">
          <TabsTrigger value="all" className="rounded-full">All ({questions.length})</TabsTrigger>
          <TabsTrigger value="mcq" className="rounded-full">Objective</TabsTrigger>
          <TabsTrigger value="theory" className="rounded-full">Theory</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-4 space-y-3">
          {questions.map((q, i) => (
            <Card key={q.id} className="shadow-card transition hover:shadow-soft">
              <CardContent className="flex items-start gap-4 p-4">
                <button className="mt-1 cursor-grab text-muted-foreground hover:text-foreground">
                  <GripVertical className="h-4 w-4" />
                </button>
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-bold">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant="secondary"
                      className={
                        q.type === "Theory"
                          ? "bg-chart-3/15 text-chart-3"
                          : q.type === "MCQ"
                            ? "bg-primary/15 text-primary"
                            : "bg-chart-2/15 text-chart-2"
                      }
                    >
                      {q.type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{q.points} pts</span>
                  </div>
                  <p className="mt-2 text-sm font-medium">{q.text}</p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Edit3 className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        <TabsContent value="mcq" className="mt-4 text-sm text-muted-foreground">
          Filter showing objective questions.
        </TabsContent>
        <TabsContent value="theory" className="mt-4 text-sm text-muted-foreground">
          Filter showing theory questions.
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_app/results")({
  component: Results,
});

const results = [
  { student: "Ada Lovelace", id: "STU-1024", exam: "CS 201 Final", score: 92, grade: "A" },
  { student: "Tunde Adebayo", id: "STU-1025", exam: "CS 201 Final", score: 78, grade: "B" },
  { student: "Maya Rodriguez", id: "STU-1026", exam: "CS 201 Final", score: 85, grade: "A" },
  { student: "Kofi Boateng", id: "STU-1027", exam: "CS 201 Final", score: 64, grade: "C" },
  { student: "Lin Wei", id: "STU-1028", exam: "CS 201 Final", score: 95, grade: "A" },
  { student: "Sara Mensah", id: "STU-1029", exam: "CS 201 Final", score: 71, grade: "B" },
];

const gradeColor: Record<string, string> = {
  A: "bg-success/15 text-success",
  B: "bg-primary/15 text-primary",
  C: "bg-warning/15 text-warning-foreground",
  D: "bg-destructive/15 text-destructive",
  F: "bg-destructive/15 text-destructive",
};

function Results() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Exam Results"
        description="Final scores after AI grading and lecturer review."
        actions={
          <Button className="rounded-full bg-gradient-primary shadow-glow gap-2">
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        }
      />

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search student or ID..." className="pl-9 rounded-full" />
      </div>

      <Card className="shadow-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-4 font-medium">Student</th>
                  <th className="px-5 py-4 font-medium">ID</th>
                  <th className="px-5 py-4 font-medium">Exam</th>
                  <th className="px-5 py-4 font-medium">Score</th>
                  <th className="px-5 py-4 font-medium">Grade</th>
                  <th className="px-5 py-4 font-medium" />
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r.id} className="border-b last:border-0 transition hover:bg-muted/30">
                    <td className="px-5 py-4 font-medium">{r.student}</td>
                    <td className="px-5 py-4 text-muted-foreground">{r.id}</td>
                    <td className="px-5 py-4 text-muted-foreground">{r.exam}</td>
                    <td className="px-5 py-4 font-bold text-gradient">{r.score}</td>
                    <td className="px-5 py-4">
                      <Badge variant="secondary" className={gradeColor[r.grade]}>
                        {r.grade}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Button size="sm" variant="ghost">View</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

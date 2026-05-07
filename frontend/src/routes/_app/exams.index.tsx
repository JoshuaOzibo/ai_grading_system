import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Search, Calendar, Users, MoreHorizontal } from "lucide-react";

export const Route = createFileRoute("/_app/exams/")({
  component: Exams,
});

const exams = [
  { id: 1, title: "Data Structures Final", course: "CS 201", date: "May 12", students: 124, status: "Active" },
  { id: 2, title: "Algorithms Mid-term", course: "CS 301", date: "May 18", students: 88, status: "Draft" },
  { id: 3, title: "Operating Systems", course: "CS 305", date: "May 22", students: 102, status: "Scheduled" },
  { id: 4, title: "Discrete Math", course: "MATH 210", date: "Apr 30", students: 156, status: "Graded" },
  { id: 5, title: "Web Development", course: "CS 250", date: "Apr 25", students: 73, status: "Graded" },
  { id: 6, title: "Linear Algebra", course: "MATH 220", date: "May 28", students: 92, status: "Scheduled" },
];

const statusColor: Record<string, string> = {
  Active: "bg-primary/15 text-primary",
  Draft: "bg-muted text-muted-foreground",
  Scheduled: "bg-chart-2/15 text-chart-2",
  Graded: "bg-success/15 text-success",
};

function Exams() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Exams"
        description="Manage all exams across your courses."
        actions={
          <Button asChild className="rounded-full bg-gradient-primary shadow-glow gap-2">
            <Link to="/exams/create">
              <PlusCircle className="h-4 w-4" /> New Exam
            </Link>
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search exams..." className="pl-9 rounded-full" />
        </div>
        <div className="flex gap-2">
          {["All", "Active", "Draft", "Graded"].map((f, i) => (
            <Button
              key={f}
              variant={i === 0 ? "default" : "outline"}
              size="sm"
              className="rounded-full"
            >
              {f}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {exams.map((e) => (
          <Card key={e.id} className="group shadow-card transition hover:-translate-y-1 hover:shadow-soft">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <Badge variant="secondary" className={statusColor[e.status]}>
                  {e.status}
                </Badge>
                <button className="text-muted-foreground hover:text-foreground">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>
              <h3 className="mt-3 text-lg font-semibold">{e.title}</h3>
              <p className="text-sm text-muted-foreground">{e.course}</p>
              <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> {e.date}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" /> {e.students} students
                </span>
              </div>
              <div className="mt-5 flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 rounded-full">
                  View
                </Button>
                <Button size="sm" className="flex-1 rounded-full bg-gradient-primary">
                  Open
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

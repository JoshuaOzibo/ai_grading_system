import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "@tanstack/react-router";
import { GraduationCap, Trophy, Clock, BookOpen, Upload, ArrowRight } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const upcoming = [
  { name: "Data Structures Final", date: "May 12, 9:00 AM", duration: "2 hours" },
  { name: "Algorithms Mid-term", date: "May 18, 1:00 PM", duration: "90 min" },
  { name: "Operating Systems Quiz", date: "May 22, 10:00 AM", duration: "45 min" },
];

const history = [
  { exam: "Web Dev", score: 78 }, { exam: "Networks", score: 82 },
  { exam: "Databases", score: 88 }, { exam: "AI Intro", score: 91 },
  { exam: "Math 201", score: 84 }, { exam: "Physics", score: 79 },
];

export function StudentDashboard() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Hello, Ada 👋"
        description="Stay on top of your exams and progress."
        actions={
          <Button asChild className="rounded-full bg-gradient-primary shadow-glow gap-2">
            <Link to="/upload">
              <Upload className="h-4 w-4" /> Upload Answer
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Upcoming Exams" value="3" icon={Clock} accent="primary" />
        <StatCard label="Completed" value="24" delta="+2 this month" icon={GraduationCap} accent="blue" />
        <StatCard label="Average Score" value="83%" delta="+5%" icon={Trophy} accent="green" />
        <StatCard label="Courses" value="6" icon={BookOpen} accent="purple" />
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Upcoming Exams</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {upcoming.map((e) => (
            <div
              key={e.name}
              className="flex flex-col gap-3 rounded-xl border p-4 transition hover:border-primary/40 hover:bg-accent/40 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-semibold">{e.name}</p>
                <p className="text-sm text-muted-foreground">
                  {e.date} · {e.duration}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-primary/15 text-primary">
                  Scheduled
                </Badge>
                <Button size="sm" variant="outline" className="rounded-full gap-1">
                  Details <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "@tanstack/react-router";
import { Brain, FileText, Users, Trophy, PlusCircle, Sparkles, Download } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const submissions = [
  { exam: "CS 201 Final", student: "Ada L.", score: 92, status: "Reviewed" },
  { exam: "CS 201 Final", student: "Tunde A.", score: 78, status: "AI Suggested" },
  { exam: "CS 201 Final", student: "Maya R.", score: 85, status: "AI Suggested" },
  { exam: "CS 201 Final", student: "Kofi B.", score: 64, status: "Needs Review" },
  { exam: "CS 201 Final", student: "Lin W.", score: 95, status: "Reviewed" },
];

const chartData = [
  { topic: "Arrays", avg: 82 }, { topic: "Trees", avg: 71 },
  { topic: "Graphs", avg: 64 }, { topic: "DP", avg: 58 },
  { topic: "Sort", avg: 88 },
];

export function LecturerDashboard() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Good morning, Dr. Adesina"
        description="Here's what's happening with your exams today."
        actions={
          <>
            <Button variant="outline" className="rounded-full gap-2">
              <Download className="h-4 w-4" /> Export
            </Button>
            <Button asChild className="rounded-full bg-gradient-primary shadow-glow gap-2">
              <Link to="/exams/create">
                <PlusCircle className="h-4 w-4" /> New Exam
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active Exams" value="8" delta="+2 this week" icon={FileText} accent="primary" />
        <StatCard label="Pending Grading" value="42" delta="-15%" trend="down" icon={Brain} accent="purple" />
        <StatCard label="My Students" value="312" delta="+8" icon={Users} accent="blue" />
        <StatCard label="Avg. Class Score" value="78%" delta="+3.2%" icon={Trophy} accent="green" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 shadow-card">
          <CardHeader>
            <CardTitle>Average Score by Topic</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="topic" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                  }}
                />
                <Bar dataKey="avg" fill="var(--chart-1)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              AI Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Grading completion</span>
                <span className="font-semibold">76%</span>
              </div>
              <Progress value={76} className="mt-2 h-2" />
            </div>
            <div className="rounded-xl border bg-gradient-soft p-3 text-sm">
              <p className="font-medium">Weak topic detected</p>
              <p className="mt-1 text-muted-foreground">
                58% average on Dynamic Programming. Consider a recap session.
              </p>
            </div>
            <div className="rounded-xl border p-3 text-sm">
              <p className="font-medium">3 essays flagged</p>
              <p className="mt-1 text-muted-foreground">
                Possible AI-generated content. Review recommended.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Recent Submissions</CardTitle>
          <Button asChild variant="ghost" size="sm">
            <Link to="/ai-grading">View all</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="pb-3 font-medium">Student</th>
                  <th className="pb-3 font-medium">Exam</th>
                  <th className="pb-3 font-medium">AI Score</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((s, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="py-3 font-medium">{s.student}</td>
                    <td className="py-3 text-muted-foreground">{s.exam}</td>
                    <td className="py-3">
                      <span className="font-semibold text-gradient">{s.score}</span>
                    </td>
                    <td className="py-3">
                      <Badge
                        variant="secondary"
                        className={
                          s.status === "Reviewed"
                            ? "bg-success/15 text-success"
                            : s.status === "AI Suggested"
                              ? "bg-primary/15 text-primary"
                              : "bg-warning/15 text-warning-foreground"
                        }
                      >
                        {s.status}
                      </Badge>
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

import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Target, Award, BookOpen } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Radar,
  RadarChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export const Route = createFileRoute("/_app/analytics")({
  component: Analytics,
});

const trend = [
  { m: "Wk 1", v: 72 }, { m: "Wk 2", v: 78 }, { m: "Wk 3", v: 75 },
  { m: "Wk 4", v: 82 }, { m: "Wk 5", v: 85 }, { m: "Wk 6", v: 88 },
];

const subjects = [
  { subject: "CS", A: 85 }, { subject: "Math", A: 72 },
  { subject: "Physics", A: 78 }, { subject: "Bio", A: 65 },
  { subject: "Eng", A: 90 }, { subject: "Hist", A: 70 },
];

const compare = [
  { name: "Q1", you: 78, avg: 65 },
  { name: "Q2", you: 82, avg: 70 },
  { name: "Q3", you: 88, avg: 75 },
  { name: "Q4", you: 75, avg: 72 },
  { name: "Q5", you: 92, avg: 80 },
];

function Analytics() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Performance Analytics"
        description="Detailed insights into performance trends and weak areas."
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Overall Avg" value="83%" delta="+5.2%" icon={TrendingUp} accent="primary" />
        <StatCard label="Best Subject" value="English" icon={Award} accent="green" />
        <StatCard label="Needs Focus" value="Biology" icon={Target} accent="purple" />
        <StatCard label="Topics Covered" value="128" delta="+12" icon={BookOpen} accent="blue" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 shadow-card">
          <CardHeader>
            <CardTitle>Weekly Performance Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-3)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--chart-3)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="m" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12 }} />
                <Area type="monotone" dataKey="v" stroke="var(--chart-3)" fill="url(#g2)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Subject Strength</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={subjects}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                <PolarRadiusAxis tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} />
                <Radar dataKey="A" stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>You vs Class Average</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={compare}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} />
              <YAxis stroke="var(--muted-foreground)" fontSize={12} />
              <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12 }} />
              <Bar dataKey="you" fill="var(--chart-1)" radius={[8, 8, 0, 0]} />
              <Bar dataKey="avg" fill="var(--chart-2)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

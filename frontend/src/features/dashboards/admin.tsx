import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "@tanstack/react-router";
import { Users, FileText, Settings, ShieldAlert, Activity, UserPlus } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const systemAlerts = [
  { message: "High CPU usage detected on database server", severity: "High", time: "10 min ago" },
  { message: "New lecturer registration pending approval", severity: "Medium", time: "1 hour ago" },
  { message: "Failed login attempts from IP 192.168.1.1", severity: "Medium", time: "2 hours ago" },
  { message: "System backup completed successfully", severity: "Low", time: "12 hours ago" },
];

const activityData = [
  { day: "Mon", users: 120 }, { day: "Tue", users: 150 },
  { day: "Wed", users: 180 }, { day: "Thu", users: 170 },
  { day: "Fri", users: 210 }, { day: "Sat", users: 90 },
  { day: "Sun", users: 110 },
];

export function AdminDashboard() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Dashboard"
        description="System overview and administration."
        actions={
          <>
            <Button variant="outline" className="rounded-full gap-2">
              <Settings className="h-4 w-4" /> Settings
            </Button>
            <Button asChild className="rounded-full bg-gradient-primary shadow-glow gap-2">
              <Link to="/">
                <UserPlus className="h-4 w-4" /> Manage Users
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Users" value="1,248" delta="+12 this week" icon={Users} accent="primary" />
        <StatCard label="Active Exams" value="15" delta="+3 today" icon={FileText} accent="blue" />
        <StatCard label="System Alerts" value="4" delta="Needs attention" trend="down" icon={ShieldAlert} accent="purple" />
        <StatCard label="System Load" value="42%" delta="Normal" icon={Activity} accent="green" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 shadow-card">
          <CardHeader>
            <CardTitle>System Activity (Weekly)</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                  }}
                />
                <Bar dataKey="users" fill="var(--chart-1)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Resource Usage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">CPU Usage</span>
                <span className="font-semibold">42%</span>
              </div>
              <Progress value={42} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Memory Usage</span>
                <span className="font-semibold">68%</span>
              </div>
              <Progress value={68} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Storage</span>
                <span className="font-semibold">35%</span>
              </div>
              <Progress value={35} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Recent System Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {systemAlerts.map((alert, i) => (
              <div key={i} className="flex items-start justify-between border-b pb-4 last:border-0 last:pb-0">
                <div className="flex flex-col gap-1">
                  <span className="font-medium text-sm">{alert.message}</span>
                  <span className="text-xs text-muted-foreground">{alert.time}</span>
                </div>
                <Badge
                  variant="secondary"
                  className={
                    alert.severity === "High"
                      ? "bg-destructive/15 text-destructive"
                      : alert.severity === "Medium"
                        ? "bg-warning/15 text-warning-foreground"
                        : "bg-success/15 text-success"
                  }
                >
                  {alert.severity}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

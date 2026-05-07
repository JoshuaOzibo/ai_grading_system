import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, CheckCircle2, FileText, Sparkles, Trophy, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app/notifications")({
  component: Notifications,
});

const notifs = [
  { icon: Sparkles, color: "text-primary bg-primary/15", title: "AI grading complete", desc: "CS 201 Final — 124 submissions graded", time: "2 min ago", unread: true },
  { icon: Trophy, color: "text-success bg-success/15", title: "New top score!", desc: "Lin Wei scored 95% on CS 201 Final", time: "12 min ago", unread: true },
  { icon: AlertCircle, color: "text-warning-foreground bg-warning/15", title: "3 essays need review", desc: "Low-confidence AI scores", time: "1 hr ago", unread: true },
  { icon: FileText, color: "text-chart-2 bg-chart-2/15", title: "New exam created", desc: "Algorithms Mid-term scheduled for May 18", time: "3 hr ago" },
  { icon: CheckCircle2, color: "text-success bg-success/15", title: "Results published", desc: "Discrete Math results sent to 156 students", time: "Yesterday" },
];

function Notifications() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Stay updated on grading, results, and student activity."
        actions={<Button variant="outline" className="rounded-full">Mark all as read</Button>}
      />

      <Card className="shadow-card">
        <CardContent className="divide-y p-0">
          {notifs.map((n, i) => (
            <div key={i} className="flex gap-4 p-5 transition hover:bg-muted/30">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${n.color}`}>
                <n.icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{n.title}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">{n.desc}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{n.time}</span>
                </div>
              </div>
              {n.unread && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />}
            </div>
          ))}
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground">
        <Bell className="mr-1 inline h-3 w-3" /> You're all caught up
      </p>
    </div>
  );
}

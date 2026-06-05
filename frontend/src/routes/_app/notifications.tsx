import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, CheckCircle2, FileText, Sparkles, Trophy, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { useRole } from "@/lib/role-context";

export const Route = createFileRoute("/_app/notifications")({
  component: Notifications,
});

interface Exam {
  id: string;
  title: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
}

interface Submission {
  id: string;
  examId: string;
  studentId: string;
  score: number | null;
  status: "STARTED" | "SUBMITTED" | "GRADED";
  submittedAt: string | null;
  exam?: {
    title: string;
  };
  student?: {
    firstName: string;
    lastName: string;
  };
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  role: "STUDENT" | "LECTURER" | "ADMIN";
  isVerified: boolean;
}

function Notifications() {
  const { role } = useRole();

  // Fetch exams
  const { data: examsData, isLoading: isLoadingExams } = useQuery({
    queryKey: ["exams"],
    queryFn: async () => {
      const res = await api.get<{ data: Exam[] }>("/exams");
      return res.data;
    },
  });

  // Fetch submissions (if student)
  const { data: studentSubmissions, isLoading: isLoadingSubmissions } = useQuery({
    queryKey: ["student-submissions"],
    queryFn: async () => {
      if (role !== "student") return [];
      const res = await api.get<{ data: Submission[] }>("/submissions");
      return res.data;
    },
    enabled: role === "student",
  });

  // Fetch all users (if admin, to check verification queue)
  const { data: usersData, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      if (role !== "admin") return [];
      const res = await api.get<{ data: User[] }>("/users");
      return res.data;
    },
    enabled: role === "admin",
  });

  const isLoading = isLoadingExams || isLoadingSubmissions || isLoadingUsers;

  // Build dynamic notifications array
  const notificationsList: any[] = [];

  if (!isLoading) {
    const exams = examsData || [];

    if (role === "student") {
      const submissions = studentSubmissions || [];
      
      // 1. Exam Available notifications
      exams.forEach((ex) => {
        const alreadyTaken = submissions.some((sub) => sub.examId === ex.id);
        if (!alreadyTaken) {
          notificationsList.push({
            id: `exam-avail-${ex.id}`,
            icon: FileText,
            color: "text-chart-2 bg-chart-2/15",
            title: "Exam Available",
            desc: `"${ex.title}" is available and ready for your attempt.`,
            time: "New",
            unread: true,
          });
        }
      });

      // 2. Submissions notifications
      submissions.forEach((sub) => {
        const examTitle = sub.exam?.title || "Assessment";
        if (sub.status === "GRADED") {
          notificationsList.push({
            id: `sub-graded-${sub.id}`,
            icon: Trophy,
            color: "text-success bg-success/15",
            title: "AI Grading Complete",
            desc: `Your response for "${examTitle}" has been graded. Score: ${sub.score}/10.`,
            time: "Recent",
            unread: false,
          });
        } else if (sub.status === "STARTED") {
          notificationsList.push({
            id: `sub-started-${sub.id}`,
            icon: AlertCircle,
            color: "text-warning-foreground bg-warning/15",
            title: "Incomplete Session",
            desc: `You have an active, unsaved draft for "${examTitle}".`,
            time: "Action Required",
            unread: true,
          });
        }
      });
    }

    if (role === "lecturer") {
      // 1. Published exams notifications
      exams.forEach((ex) => {
        if (ex.status === "PUBLISHED") {
          notificationsList.push({
            id: `lect-exam-pub-${ex.id}`,
            icon: CheckCircle2,
            color: "text-success bg-success/15",
            title: "Exam Active",
            desc: `"${ex.title}" is currently published and accepting submissions.`,
            time: "Active",
            unread: false,
          });
        } else if (ex.status === "DRAFT") {
          notificationsList.push({
            id: `lect-exam-draft-${ex.id}`,
            icon: FileText,
            color: "text-muted-foreground bg-muted",
            title: "Draft Saved",
            desc: `"${ex.title}" is currently saved as a draft.`,
            time: "Draft",
            unread: false,
          });
        }
      });
    }

    if (role === "admin") {
      const users = usersData || [];
      const unverifiedLecturers = users.filter((u) => u.role === "LECTURER" && !u.isVerified);

      // 1. Pending approvals
      unverifiedLecturers.forEach((lec) => {
        notificationsList.push({
          id: `admin-verify-${lec.id}`,
          icon: AlertCircle,
          color: "text-warning-foreground bg-warning/15",
          title: "Verification Pending",
          desc: `Lecturer "${lec.firstName} ${lec.lastName}" requires approval to access their dashboard.`,
          time: "Needs Verification",
          unread: true,
        });
      });

      // 2. Global System Status
      notificationsList.push({
        id: "admin-sys-status",
        icon: CheckCircle2,
        color: "text-primary bg-primary/15",
        title: "System Online",
        desc: "Gemini AI essay grading clusters and Database connection pools are active.",
        time: "Now",
        unread: false,
      });
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Stay updated on grading, results, and student activity."
        actions={<Button variant="outline" className="rounded-full cursor-pointer">Mark all as read</Button>}
      />

      <Card className="shadow-card bg-background border border-border/60">
        <CardContent className="divide-y p-0 border-border/60">
          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : notificationsList.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No new alerts or system updates.
            </div>
          ) : (
            notificationsList.map((n) => {
              const Icon = n.icon;
              return (
                <div key={n.id} className="flex gap-4 p-5 transition hover:bg-muted/15 border-border/60">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${n.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-sm text-foreground">{n.title}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{n.desc}</p>
                      </div>
                      <span className="text-[10px] font-medium text-muted-foreground">{n.time}</span>
                    </div>
                  </div>
                  {n.unread && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground">
        <Bell className="mr-1 inline h-3 w-3" /> You're all caught up
      </p>
    </div>
  );
}

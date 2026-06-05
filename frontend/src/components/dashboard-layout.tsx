import { Outlet, useNavigate } from "@tanstack/react-router";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Bell, Search, Sparkles, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRole } from "@/lib/role-context";
import { useState } from "react";
import { AIAssistantPanel } from "@/components/ai-assistant-panel";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export function DashboardLayout() {
  const { role, loading } = useRole();
  const [aiOpen, setAiOpen] = useState(false);
  const navigate = useNavigate();

  // Fetch exams
  const { data: examsData } = useQuery({
    queryKey: ["exams"],
    queryFn: async () => {
      const res = await api.get<{ data: any[] }>("/exams");
      return res.data;
    },
  });

  // Fetch submissions (if student)
  const { data: studentSubmissions } = useQuery({
    queryKey: ["student-submissions"],
    queryFn: async () => {
      if (role !== "student") return [];
      const res = await api.get<{ data: any[] }>("/submissions");
      return res.data;
    },
    enabled: role === "student",
  });

  // Fetch all users (if admin)
  const { data: usersData } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      if (role !== "admin") return [];
      const res = await api.get<{ data: any[] }>("/users");
      return res.data;
    },
    enabled: role === "admin",
  });

  // Calculate unread count
  let unreadCount = 0;
  if (examsData) {
    const exams = examsData || [];
    if (role === "student") {
      const submissions = studentSubmissions || [];
      // 1. Exam Available
      exams.forEach((ex) => {
        const alreadyTaken = submissions.some((sub) => sub.examId === ex.id);
        if (!alreadyTaken) {
          unreadCount++;
        }
      });
      // 2. Submissions
      submissions.forEach((sub) => {
        if (sub.status === "STARTED") {
          unreadCount++;
        }
      });
    } else if (role === "admin") {
      const users = usersData || [];
      const unverifiedLecturers = users.filter((u) => u.role === "LECTURER" && !u.isVerified);
      unreadCount += unverifiedLecturers.length;
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground animate-pulse font-medium">
            Loading your GradeAI workspace...
          </p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/30">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur-md">
            <SidebarTrigger />
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search exams, students, questions..."
                className="h-9 w-72 rounded-full pl-9"
              />
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAiOpen(true)}
                className="gap-2 rounded-full border-primary/30 bg-gradient-soft hover:bg-accent"
              >
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="hidden sm:inline">AI Assistant</span>
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative rounded-full cursor-pointer"
                onClick={() => navigate({ to: "/notifications" })}
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-8 animate-fade-in">
            <Outlet />
          </main>
        </div>
      </div>
      <AIAssistantPanel open={aiOpen} onOpenChange={setAiOpen} />
    </SidebarProvider>
  );
}

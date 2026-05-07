import { Outlet } from "@tanstack/react-router";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Bell, Search, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRole, type Role } from "@/lib/role-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { AIAssistantPanel } from "@/components/ai-assistant-panel";

export function DashboardLayout() {
  const { role, setRole } = useRole();
  const [aiOpen, setAiOpen] = useState(false);

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
              <Button variant="ghost" size="icon" className="relative rounded-full">
                <Bell className="h-4 w-4" />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="rounded-full capitalize">
                    {role} view
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Switch role (demo)</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {(["admin", "lecturer", "student"] as Role[]).map((r) => (
                    <DropdownMenuItem
                      key={r}
                      onClick={() => setRole(r)}
                      className="capitalize"
                    >
                      {r}
                      {role === r && (
                        <Badge variant="secondary" className="ml-auto text-[10px]">
                          active
                        </Badge>
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
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

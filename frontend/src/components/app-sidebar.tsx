import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  FileText,
  Users,
  GraduationCap,
  Upload,
  Brain,
  Bell,
  Settings,
  Sparkles,
  PlusCircle,
  ListChecks,
  Trophy,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { useRole, type Role } from "@/lib/role-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut } from "lucide-react";

type Item = { title: string; url: string; icon: React.ComponentType<{ className?: string }> };

const navByRole: Record<Role, { label: string; items: Item[] }[]> = {
  admin: [
    {
      label: "Overview",
      items: [
        { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
      ],
    },
    {
      label: "Manage",
      items: [
        { title: "Exams", url: "/exams", icon: FileText },
        { title: "Students", url: "/students", icon: Users },
        { title: "AI Grading", url: "/ai-grading", icon: Brain },
      ],
    },
  ],
  lecturer: [
    {
      label: "Overview",
      items: [{ title: "Dashboard", url: "/dashboard", icon: LayoutDashboard }],
    },
    {
      label: "Exams",
      items: [
        { title: "All Exams", url: "/exams", icon: FileText },
        { title: "Create Exam", url: "/exams/create", icon: PlusCircle },
        { title: "Questions", url: "/questions", icon: ListChecks },
        { title: "AI Grading", url: "/ai-grading", icon: Brain },
        { title: "Results", url: "/results", icon: Trophy },
      ],
    },
  ],
  student: [
    {
      label: "Learn",
      items: [
        { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
        { title: "My Exams", url: "/exams", icon: GraduationCap },
        { title: "Upload Answers", url: "/upload", icon: Upload },
        { title: "My Results", url: "/results", icon: Trophy },
      ],
    },
  ],
};

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { role, user, logout } = useRole();
  const path = useRouterState({ select: (r) => r.location.pathname });
  const groups = navByRole[role];

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="border-b">
        <Link to="/dashboard" className="flex items-center gap-2 px-2 py-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight">GradeAI</span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Smart Exams
              </span>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {groups.map((g) => (
          <SidebarGroup key={g.label}>
            <SidebarGroupLabel>{g.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {g.items.map((item) => {
                  const active =
                    path === item.url ||
                    (item.url !== "/dashboard" &&
                      path.startsWith(item.url) &&
                      !(item.url === "/exams" && path.startsWith("/exams/create")));
                  return (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton asChild isActive={active}>
                        <Link to={item.url} className="flex items-center gap-3">
                          <item.icon className="h-4 w-4" />
                          {!collapsed && <span>{item.title}</span>}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={path === "/notifications"}>
                  <Link to="/notifications" className="flex items-center gap-3">
                    <Bell className="h-4 w-4" />
                    {!collapsed && <span>Notifications</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={path === "/settings"}>
                  <Link to="/settings" className="flex items-center gap-3">
                    <Settings className="h-4 w-4" />
                    {!collapsed && <span>Settings</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-2 px-2 py-2 hover:bg-muted/50 rounded-lg transition text-left cursor-pointer">
              <Avatar className="h-8 w-8">
                {user?.avatarUrl && <AvatarImage src={user.avatarUrl} />}
                <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xs">
                  {user
                    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
                    : role.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-sm font-medium truncate">
                    {user ? `${user.firstName} ${user.lastName}` : `${role} view`}
                  </span>
                  <span className="text-xs text-muted-foreground truncate">
                    {user?.email || "demo@gradeai.app"}
                  </span>
                </div>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              {user ? "My Account" : "Demo Account"}
            </DropdownMenuLabel>
            {user && (
              <>
                <DropdownMenuSeparator />
                <div className="px-2 py-1.5 text-xs text-muted-foreground">
                  Role: <span className="font-semibold capitalize text-foreground">{role}</span>
                  {user.matricNumber && ` (${user.matricNumber})`}
                  {user.staffId && ` (${user.staffId})`}
                </div>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-destructive cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Users,
  FileText,
  ShieldAlert,
  Activity,
  CheckCircle,
  XCircle,
  Loader2,
  Search,
  Filter,
} from "lucide-react";
import { useState } from "react";
import { api } from "@/lib/api-client";
import { useRole } from "@/lib/role-context";

interface GlobalStats {
  usersByRole: { role: string; count: number }[];
  examsByStatus: { status: string; count: number }[];
  totalSubmissions: number;
  lecturersByVerification: { isVerified: boolean; count: number }[];
}

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "STUDENT" | "LECTURER" | "ADMIN";
  matricNumber: string | null;
  staffId: string | null;
  isVerified: boolean;
  createdAt: string;
}

export function AdminDashboard() {
  const queryClient = useQueryClient();
  const { user } = useRole();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const firstName = user?.firstName || "Admin";

  const renderBoldFirstLetter = (str: string) => {
    if (!str) return "";
    return (
      <span>
        <span className="font-bold">{str.charAt(0).toUpperCase()}</span>
        {str.slice(1)}
      </span>
    );
  };

  // Fetch global stats
  const { data: globalStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["global-stats"],
    queryFn: async () => {
      const res = await api.get<{ data: GlobalStats }>("/analytics/global");
      return res.data;
    },
  });

  // Fetch all users
  const { data: usersData, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await api.get<{ data: UserProfile[] }>("/users");
      return res.data;
    },
  });

  // Verify Lecturer Mutation
  const verifyMutation = useMutation({
    mutationFn: async ({ id, isVerified }: { id: string; isVerified: boolean }) => {
      return await api.patch(`/users/${id}/verify`, { isVerified });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["global-stats"] });
      toast.success("User verification updated successfully!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update verification status");
    },
  });

  const handleVerify = (id: string, isVerified: boolean) => {
    verifyMutation.mutate({ id, isVerified });
  };

  const users = usersData || [];
  const pendingLecturers = users.filter((u) => u.role === "LECTURER" && !u.isVerified);

  // Compute stat card parameters
  const totalUsersCount = users.length;
  const publishedExams = globalStats?.examsByStatus.find((e) => e.status === "PUBLISHED")?.count || 0;
  const totalSubmissions = globalStats?.totalSubmissions || 0;
  const unverifiedLecturersCount = globalStats?.lecturersByVerification.find((lv) => !lv.isVerified)?.count || 0;

  // Filtered users for general table view
  const filteredUsers = users.filter((u) => {
    const fullName = `${u.firstName || ""} ${u.lastName || ""}`.toLowerCase();
    const email = u.email.toLowerCase();
    const searchMatch = fullName.includes(searchTerm.toLowerCase()) || email.includes(searchTerm.toLowerCase());
    const roleMatch = roleFilter === "ALL" || u.role === roleFilter;
    return searchMatch && roleMatch;
  });

  const isMutating = verifyMutation.isPending;

  return (
    <div className="space-y-6">
      <PageHeader
        title={<>{getGreeting()}, {renderBoldFirstLetter(firstName)}</>}
        description="Monitor user activities, evaluate global statistics, and authorize lecturer registrations."
      />

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Registered Users"
          value={isLoadingStats ? "..." : String(totalUsersCount)}
          delta={`${globalStats?.usersByRole.map((ur) => `${ur.count} ${ur.role.toLowerCase()}s`).join(", ") || ""}`}
          icon={Users}
          accent="primary"
        />
        <StatCard
          label="Published Exam Papers"
          value={isLoadingStats ? "..." : String(publishedExams)}
          delta={`${globalStats?.examsByStatus.find((e) => e.status === "DRAFT")?.count || 0} drafts active`}
          icon={FileText}
          accent="blue"
        />
        <StatCard
          label="Lecturers Pending Approval"
          value={isLoadingStats ? "..." : String(unverifiedLecturersCount)}
          delta={unverifiedLecturersCount > 0 ? "Requires authorization" : "All verified"}
          trend={unverifiedLecturersCount > 0 ? "up" : "down"}
          icon={ShieldAlert}
          accent="purple"
        />
        <StatCard
          label="Total Submissions Graded"
          value={isLoadingStats ? "..." : String(totalSubmissions)}
          delta="Evaluated by Gemini"
          icon={Activity}
          accent="green"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Verification Queue (Left Column) */}
        <Card className="lg:col-span-1 shadow-card bg-background border border-border/60">
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span>Verification Queue</span>
              {pendingLecturers.length > 0 && (
                <Badge variant="destructive" className="rounded-full">
                  {pendingLecturers.length} new
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
            {isLoadingUsers ? (
              <div className="flex h-32 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : pendingLecturers.length === 0 ? (
              <p className="text-xs text-muted-foreground py-8 text-center">
                No lecturers are currently awaiting verification.
              </p>
            ) : (
              pendingLecturers.map((lec) => (
                <div key={lec.id} className="p-3 border rounded-xl space-y-2 bg-muted/20 border-border/40 text-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-foreground">
                        {lec.firstName} {lec.lastName}
                      </p>
                      <p className="text-muted-foreground">{lec.email}</p>
                    </div>
                    <Badge variant="secondary" className="font-mono text-2xs uppercase">
                      ID: {lec.staffId || "N/A"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1.5 pt-1">
                    <Button
                      size="sm"
                      className="rounded-full bg-success text-success-foreground hover:bg-success/90 h-7 text-3xs cursor-pointer flex-1 gap-1"
                      onClick={() => handleVerify(lec.id, true)}
                      disabled={isMutating}
                    >
                      <CheckCircle className="h-3 w-3" /> Approve
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Global User Registry (Right Column) */}
        <Card className="lg:col-span-2 shadow-card bg-background border border-border/60 overflow-hidden">
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
            <CardTitle className="text-base">System Registry</CardTitle>
            <div className="flex flex-wrap gap-2 items-center">
              <div className="relative max-w-xs">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search user..."
                  className="pl-8 h-8 rounded-full text-xs max-w-[150px] bg-background"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="h-8 rounded-full text-xs bg-background w-[110px]">
                  <SelectValue placeholder="Filter role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Roles</SelectItem>
                  <SelectItem value="LECTURER">Lecturers</SelectItem>
                  <SelectItem value="STUDENT">Students</SelectItem>
                  <SelectItem value="ADMIN">Admins</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto max-h-[380px] overflow-y-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b bg-muted/40 uppercase text-3xs tracking-wider text-muted-foreground">
                    <th className="px-4 py-3 font-semibold">User</th>
                    <th className="px-4 py-3 font-semibold">Role</th>
                    <th className="px-4 py-3 font-semibold">Credentials</th>
                    <th className="px-4 py-3 font-semibold">Verification</th>
                    <th className="px-4 py-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoadingUsers ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center">
                        <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-muted-foreground">
                        No registered users match your search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b last:border-0 hover:bg-muted/20">
                        <td className="px-4 py-3.5">
                          <p className="font-semibold text-foreground">
                            {user.firstName || "Incomplete"} {user.lastName || "Profile"}
                          </p>
                          <p className="text-muted-foreground text-3xs">{user.email}</p>
                        </td>
                        <td className="px-4 py-3.5">
                          <Badge variant="outline" className="text-2xs capitalize">
                            {user.role.toLowerCase()}
                          </Badge>
                        </td>
                        <td className="px-4 py-3.5 font-mono text-3xs">
                          {user.role === "LECTURER" ? (
                            <span>Staff: {user.staffId || "N/A"}</span>
                          ) : user.role === "STUDENT" ? (
                            <span>Matric: {user.matricNumber || "N/A"}</span>
                          ) : (
                            <span className="text-muted-foreground">N/A</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          {user.role === "LECTURER" ? (
                            <Badge
                              variant="secondary"
                              className={
                                user.isVerified
                                  ? "bg-success/15 text-success rounded-full"
                                  : "bg-warning/15 text-warning-foreground rounded-full"
                              }
                            >
                              {user.isVerified ? "Verified" : "Pending"}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-3xs">Auto-approved</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          {user.role === "LECTURER" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className={`rounded-full h-6 px-2.5 text-2xs cursor-pointer ${
                                user.isVerified
                                  ? "text-destructive hover:bg-destructive/10"
                                  : "text-success hover:bg-success/10"
                              }`}
                              onClick={() => handleVerify(user.id, !user.isVerified)}
                              disabled={isMutating}
                            >
                              {user.isVerified ? "Revoke" : "Approve"}
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

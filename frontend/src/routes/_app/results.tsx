import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import {
  Download,
  Search,
  BookOpen,
  Users,
  Award,
  Calendar,
  Loader2,
  AlertCircle,
  FileCheck,
} from "lucide-react";
import { useState } from "react";
import { api } from "@/lib/api-client";
import { useRole } from "@/lib/role-context";
import { z } from "zod";

const resultsSearchSchema = z.object({
  examId: z.string().optional(),
});

export const Route = createFileRoute("/_app/results")({
  component: Results,
  validateSearch: (search) => resultsSearchSchema.parse(search),
});

interface Submission {
  id: string;
  examId: string;
  studentId: string;
  score: number | null;
  status: "STARTED" | "SUBMITTED" | "GRADED";
  startedAt: string;
  submittedAt: string | null;
  exam?: {
    title: string;
    duration: number;
  };
  student?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    matricNumber: string | null;
  };
}

interface Exam {
  id: string;
  title: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
}

const statusColors: Record<string, string> = {
  GRADED: "bg-success/15 text-success border-success/30",
  SUBMITTED: "bg-primary/15 text-primary border-primary/30",
  STARTED: "bg-warning/15 text-warning border-warning/30",
};

function Results() {
  const navigate = useNavigate();
  const { role } = useRole();
  const { examId } = Route.useSearch();
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch Exams list (for Lecturer/Admin selector)
  const { data: examsData, isLoading: isLoadingExams } = useQuery({
    queryKey: ["exams"],
    queryFn: async () => {
      const res = await api.get<{ data: Exam[] }>("/exams");
      return res.data;
    },
    enabled: role !== "student",
  });

  const selectedExamId = examId || (examsData && examsData.length > 0 ? examsData[0].id : undefined);

  // Fetch Submissions
  const { data: submissionsData, isLoading: isLoadingSubmissions, error } = useQuery({
    queryKey: ["submissions", role, selectedExamId],
    queryFn: async () => {
      if (role === "student") {
        // Fetch all submissions of the logged-in student
        const res = await api.get<{ data: Submission[] }>("/submissions");
        return res.data;
      } else {
        // Fetch submissions for a specific exam
        if (!selectedExamId) return [];
        const res = await api.get<{ data: Submission[] }>(`/exams/${selectedExamId}/submissions`);
        return res.data;
      }
    },
    enabled: role === "student" || !!selectedExamId,
  });

  // Filter submissions based on search bar
  const rawSubmissions = submissionsData || [];
  const filteredSubmissions = rawSubmissions.filter((sub) => {
    if (role === "student") {
      const title = sub.exam?.title || "";
      return title.toLowerCase().includes(searchTerm.toLowerCase());
    } else {
      const name = `${sub.student?.firstName} ${sub.student?.lastName}`.toLowerCase();
      const matric = (sub.student?.matricNumber || "").toLowerCase();
      return name.includes(searchTerm.toLowerCase()) || matric.includes(searchTerm.toLowerCase());
    }
  });

  // CSV Exporter
  const handleExportCSV = () => {
    if (filteredSubmissions.length === 0) {
      toast.error("No data available to export");
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    if (role === "student") {
      csvContent += "Exam,Submitted At,Status,Score\n";
      filteredSubmissions.forEach((sub) => {
        csvContent += `"${sub.exam?.title}","${sub.submittedAt ? new Date(sub.submittedAt).toLocaleString() : "N/A"}","${sub.status}",${sub.score ?? "N/A"}\n`;
      });
    } else {
      csvContent += "Student Name,Matric Number,Submitted At,Status,Score\n";
      filteredSubmissions.forEach((sub) => {
        csvContent += `"${sub.student?.firstName} ${sub.student?.lastName}","${sub.student?.matricNumber || "N/A"}","${sub.submittedAt ? new Date(sub.submittedAt).toLocaleString() : "N/A"}","${sub.status}",${sub.score ?? "N/A"}\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `results_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV file downloaded successfully!");
  };

  const handleViewDetails = (submissionId: string) => {
    // Navigate to dynamic details view passing submissionId as parameter
    navigate({ to: "/ai-grading", search: { submissionId } });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Exam Results"
        description={
          role === "student"
            ? "View your scores and AI-generated grading feedback."
            : "Monitor student submissions, score sheets, and AI feedback reports."
        }
        actions={
          <Button
            onClick={handleExportCSV}
            className="rounded-full bg-gradient-primary shadow-glow gap-2 cursor-pointer"
            disabled={filteredSubmissions.length === 0}
          >
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        }
      />

      {/* Selector Dropdown for Lecturers/Admins */}
      {role !== "student" && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center bg-card p-4 rounded-xl border border-border/50">
          <div className="flex items-center gap-2 text-sm font-medium">
            <BookOpen className="h-4 w-4 text-primary" />
            <span>Select Exam:</span>
          </div>
          <div className="flex-1 max-w-md">
            {isLoadingExams ? (
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            ) : (
              <Select
                value={selectedExamId}
                onValueChange={(val) => navigate({ to: "/results", search: { examId: val } })}
              >
                <SelectTrigger className="w-full bg-background rounded-full">
                  <SelectValue placeholder="Select an exam" />
                </SelectTrigger>
                <SelectContent>
                  {examsData && examsData.length > 0 ? (
                    examsData.map((ex) => (
                      <SelectItem key={ex.id} value={ex.id}>
                        {ex.title}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="empty" disabled>
                      No exams available (Empty)
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            )}
          </div>
          {filteredSubmissions.length > 0 && (
            <Badge variant="outline" className="sm:ml-auto w-fit gap-1 bg-background">
              <Users className="h-3 w-3" /> {filteredSubmissions.length} submissions
            </Badge>
          )}
        </div>
      )}

      {/* Search and Filters */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={role === "student" ? "Search exam name..." : "Search student name or ID..."}
          className="pl-9 rounded-full bg-background"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {isLoadingSubmissions ? (
        <div className="flex h-64 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading results sheet...</p>
          </div>
        </div>
      ) : error ? (
        <Card className="border-destructive/35 bg-destructive/5 p-6">
          <div className="flex items-center gap-3 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span className="font-semibold">Failed to fetch submissions</span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {(error as any)?.message || "Verify your permission credentials."}
          </p>
        </Card>
      ) : filteredSubmissions.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed p-8 text-center bg-card/30">
          <FileCheck className="h-8 w-8 text-muted-foreground mb-3" />
          <p className="text-lg font-semibold">No submissions found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {role === "student"
              ? "You haven't completed any exam sessions yet."
              : "No student submissions have been logged for this exam."}
          </p>
        </div>
      ) : (
        <Card className="shadow-card bg-background border border-border/60 overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground bg-muted/40">
                    {role === "student" ? (
                      <>
                        <th className="px-5 py-4 font-semibold">Exam Title</th>
                        <th className="px-5 py-4 font-semibold">Started At</th>
                        <th className="px-5 py-4 font-semibold">Submitted At</th>
                        <th className="px-5 py-4 font-semibold text-center">Score</th>
                        <th className="px-5 py-4 font-semibold">Status</th>
                      </>
                    ) : (
                      <>
                        <th className="px-5 py-4 font-semibold">Student</th>
                        <th className="px-5 py-4 font-semibold">Matric Number</th>
                        <th className="px-5 py-4 font-semibold">Submitted At</th>
                        <th className="px-5 py-4 font-semibold text-center">Score</th>
                        <th className="px-5 py-4 font-semibold">Status</th>
                      </>
                    )}
                    <th className="px-5 py-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubmissions.map((r) => (
                    <tr key={r.id} className="border-b last:border-0 transition hover:bg-muted/30">
                      {role === "student" ? (
                        <>
                          <td className="px-5 py-4 font-medium">{r.exam?.title}</td>
                          <td className="px-5 py-4 text-muted-foreground text-xs">
                            {new Date(r.startedAt).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                          </td>
                          <td className="px-5 py-4 text-muted-foreground text-xs">
                            {r.submittedAt
                              ? new Date(r.submittedAt).toLocaleString([], { dateStyle: "short", timeStyle: "short" })
                              : "N/A"}
                          </td>
                          <td className="px-5 py-4 font-bold text-center text-primary text-base">
                            {r.score !== null ? (
                              <span className="flex items-center justify-center gap-1">
                                <Award className="h-4 w-4 text-primary" /> {r.score}
                              </span>
                            ) : (
                              <span className="text-muted-foreground text-xs font-normal">Pending</span>
                            )}
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-5 py-4 font-medium">
                            {r.student?.firstName} {r.student?.lastName}
                          </td>
                          <td className="px-5 py-4 text-muted-foreground text-xs font-mono">
                            {r.student?.matricNumber || "N/A"}
                          </td>
                          <td className="px-5 py-4 text-muted-foreground text-xs">
                            {r.submittedAt
                              ? new Date(r.submittedAt).toLocaleString([], { dateStyle: "short", timeStyle: "short" })
                              : "N/A"}
                          </td>
                          <td className="px-5 py-4 font-bold text-center text-primary text-base">
                            {r.score !== null ? (
                              <span className="flex items-center justify-center gap-1">
                                <Award className="h-4 w-4 text-primary" /> {r.score}
                              </span>
                            ) : (
                              <span className="text-muted-foreground text-xs font-normal">Pending</span>
                            )}
                          </td>
                        </>
                      )}
                      <td className="px-5 py-4">
                        <Badge variant="outline" className={`capitalize rounded-full px-2 py-0.5 border ${statusColors[r.status]}`}>
                          {r.status.toLowerCase()}
                        </Badge>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="rounded-full cursor-pointer hover:bg-muted/70"
                          onClick={() => handleViewDetails(r.id)}
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

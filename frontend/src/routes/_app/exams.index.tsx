import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  PlusCircle,
  Search,
  Calendar,
  Users,
  Clock,
  Trash2,
  CheckCircle,
  Play,
  ListChecks,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { api, APIError } from "@/lib/api-client";
import { useRole } from "@/lib/role-context";

export const Route = createFileRoute("/_app/exams/")({
  component: Exams,
});

interface Exam {
  id: string;
  title: string;
  description: string | null;
  duration: number;
  startDate: string;
  endDate: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  lecturerId: string;
  lecturer: {
    firstName: string;
    lastName: string;
  };
  _count?: {
    questions: number;
    submissions: number;
  };
}

const statusColor: Record<string, string> = {
  PUBLISHED: "bg-primary/15 text-primary",
  DRAFT: "bg-muted text-muted-foreground",
  ARCHIVED: "bg-destructive/15 text-destructive",
};

function Exams() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { role, user } = useRole();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Fetch Exams
  const { data, isLoading, error } = useQuery({
    queryKey: ["exams"],
    queryFn: async () => {
      const res = await api.get<{ data: Exam[] }>("/exams");
      return res.data;
    },
  });

  // Publish Exam Mutation
  const publishMutation = useMutation({
    mutationFn: async (id: string) => {
      return await api.patch<{ data: Exam }>(`/exams/${id}/publish`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exams"] });
      toast.success("Exam published successfully!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to publish exam");
    },
  });

  // Delete Exam Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await api.delete(`/exams/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exams"] });
      toast.success("Exam deleted successfully!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete exam");
    },
  });

  // Start Exam Session Mutation (for Student)
  const startExamMutation = useMutation({
    mutationFn: async (examId: string) => {
      const res = await api.post<{ data: { id: string } }>(`/exams/${examId}/start`);
      return res.data;
    },
    onSuccess: (data, examId) => {
      toast.success("Exam session started!");
      // Navigate to the student exam session route or component.
      // We will define this student take exam session flow in Phase 5.
      // For now, redirect to the upload or active test view.
      navigate({ to: "/upload", search: { examId } });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to start exam. Check dates and credentials.");
    },
  });

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this exam? All questions and answers will be removed.")) {
      deleteMutation.mutate(id);
    }
  };

  const handlePublish = (id: string) => {
    if (confirm("Are you sure you want to publish this exam? Students will be able to view and start it during the scheduled window.")) {
      publishMutation.mutate(id);
    }
  };

  // Filter exams based on search and tab status
  const examsList = data || [];
  const filteredExams = examsList.filter((e) => {
    const matchesSearch =
      e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.description && e.description.toLowerCase().includes(searchTerm.toLowerCase()));

    if (statusFilter === "ALL") return matchesSearch;
    return matchesSearch && e.status === statusFilter;
  });

  const isMutating =
    publishMutation.isPending ||
    deleteMutation.isPending ||
    startExamMutation.isPending;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Exams"
        description={
          role === "student"
            ? "View and take your scheduled exams."
            : "Manage your exams, questions, and view grading statistics."
        }
        actions={
          role !== "student" ? (
            <Button asChild className="rounded-full bg-gradient-primary shadow-glow gap-2 cursor-pointer">
              <Link to="/exams/create">
                <PlusCircle className="h-4 w-4" /> New Exam
              </Link>
            </Button>
          ) : undefined
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search exams..."
            className="pl-9 rounded-full bg-background"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {["ALL", "PUBLISHED", "DRAFT"].map((f) => {
            if (role === "student" && f === "DRAFT") return null;
            return (
              <Button
                key={f}
                variant={statusFilter === f ? "default" : "outline"}
                size="sm"
                className="rounded-full cursor-pointer"
                onClick={() => setStatusFilter(f)}
              >
                {f === "ALL" ? "All" : f === "PUBLISHED" ? "Published" : "Draft"}
              </Button>
            );
          })}
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Fetching exams...</p>
          </div>
        </div>
      ) : error ? (
        <Card className="border-destructive/35 bg-destructive/5 p-6">
          <div className="flex items-center gap-3 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span className="font-semibold">Failed to load exams</span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {(error as any)?.message || "An unexpected error occurred while communicating with the server."}
          </p>
        </Card>
      ) : filteredExams.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed p-8 text-center bg-card/30">
          <p className="text-lg font-semibold">No exams found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {searchTerm ? "Try searching for a different term." : "No exams have been created yet."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredExams.map((e) => (
            <Card key={e.id} className="group shadow-card transition hover:-translate-y-1 hover:shadow-soft flex flex-col justify-between">
              <CardContent className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between">
                    <Badge variant="secondary" className={statusColor[e.status]}>
                      {e.status.toLowerCase()}
                    </Badge>
                    {role !== "student" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(e.id)}
                        disabled={isMutating}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <h3 className="mt-3 text-lg font-semibold leading-snug">{e.title}</h3>
                  <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2">
                    {e.description || "No description provided."}
                  </p>
                  
                  {role !== "student" && (
                    <p className="mt-2 text-[10px] text-muted-foreground">
                      Created by {e.lecturer?.firstName ?? ""} {e.lecturer?.lastName ?? ""}
                    </p>
                  )}

                  <div className="mt-4 space-y-2 border-t pt-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5" />
                      <span>Duration: {e.duration} mins</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>
                        Starts: {new Date(e.startDate).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                      </span>
                    </div>
                    {role !== "student" && e._count && (
                      <div className="flex items-center gap-4 mt-2 pt-2 border-t border-dashed">
                        <span className="flex items-center gap-1 font-medium">
                          <ListChecks className="h-3.5 w-3.5" /> {e._count.questions} questions
                        </span>
                        <span className="flex items-center gap-1 font-medium">
                          <Users className="h-3.5 w-3.5" /> {e._count.submissions} submissions
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-5 flex gap-2">
                  {role === "student" ? (
                    <Button
                      size="sm"
                      className="w-full rounded-full bg-gradient-primary shadow-glow gap-1.5 cursor-pointer"
                      onClick={() => startExamMutation.mutate(e.id)}
                      disabled={isMutating}
                    >
                      <Play className="h-3.5 w-3.5 fill-current" /> Take Exam
                    </Button>
                  ) : (
                    <>
                      {e.status === "DRAFT" ? (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 rounded-full cursor-pointer gap-1"
                            asChild
                          >
                            <Link to="/questions" search={{ examId: e.id }}>
                              <ListChecks className="h-3.5 w-3.5" /> Setup
                            </Link>
                          </Button>
                          <Button
                            size="sm"
                            className="flex-1 rounded-full bg-gradient-primary cursor-pointer gap-1"
                            onClick={() => handlePublish(e.id)}
                            disabled={isMutating}
                          >
                            <CheckCircle className="h-3.5 w-3.5" /> Publish
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 rounded-full cursor-pointer gap-1"
                            asChild
                          >
                            <Link to="/questions" search={{ examId: e.id }}>
                              Questions
                            </Link>
                          </Button>
                          <Button
                            size="sm"
                            className="flex-1 rounded-full bg-gradient-primary cursor-pointer"
                            asChild
                          >
                            <Link to="/results">Submissions</Link>
                          </Button>
                        </>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

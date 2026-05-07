import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, UserPlus, MoreHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_app/students")({
  component: Students,
});

const students = [
  { name: "Ada Lovelace", email: "ada@school.edu", id: "STU-1024", course: "CS", avg: 92 },
  { name: "Tunde Adebayo", email: "tunde@school.edu", id: "STU-1025", course: "CS", avg: 78 },
  { name: "Maya Rodriguez", email: "maya@school.edu", id: "STU-1026", course: "Math", avg: 85 },
  { name: "Kofi Boateng", email: "kofi@school.edu", id: "STU-1027", course: "CS", avg: 64 },
  { name: "Lin Wei", email: "lin@school.edu", id: "STU-1028", course: "Physics", avg: 95 },
  { name: "Sara Mensah", email: "sara@school.edu", id: "STU-1029", course: "Math", avg: 71 },
];

function Students() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Students"
        description="Manage students enrolled across your courses."
        actions={
          <Button className="rounded-full bg-gradient-primary shadow-glow gap-2">
            <UserPlus className="h-4 w-4" /> Add Student
          </Button>
        }
      />

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search by name, email or ID..." className="pl-9 rounded-full" />
      </div>

      <Card className="shadow-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-4 font-medium">Student</th>
                  <th className="px-5 py-4 font-medium">ID</th>
                  <th className="px-5 py-4 font-medium">Department</th>
                  <th className="px-5 py-4 font-medium">Avg. Score</th>
                  <th className="px-5 py-4 font-medium" />
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id} className="border-b last:border-0 transition hover:bg-muted/30">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-gradient-primary text-xs text-primary-foreground">
                            {s.name.split(" ").map((n) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{s.name}</p>
                          <p className="text-xs text-muted-foreground">{s.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">{s.id}</td>
                    <td className="px-5 py-4">
                      <Badge variant="secondary">{s.course}</Badge>
                    </td>
                    <td className="px-5 py-4 font-semibold">{s.avg}%</td>
                    <td className="px-5 py-4 text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

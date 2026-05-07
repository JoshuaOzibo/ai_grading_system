import { createFileRoute } from "@tanstack/react-router";
import { useRole } from "@/lib/role-context";
import { AdminDashboard } from "@/features/dashboards/admin";
import { LecturerDashboard } from "@/features/dashboards/lecturer";
import { StudentDashboard } from "@/features/dashboards/student";

export const Route = createFileRoute("/_app/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const { role } = useRole();
  if (role === "admin") return <AdminDashboard />;
  if (role === "lecturer") return <LecturerDashboard />;
  return <StudentDashboard />;
}

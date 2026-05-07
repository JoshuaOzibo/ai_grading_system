import { createFileRoute } from "@tanstack/react-router";
import { AuthShell } from "./login";

export const Route = createFileRoute("/signup")({
  component: () => (
    <AuthShell title="Create your account" subtitle="Start grading with AI in minutes" mode="signup" />
  ),
});

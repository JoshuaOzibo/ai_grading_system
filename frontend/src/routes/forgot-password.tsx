import { createFileRoute } from "@tanstack/react-router";
import { AuthShell } from "./login";

export const Route = createFileRoute("/forgot-password")({
  component: () => (
    <AuthShell title="Reset your password" subtitle="We'll email you a reset link" mode="forgot" />
  ),
});

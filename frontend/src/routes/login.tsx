import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import heroImg from "@/assets/hero-ai.jpg";

export const Route = createFileRoute("/login")({
  component: Login,
});

function Login() {
  return <AuthShell title="Welcome back" subtitle="Log in to your GradeAI account" mode="login" />;
}

export function AuthShell({
  title,
  subtitle,
  mode,
}: {
  title: string;
  subtitle: string;
  mode: "login" | "signup" | "forgot";
}) {
  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-primary p-10 text-primary-foreground md:flex">
        <Link to="/" className="flex items-center gap-2 font-bold">
          <Sparkles className="h-5 w-5" /> GradeAI
        </Link>
        <div className="relative z-10">
          <h2 className="text-3xl font-bold leading-tight">
            "GradeAI cut my grading time by 80%. I get my evenings back."
          </h2>
          <p className="mt-4 text-primary-foreground/80">
            Dr. Adesina · Senior Lecturer, Computer Science
          </p>
        </div>
        <img
          src={heroImg}
          alt=""
          className="pointer-events-none absolute -bottom-20 -right-20 h-[420px] w-[420px] rounded-full opacity-40 blur-2xl"
        />
      </div>
      <div className="flex items-center justify-center p-6 md:p-10">
        <Card className="w-full max-w-md border-border/60 p-8 shadow-card animate-slide-up">
          <Link to="/" className="mb-8 flex items-center gap-2 md:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold">GradeAI</span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>

          <form className="mt-6 space-y-4">
            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" placeholder="Ada Lovelace" />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@school.edu" />
            </div>
            {mode !== "forgot" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  {mode === "login" && (
                    <Link
                      to="/forgot-password"
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      Forgot?
                    </Link>
                  )}
                </div>
                <Input id="password" type="password" placeholder="••••••••" />
              </div>
            )}
            <Button asChild className="w-full rounded-full bg-gradient-primary shadow-glow">
              <Link to="/dashboard">
                {mode === "login" ? "Log in" : mode === "signup" ? "Create account" : "Send reset link"}
              </Link>
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "login" ? (
              <>
                New to GradeAI?{" "}
                <Link to="/signup" className="font-medium text-primary hover:underline">
                  Create an account
                </Link>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <Link to="/login" className="font-medium text-primary hover:underline">
                  Log in
                </Link>
              </>
            )}
          </p>
        </Card>
      </div>
    </div>
  );
}

import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { tokenManager, api, APIError } from "@/lib/api-client";
import { useRole } from "@/lib/role-context";
import heroImg from "@/assets/hero-ai.jpg";

import { z } from "zod";

const loginSearchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/login")({
  component: Login,
  validateSearch: (search) => loginSearchSchema.parse(search),
});

function Login() {
  return <AuthShell title="Welcome back" subtitle="Log in to your GradeAI account" mode="login" />;
}

interface AuthShellProps {
  title: string;
  subtitle: string;
  mode: "login" | "signup" | "forgot";
}

export function AuthShell({ title, subtitle, mode }: AuthShellProps) {
  const navigate = useNavigate();
  const search = useSearch({ strict: false });
  const redirect = (search as any)?.redirect;
  const { setUser } = useRole();

  // Form states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRoleState] = useState<"STUDENT" | "LECTURER">("LECTURER");
  const [matricNumber, setMatricNumber] = useState("");
  const [staffId, setStaffId] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Login Mutation
  const loginMutation = useMutation({
    mutationFn: async () => {
      setErrorMsg("");
      const response = await api.post<{
        data: { accessToken: string; user: any };
      }>("/auth/login", { email, password });
      return response.data;
    },
    onSuccess: (data) => {
      tokenManager.setToken(data.accessToken);
      setUser(data.user);
      toast.success("Welcome back to GradeAI!");
      navigate({ to: redirect || "/dashboard" });
    },
    onError: (err: any) => {
      console.error(err);
      setErrorMsg(err.message || "Invalid email or password.");
      toast.error(err.message || "Login failed");
    },
  });

  // Signup Mutation
  const signupMutation = useMutation({
    mutationFn: async () => {
      setErrorMsg("");
      const payload: any = {
        firstName,
        lastName,
        email,
        password,
        role,
      };

      if (role === "STUDENT") {
        payload.matricNumber = matricNumber;
      } else {
        payload.staffId = staffId;
      }

      const response = await api.post<{ message: string }>("/auth/register", payload);
      return response;
    },
    onSuccess: () => {
      toast.success("Account created successfully! Please log in.");
      navigate({ to: "/login" });
    },
    onError: (err: any) => {
      console.error(err);
      if (err instanceof APIError && err.errors) {
        const firstErr = Array.isArray(err.errors) ? err.errors[0]?.message : null;
        setErrorMsg(firstErr || err.message);
      } else {
        setErrorMsg(err.message || "Registration failed. Verify details and try again.");
      }
      toast.error(err.message || "Registration failed");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "login") {
      if (!email || !password) {
        setErrorMsg("Please fill in all fields.");
        return;
      }
      loginMutation.mutate();
    } else if (mode === "signup") {
      if (!firstName || !lastName || !email || !password) {
        setErrorMsg("Please fill in all required fields.");
        return;
      }
      if (role === "STUDENT" && !matricNumber) {
        setErrorMsg("Please enter your matric number.");
        return;
      }
      if (role === "LECTURER" && !staffId) {
        setErrorMsg("Please enter your staff ID.");
        return;
      }
      signupMutation.mutate();
    } else {
      toast.info("Reset password function is simulated in dev environment.");
    }
  };

  const isLoading = loginMutation.isPending || signupMutation.isPending;

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
        <Card className="w-full max-w-md border-border/60 p-8 shadow-card animate-slide-up bg-background">
          <Link to="/" className="mb-8 flex items-center gap-2 md:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold">GradeAI</span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>

          {errorMsg && (
            <div className="mt-4 rounded-lg bg-destructive/15 p-3 text-xs font-medium text-destructive">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {mode === "signup" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First name</Label>
                    <Input
                      id="firstName"
                      placeholder="Ada"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last name</Label>
                    <Input
                      id="lastName"
                      placeholder="Lovelace"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Register as</Label>
                  <RadioGroup
                    value={role}
                    onValueChange={(val) => setRoleState(val as "STUDENT" | "LECTURER")}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="LECTURER" id="r-lecturer" />
                      <Label htmlFor="r-lecturer" className="cursor-pointer">
                        Lecturer
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="STUDENT" id="r-student" />
                      <Label htmlFor="r-student" className="cursor-pointer">
                        Student
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {role === "STUDENT" ? (
                  <div className="space-y-2">
                    <Label htmlFor="matricNumber">Matric Number</Label>
                    <Input
                      id="matricNumber"
                      placeholder="AIT/HND/24/00036"
                      value={matricNumber}
                      onChange={(e) => setMatricNumber(e.target.value)}
                      required
                    />
                    <span className="text-[10px] text-muted-foreground">
                      Format: Dept/HND/Year/Num (e.g. AIT/HND/24/00036)
                    </span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="staffId">Staff ID</Label>
                    <Input
                      id="staffId"
                      placeholder="LC-CS-2026"
                      value={staffId}
                      onChange={(e) => setStaffId(e.target.value)}
                      required
                    />
                  </div>
                )}
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@school.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
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
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-full bg-gradient-primary shadow-glow gap-2 cursor-pointer"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "login" ? "Log in" : mode === "signup" ? "Create account" : "Send reset link"}
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

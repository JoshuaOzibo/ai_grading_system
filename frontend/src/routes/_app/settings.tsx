import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Camera, Loader2, Save } from "lucide-react";
import { useRole } from "@/lib/role-context";
import { useState, useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/settings")({
  component: Settings,
});

interface UserProfileResponse {
  data: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: "STUDENT" | "LECTURER" | "ADMIN";
    matricNumber?: string;
    staffId?: string;
    avatarUrl?: string | null;
  };
}

function Settings() {
  const { user, setUser } = useRole();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Limit file size to 1MB
      if (file.size > 1024 * 1024) {
        toast.error("Avatar image size must be less than 1MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setAvatarUrl(base64String);
        toast.success("Avatar selected successfully!");
      };
      reader.readAsDataURL(file);
    }
  };

  // Sync state when context user changes
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setAvatarUrl(user.avatarUrl || null);
    }
  }, [user]);

  // Profile update mutation
  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      const res = await api.patch<UserProfileResponse>("/users/profile", {
        firstName,
        lastName,
        avatarUrl,
      });
      return res.data;
    },
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
      toast.success("Profile updated successfully!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update profile settings.");
    },
  });

  if (!user) {
    return (
      <div className="flex h-60 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  // Get initials for Avatar Fallback
  const initials = `${firstName.charAt(0) || ""}${lastName.charAt(0) || ""}`.toUpperCase() || "US";

  // Role metadata formatted
  const roleName = user.role === "STUDENT"
    ? "Student"
    : user.role === "LECTURER"
      ? "Lecturer"
      : "System Administrator";

  const identifierLabel = user.role === "STUDENT"
    ? `Matric: ${user.matricNumber || "N/A"}`
    : user.role === "LECTURER"
      ? `Staff ID: ${user.staffId || "N/A"}`
      : "Access level: Global";

  const isSaving = updateProfileMutation.isPending;

  return (
    <div className="space-y-6">
      <PageHeader title="Profile Settings" description="Manage your account preferences and security." />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Summary Card */}
        <Card className="shadow-card bg-background border border-border/60">
          <CardContent className="flex flex-col items-center p-6 text-center">
            <div className="relative">
              <Avatar className="h-24 w-24 border border-border/40">
                {avatarUrl && <AvatarImage src={avatarUrl} />}
                <AvatarFallback className="bg-gradient-primary text-2xl font-bold text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-glow cursor-pointer"
              >
                <Camera className="h-4 w-4" />
              </button>
              <input 
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleAvatarChange}
              />
            </div>
            <h3 className="mt-4 text-lg font-bold text-foreground">{`${firstName} ${lastName}`}</h3>
            <p className="text-sm text-muted-foreground">{roleName}</p>
            <p className="text-xs text-muted-foreground mt-1 font-mono bg-muted px-2.5 py-1 rounded-full border border-border/40">
              {identifierLabel}
            </p>
          </CardContent>
        </Card>

        {/* Edit Form */}
        <Card className="shadow-card lg:col-span-2 bg-background border border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fn">First Name</Label>
                <Input
                  id="fn"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ln">Last Name</Label>
                <Input
                  id="ln"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="em">Email (Disabled)</Label>
                <Input
                  id="em"
                  type="email"
                  value={user.email}
                  disabled
                  className="bg-muted/40 cursor-not-allowed text-muted-foreground border-border/60"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role-field">Account Role</Label>
                <Input
                  id="role-field"
                  value={roleName}
                  disabled
                  className="bg-muted/40 cursor-not-allowed text-muted-foreground border-border/60"
                />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Button
                onClick={() => updateProfileMutation.mutate()}
                disabled={isSaving || !firstName || !lastName}
                className="rounded-full bg-gradient-primary shadow-glow gap-2 cursor-pointer"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card className="shadow-card lg:col-span-2 bg-background border border-border/60">
          <CardHeader>
            <CardTitle className="text-base">System Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              ["Email Notifications", "Receive grading alerts and result publication updates", true],
              ["Realtime Updates", "Connect live streaming updates to results dashboard", true],
            ].map(([t, d, def]) => (
              <div key={t as string} className="flex items-start justify-between gap-4 rounded-xl border p-4 border-border/60 bg-muted/5">
                <div>
                  <p className="font-semibold text-sm text-foreground">{t}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{d}</p>
                </div>
                <Switch defaultChecked={def as boolean} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

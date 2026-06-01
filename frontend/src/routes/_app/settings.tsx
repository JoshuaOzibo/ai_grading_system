import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Camera } from "lucide-react";

export const Route = createFileRoute("/_app/settings")({
  component: Settings,
});

function Settings() {
  return (
    <div className="space-y-6">
      <PageHeader title="Profile Settings" description="Manage your account preferences and security." />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="shadow-card">
          <CardContent className="flex flex-col items-center p-6 text-center">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="bg-gradient-primary text-2xl text-primary-foreground">
                  AD
                </AvatarFallback>
              </Avatar>
              <button className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-glow">
                <Camera className="h-4 w-4" />
              </button>
            </div>
            <h3 className="mt-4 text-lg font-bold">Dr. Adesina</h3>
            <p className="text-sm text-muted-foreground">Senior Lecturer · Computer Science</p>
            <Button variant="outline" className="mt-5 rounded-full w-full">Change avatar</Button>
          </CardContent>
        </Card>

        <Card className="shadow-card lg:col-span-2">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fn">First name</Label>
                <Input id="fn" defaultValue="Bola" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ln">Last name</Label>
                <Input id="ln" defaultValue="Adesina" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="em">Email</Label>
                <Input id="em" type="email" defaultValue="b.adesina@school.edu" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ph">Phone</Label>
                <Input id="ph" type="tel" defaultValue="+234 800 123 4567" />
              </div>
            </div>
            <div className="flex justify-end">
              <Button className="rounded-full bg-gradient-primary shadow-glow">Save changes</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card lg:col-span-2">
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              ["Email notifications", "Receive grading and result updates", true],
              ["AI suggestions", "Show AI grading suggestions", true],
              ["Weekly summary", "Get weekly performance reports", false],
            ].map(([t, d, def]) => (
              <div key={t as string} className="flex items-start justify-between gap-4 rounded-xl border p-4">
                <div>
                  <p className="font-medium">{t}</p>
                  <p className="text-sm text-muted-foreground">{d}</p>
                </div>
                <Switch defaultChecked={def as boolean} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-card border-destructive/30">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Permanently delete your account and all associated data.
            </p>
            <Button variant="destructive" className="rounded-full w-full">Delete account</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

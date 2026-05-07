import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UploadCloud, FileText, X, CheckCircle2 } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/_app/upload")({
  component: UploadAnswers,
});

const sampleFiles = [
  { name: "answer-q1.pdf", size: "2.4 MB", progress: 100 },
  { name: "answer-q2.pdf", size: "1.8 MB", progress: 100 },
  { name: "answer-q3.pdf", size: "3.1 MB", progress: 64 },
];

function UploadAnswers() {
  const [files] = useState(sampleFiles);
  return (
    <div className="space-y-6">
      <PageHeader
        title="Upload Answer Scripts"
        description="Drop scanned answer scripts here. PDF, JPG, or PNG up to 20 MB."
      />

      <Card className="shadow-card">
        <CardContent className="p-6">
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/30 px-6 py-16 text-center transition hover:border-primary/50 hover:bg-accent/30">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow">
              <UploadCloud className="h-8 w-8" />
            </div>
            <p className="mt-5 text-base font-semibold">Drop files here or click to browse</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Supports PDF, JPG, PNG · Max 20 MB per file
            </p>
            <Button type="button" className="mt-5 rounded-full bg-gradient-primary">
              Choose files
            </Button>
            <input type="file" className="hidden" multiple />
          </label>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardContent className="p-5">
          <h3 className="mb-4 font-semibold">Uploads ({files.length})</h3>
          <div className="space-y-3">
            {files.map((f) => (
              <div key={f.name} className="flex items-center gap-4 rounded-xl border p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{f.name}</span>
                    <span className="text-muted-foreground">{f.size}</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-gradient-primary transition-all"
                      style={{ width: `${f.progress}%` }}
                    />
                  </div>
                </div>
                {f.progress === 100 ? (
                  <CheckCircle2 className="h-5 w-5 text-success" />
                ) : (
                  <button className="text-muted-foreground hover:text-destructive">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

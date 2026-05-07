import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Sparkles, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const suggestions = [
  "Summarize the latest exam results",
  "Generate 5 multiple-choice questions on photosynthesis",
  "Why did student #2034 score low?",
  "Draft feedback for poorly answered theory question",
];

export function AIAssistantPanel({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b bg-gradient-soft p-4">
          <SheetTitle className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary shadow-glow">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </span>
            AI Assistant
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            <div className="rounded-2xl rounded-tl-sm bg-muted p-3 text-sm">
              Hi! I can help generate questions, suggest grading rubrics, summarize results,
              and answer questions about student performance.
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Try asking</p>
              {suggestions.map((s) => (
                <button
                  key={s}
                  className="w-full rounded-xl border border-dashed border-border bg-background p-3 text-left text-sm transition hover:border-primary/40 hover:bg-accent"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </ScrollArea>

        <div className="border-t bg-background p-3">
          <form className="flex items-center gap-2">
            <Input placeholder="Ask the AI anything..." className="rounded-full" />
            <Button type="submit" size="icon" className="rounded-full bg-gradient-primary">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}

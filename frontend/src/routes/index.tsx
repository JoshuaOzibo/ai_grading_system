import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  Brain,
  Sparkles,
  Zap,
  Shield,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  GraduationCap,
} from "lucide-react";
import heroImg from "@/assets/hero-ai.jpg";

export const Route = createFileRoute("/")({
  component: Landing,
});

const features = [
  {
    icon: Brain,
    title: "AI-Powered Grading",
    desc: "Grade objective and theory answers in seconds with advanced language models.",
  },
  {
    icon: Zap,
    title: "10x Faster",
    desc: "Process hundreds of submissions in the time it takes to grade one by hand.",
  },
  {
    icon: Shield,
    title: "Always Fair",
    desc: "Consistent rubrics and transparent reasoning for every score.",
  },
  {
    icon: BarChart3,
    title: "Deep Analytics",
    desc: "Track class performance, spot weak topics, and intervene early.",
  },
];

const steps = [
  { n: "01", t: "Create your exam", d: "Build objective and theory questions in minutes." },
  { n: "02", t: "Collect answers", d: "Students submit online or upload scanned scripts." },
  { n: "03", t: "AI grades & explains", d: "Receive scores with feedback you can review and edit." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-border/40 bg-background/70 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight">GradeAI</span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
            <a href="#features" className="hover:text-foreground">Features</a>
            <a href="#how" className="hover:text-foreground">How it works</a>
            <a href="#pricing" className="hover:text-foreground">For educators</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link to="/login">Log in</Link>
            </Button>
            <Button asChild size="sm" className="rounded-full bg-gradient-primary shadow-glow">
              <Link to="/signup">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="container relative mx-auto grid gap-12 px-4 py-20 md:grid-cols-2 md:py-28">
          <div className="animate-slide-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-background/80 px-3 py-1 text-xs font-medium text-primary backdrop-blur">
              <Sparkles className="h-3 w-3" /> Powered by AI · For modern classrooms
            </div>
            <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight md:text-6xl">
              Grade exams in <span className="text-gradient">minutes</span>, not weekends.
            </h1>
            <p className="mt-5 max-w-lg text-lg text-muted-foreground">
              GradeAI helps lecturers create exams, collect answers, and grade them automatically
              with AI — so you can spend more time teaching.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="rounded-full bg-gradient-primary shadow-glow">
                <Link to="/signup">
                  Start grading free <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full">
                <Link to="/dashboard">Live demo</Link>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap gap-6 text-sm text-muted-foreground">
              {["No setup fees", "FERPA aligned", "Cancel anytime"].map((t) => (
                <div key={t} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success" /> {t}
                </div>
              ))}
            </div>
          </div>
          <div className="relative animate-fade-in">
            <div className="absolute -inset-8 rounded-3xl bg-gradient-primary opacity-20 blur-3xl" />
            <img
              src={heroImg}
              alt="AI grading exam papers"
              width={1280}
              height={960}
              className="relative rounded-3xl shadow-glow animate-float"
            />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y bg-muted/30 py-10">
        <div className="container mx-auto grid grid-cols-2 gap-8 px-4 md:grid-cols-4">
          {[
            ["120k+", "Exams graded"],
            ["98.4%", "AI accuracy"],
            ["350+", "Institutions"],
            ["10×", "Faster grading"],
          ].map(([v, l]) => (
            <div key={l} className="text-center">
              <div className="text-3xl font-bold text-gradient md:text-4xl">{v}</div>
              <div className="mt-1 text-sm text-muted-foreground">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container mx-auto px-4 py-20 md:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Everything you need to assess at scale
          </h2>
          <p className="mt-4 text-muted-foreground">
            From question creation to deep analytics — one platform for the entire grading
            lifecycle.
          </p>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border bg-card p-6 shadow-card transition hover:-translate-y-1 hover:shadow-soft"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-soft text-primary transition group-hover:bg-gradient-primary group-hover:text-primary-foreground">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-base font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How */}
      <section id="how" className="bg-gradient-soft py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">How it works</h2>
            <p className="mt-4 text-muted-foreground">Three steps to AI-graded exams.</p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n} className="rounded-2xl border bg-card p-6 shadow-card">
                <div className="text-sm font-bold text-primary">{s.n}</div>
                <h3 className="mt-3 text-lg font-semibold">{s.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="pricing" className="container mx-auto px-4 py-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-primary p-10 text-center shadow-glow md:p-16">
          <GraduationCap className="mx-auto h-12 w-12 text-primary-foreground/80" />
          <h2 className="mt-4 text-3xl font-bold text-primary-foreground md:text-4xl">
            Bring AI grading to your classroom
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-primary-foreground/80">
            Join hundreds of educators saving hours every week.
          </p>
          <Button asChild size="lg" variant="secondary" className="mt-8 rounded-full">
            <Link to="/signup">
              Get started free <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <footer className="border-t py-8">
        <div className="container mx-auto flex flex-col items-center justify-between gap-3 px-4 text-sm text-muted-foreground md:flex-row">
          <p>© 2026 GradeAI. Built for educators.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Terms</a>
            <a href="#" className="hover:text-foreground">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

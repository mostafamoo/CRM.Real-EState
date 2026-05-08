import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight, Sparkles, Inbox, Users, Building2, Network, Zap, BarChart3,
  CheckCircle2, Star, MessageSquare, KeyRound, FileCheck, MapPin, Bot, ShieldCheck,
} from "lucide-react";

export default async function HomePage() {
  const session = await getSession();
  if (session) redirect("/dashboard");

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <Logos />
        <FeatureGrid />
        <ModuleShowcase />
        <Stats />
        <Pricing />
        <Testimonials />
        <FAQ />
        <FinalCTA />
      </main>
      <SiteFooter />
    </div>
  );
}

function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-background/80 border-b border-border">
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
        <Logo />
        <nav className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="#modules" className="hover:text-foreground transition-colors">Modules</a>
          <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
          <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/register">Start free <ArrowRight className="size-4" /></Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 [background:radial-gradient(60rem_40rem_at_50%_-10%,_color-mix(in_oklch,_var(--color-primary)_25%,_transparent),_transparent)]" />
      <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-16 lg:pt-28 lg:pb-24 text-center">
        <Badge variant="default" className="mb-6">
          <Sparkles className="size-3" /> Now with AI Copilot built-in
        </Badge>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight max-w-3xl mx-auto leading-tight">
          The CRM your real estate team
          <br />
          <span className="text-primary">actually opens every morning.</span>
        </h1>
        <p className="mt-5 text-lg text-muted-foreground max-w-2xl mx-auto">
          Track leads, manage listings, close deals — all in one elegant workspace
          tailored for modern brokerages, teams, and agents.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
          <Button asChild size="xl">
            <Link href="/register">
              Start free 14-day trial <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="xl">
            <Link href="/login">See live demo</Link>
          </Button>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          No credit card required · Cancel anytime
        </p>

        {/* Mock browser frame with app preview */}
        <div className="mt-14 lg:mt-20 max-w-5xl mx-auto">
          <div className="rounded-2xl border border-border overflow-hidden bg-card shadow-2xl">
            <div className="flex items-center gap-2 border-b border-border bg-secondary/40 px-4 py-2">
              <span className="size-3 rounded-full bg-destructive/40" />
              <span className="size-3 rounded-full bg-warning/40" />
              <span className="size-3 rounded-full bg-success/40" />
              <div className="flex-1 mx-4 rounded-md bg-card border border-border px-3 py-1 text-xs text-muted-foreground flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-success" />
                app.estata.com/dashboard
              </div>
            </div>
            <div className="grid grid-cols-[200px_1fr] h-72 lg:h-96">
              <div className="bg-sidebar text-sidebar-foreground p-3 space-y-2 hidden sm:block">
                <Logo className="text-sidebar-foreground mb-3" />
                {[
                  { icon: BarChart3, label: "Dashboard", active: true },
                  { icon: Inbox, label: "Inbox", badge: "3" },
                  { icon: Users, label: "Leads" },
                  { icon: Building2, label: "Listings" },
                  { icon: Network, label: "Pipeline" },
                  { icon: KeyRound, label: "Showings" },
                ].map((item, i) => {
                  const I = item.icon;
                  return (
                    <div key={i} className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs ${item.active ? "bg-sidebar-active text-sidebar-active-foreground" : "text-sidebar-foreground/70"}`}>
                      <I className="size-3.5" />
                      <span className="flex-1">{item.label}</span>
                      {item.badge && <span className="rounded-full bg-primary/20 px-1.5 text-[9px]">{item.badge}</span>}
                    </div>
                  );
                })}
              </div>
              <div className="p-6 space-y-4 overflow-hidden">
                <div className="flex justify-between">
                  <div>
                    <h3 className="text-sm font-semibold">Welcome back, Taylor</h3>
                    <p className="text-[10px] text-muted-foreground">Here's what's happening today</p>
                  </div>
                  <div className="flex gap-1">
                    <span className="rounded-md border border-border px-2 py-1 text-[10px]">This month</span>
                    <span className="rounded-md bg-primary text-primary-foreground px-2 py-1 text-[10px]">+ New</span>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: "Active leads", value: "284", trend: "+12%" },
                    { label: "Listings", value: "46", trend: "+3%" },
                    { label: "Open deals", value: "$8.4M", trend: "+24%" },
                    { label: "Conversion", value: "18.2%", trend: "-1%" },
                  ].map((s) => (
                    <div key={s.label} className="rounded-lg border border-border p-2.5">
                      <div className="text-[9px] text-muted-foreground">{s.label}</div>
                      <div className="text-base font-semibold mt-0.5">{s.value}</div>
                      <div className="text-[9px] text-success">{s.trend}</div>
                    </div>
                  ))}
                </div>
                <div className="rounded-lg border border-border p-3 h-32 relative overflow-hidden">
                  <div className="text-[10px] font-medium mb-1">Pipeline performance</div>
                  <svg viewBox="0 0 400 80" className="w-full h-20" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d="M 0,60 Q 50,55 80,40 T 160,30 T 240,20 T 320,15 T 400,10 L 400,80 L 0,80 Z" fill="url(#g1)" />
                    <path d="M 0,60 Q 50,55 80,40 T 160,30 T 240,20 T 320,15 T 400,10" fill="none" stroke="var(--color-primary)" strokeWidth="2" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Logos() {
  return (
    <section className="border-y border-border bg-secondary/30">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <p className="text-center text-xs uppercase tracking-[0.15em] text-muted-foreground mb-6">
          Trusted by modern real estate teams
        </p>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-6 items-center justify-items-center text-muted-foreground">
          {["BAY REALTY", "Hilltop Group", "Coastal Estates", "Riverside Realty", "Cedar & Co", "Park Avenue"].map((n) => (
            <span key={n} className="text-sm font-semibold tracking-wide opacity-70">{n}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureGrid() {
  const features = [
    { icon: Users, title: "Smart lead management", body: "Auto-score leads (Cold→Burning) with budget, recency, and source signals. Never miss a hot lead again." },
    { icon: Inbox, title: "Unified inbox", body: "Email, SMS, calls, and WhatsApp threads in one place. Reply from anywhere with full context." },
    { icon: Network, title: "Visual pipeline", body: "Drag-and-drop deals through Discovery → Closed. Track GCI, splits, and forecast revenue." },
    { icon: Building2, title: "Listings command center", body: "Photo galleries, offers, showings, documents, and a map view. Everything about every property." },
    { icon: Bot, title: "AI Copilot", body: "Built-in assistant drafts emails, summarizes deals, and answers \"what should I do today?\"" },
    { icon: BarChart3, title: "Sales forecasting", body: "Weighted pipeline value, goal tracking, and source conversion analytics." },
    { icon: KeyRound, title: "Showings & open houses", body: "Schedule tours, capture feedback, and turn open-house attendees into leads automatically." },
    { icon: FileCheck, title: "Documents & e-sign", body: "Upload contracts, request signatures, and track every step from Draft to Signed." },
    { icon: ShieldCheck, title: "Multi-tenant ready", body: "Real authentication, JWT sessions, and per-organization data isolation. Enterprise-grade from day one." },
  ];
  return (
    <section id="features" className="py-20 lg:py-28">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <Badge variant="muted">Everything you need</Badge>
          <h2 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight">
            One workspace. The whole transaction.
          </h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            Stop stitching together 7 tools. Estata covers leads, marketing,
            transactions, and team operations end-to-end.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => {
            const I = f.icon;
            return (
              <div key={f.title} className="rounded-xl border border-border bg-card p-6 hover:shadow-md transition-shadow">
                <div className="size-10 rounded-md bg-primary/10 text-primary flex items-center justify-center mb-3">
                  <I className="size-5" />
                </div>
                <h3 className="font-semibold mb-1">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.body}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ModuleShowcase() {
  return (
    <section id="modules" className="py-20 lg:py-28 bg-secondary/30">
      <div className="max-w-6xl mx-auto px-6 space-y-20">
        <div className="text-center">
          <Badge variant="muted">Built for the way agents work</Badge>
          <h2 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight">
            Designed for daily use, not demos
          </h2>
        </div>

        <ModuleRow
          eyebrow="Pipeline"
          title="A pipeline you'll actually update"
          body="Drag deals between stages. See weighted forecasts. Get notified when a deal sits too long. The pipeline that keeps moving."
          bullets={[
            "Drag-and-drop Kanban view",
            "Stage-weighted forecasts",
            "Auto-create commission record on close",
            "Activity log on every deal",
          ]}
          mockup={<PipelineMockup />}
        />

        <ModuleRow
          reverse
          eyebrow="AI Copilot"
          title="Your assistant that actually helps"
          body='Ask "what should I do today?" and get a prioritized list. Draft emails, write listing descriptions, and summarize calls — all without leaving the app.'
          bullets={[
            "Daily priority recommendations",
            "Draft email + SMS",
            "Listing description generator",
            "Lead score breakdown explanations",
          ]}
          mockup={<CopilotMockup />}
        />

        <ModuleRow
          eyebrow="Microsite"
          title="A site that keeps generating leads"
          body="Built-in microsite editor with hero, listings, testimonials, and contact form. Edit the copy, see it live, hit publish. No designer needed."
          bullets={[
            "WYSIWYG editor with live preview",
            "Featured listings auto-sync",
            "Lead capture forms with embed code",
            "Custom domain support",
          ]}
          mockup={<MicrositeMockup />}
        />
      </div>
    </section>
  );
}

function ModuleRow({
  eyebrow, title, body, bullets, mockup, reverse,
}: {
  eyebrow: string; title: string; body: string; bullets: string[]; mockup: React.ReactNode; reverse?: boolean;
}) {
  return (
    <div className={`grid lg:grid-cols-2 gap-10 lg:gap-14 items-center ${reverse ? "lg:flex-row-reverse" : ""}`}>
      <div className={reverse ? "lg:order-2" : ""}>
        <Badge variant="default" className="mb-3">{eyebrow}</Badge>
        <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight">{title}</h3>
        <p className="mt-3 text-muted-foreground">{body}</p>
        <ul className="mt-5 space-y-2">
          {bullets.map((b) => (
            <li key={b} className="flex items-start gap-2 text-sm">
              <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className={reverse ? "lg:order-1" : ""}>{mockup}</div>
    </div>
  );
}

function PipelineMockup() {
  const stages = [
    { name: "Discovery", count: 8, color: "bg-muted-foreground/20", deals: ["Studio · $420k"] },
    { name: "Proposal", count: 5, color: "bg-secondary-foreground/20", deals: ["River Pl · $1.2M"] },
    { name: "Negotiation", count: 3, color: "bg-warning/30", deals: ["Hilltop · $1.75M", "Cedar · $905k"] },
    { name: "Contract", count: 2, color: "bg-primary/20", deals: ["Spruce Ln · $850k"] },
    { name: "Closed", count: 4, color: "bg-success/20", deals: ["Bay St · $690k"] },
  ];
  return (
    <div className="rounded-2xl border border-border bg-card shadow-xl overflow-hidden">
      <div className="border-b border-border p-3 text-xs font-medium">Sales pipeline</div>
      <div className="grid grid-cols-5 gap-1.5 p-3">
        {stages.map((s) => (
          <div key={s.name} className="rounded-md bg-secondary/50 p-2 space-y-1.5">
            <div className="text-[9px] font-semibold flex justify-between">
              <span>{s.name}</span>
              <span className="text-muted-foreground">{s.count}</span>
            </div>
            {s.deals.map((d, i) => (
              <div key={i} className="rounded bg-card border border-border px-1.5 py-1">
                <div className="text-[9px] truncate">{d}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function CopilotMockup() {
  return (
    <div className="rounded-2xl border border-border bg-card shadow-xl overflow-hidden max-w-md mx-auto">
      <div className="flex items-center gap-2 border-b border-border p-3">
        <div className="size-7 rounded-md bg-primary text-primary-foreground flex items-center justify-center">
          <Sparkles className="size-3.5" />
        </div>
        <div className="flex-1">
          <div className="text-xs font-semibold">Estata Copilot</div>
          <div className="text-[9px] text-muted-foreground">AI assistant</div>
        </div>
      </div>
      <div className="p-4 space-y-3 bg-secondary/20">
        <div className="flex justify-end">
          <div className="rounded-2xl rounded-br-sm bg-primary text-primary-foreground px-3 py-2 text-xs max-w-[85%]">
            What should I do today?
          </div>
        </div>
        <div className="flex gap-2">
          <div className="size-6 rounded-full bg-primary/15 text-primary flex items-center justify-center shrink-0">
            <Sparkles className="size-3" />
          </div>
          <div className="rounded-2xl rounded-bl-sm bg-card border border-border px-3 py-2 text-xs max-w-[85%] space-y-1">
            <div>🔥 <strong>3 hot leads to call:</strong></div>
            <div>• Hannah Carlton (score 84)</div>
            <div>• Priya Natarajan (score 79)</div>
            <div>• Ava Mendoza (score 71)</div>
            <div>⏰ <strong>2 overdue tasks:</strong></div>
            <div>• Counter-offer review</div>
            <div>• Inspection on Cedar Trail</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MicrositeMockup() {
  return (
    <div className="rounded-2xl border border-border bg-card shadow-xl overflow-hidden">
      <div className="bg-gradient-to-br from-sidebar via-sidebar/90 to-primary/40 p-6 text-white text-center">
        <div className="text-[9px] uppercase tracking-[0.2em] opacity-70 mb-2">Real estate · SF Bay Area</div>
        <h4 className="text-lg font-bold">Find your dream home</h4>
        <p className="text-[10px] opacity-80 mt-1 max-w-xs mx-auto">Curated listings from Bay Area's top agents.</p>
        <div className="mt-3 flex justify-center gap-1.5">
          <span className="rounded bg-primary px-2 py-1 text-[9px]">Browse</span>
          <span className="rounded border border-white/30 bg-white/10 px-2 py-1 text-[9px]">Contact</span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-1 p-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded border border-border overflow-hidden">
            <div className="aspect-square bg-gradient-to-br from-secondary to-muted relative">
              <div className="absolute inset-0 [background:radial-gradient(6rem_6rem_at_60%_50%,_var(--color-primary),_transparent)] opacity-25" />
            </div>
            <div className="p-1.5 text-[8px]">
              <div className="font-semibold">$850k</div>
              <div className="text-muted-foreground truncate">3bd · 2ba</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stats() {
  return (
    <section className="py-20">
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {[
            { value: "12k+", label: "Agents on Estata" },
            { value: "38k", label: "Active listings" },
            { value: "$2.4B", label: "Closed volume" },
            { value: "4.8 / 5", label: "Customer rating" },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-3xl sm:text-4xl font-semibold tracking-tight text-primary">{s.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const plans = [
    {
      name: "Starter",
      price: 49,
      description: "For solo agents getting started.",
      features: ["Up to 250 leads", "Basic email automations", "1 user", "Community support"],
    },
    {
      name: "Pro",
      price: 149,
      badge: "Most popular",
      description: "For growing teams that need more power.",
      features: ["Unlimited leads", "Microsite + custom domain", "Up to 10 users", "AI Copilot", "Priority support"],
      featured: true,
    },
    {
      name: "Enterprise",
      price: 499,
      description: "For brokerages with advanced needs.",
      features: ["Everything in Pro", "SSO + API access", "Unlimited users", "Dedicated CSM"],
    },
  ];
  return (
    <section id="pricing" className="py-20 lg:py-28 bg-secondary/30 border-y border-border">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <Badge variant="muted">Pricing</Badge>
          <h2 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight">
            Simple pricing. Honest value.
          </h2>
          <p className="mt-3 text-muted-foreground">
            Try every feature free for 14 days. Cancel anytime. No credit card required.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3 max-w-5xl mx-auto">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`relative rounded-2xl border p-6 bg-card ${
                p.featured ? "border-primary ring-2 ring-primary shadow-xl" : "border-border"
              }`}
            >
              {p.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider px-3 py-1">
                  {p.badge}
                </span>
              )}
              <h3 className="text-lg font-semibold">{p.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{p.description}</p>
              <div className="mt-5">
                <span className="text-4xl font-semibold">${p.price}</span>
                <span className="text-muted-foreground"> / month</span>
              </div>
              <Button asChild className="w-full mt-5" variant={p.featured ? "default" : "outline"}>
                <Link href="/register">Start {p.name} trial</Link>
              </Button>
              <ul className="mt-6 space-y-2 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const items = [
    { quote: "We replaced Follow Up Boss + Constant Contact + DocuSign with just Estata. Saved $400/mo and our team actually uses it.", author: "Marcus Reed", role: "Broker · Bay Realty Group", rating: 5 },
    { quote: "The AI copilot tells me exactly who to call each morning. I've doubled my closed deals this quarter.", author: "Diana Powell", role: "Senior Agent · Coastal Estates", rating: 5 },
    { quote: "Setup took 20 minutes. Imported leads via CSV, microsite live the same day. Cleanest CRM I've used.", author: "Naomi Lee", role: "Founder · Hilltop Group", rating: 5 },
  ];
  return (
    <section className="py-20 lg:py-28">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <Badge variant="muted">Loved by agents</Badge>
          <h2 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight">
            What real agents are saying
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {items.map((t) => (
            <div key={t.author} className="rounded-2xl border border-border bg-card p-6 space-y-4">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`size-4 ${i < t.rating ? "fill-warning text-warning" : "text-muted-foreground/30"}`} />
                ))}
              </div>
              <p className="text-sm leading-relaxed">"{t.quote}"</p>
              <div className="border-t border-border pt-4">
                <div className="text-sm font-medium">{t.author}</div>
                <div className="text-xs text-muted-foreground">{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const items = [
    { q: "Do I need to migrate data from my current CRM?", a: "Estata supports CSV import for leads, contacts, and listings. Most teams migrate in under an hour." },
    { q: "Can I use my own domain for the microsite?", a: "Yes — Pro and Enterprise plans support custom domains. We handle SSL automatically." },
    { q: "How does the AI Copilot work?", a: "Copilot reads your workspace data and helps with daily priorities, drafting emails, summarizing leads, and more. Your data stays in your workspace." },
    { q: "Is there a setup fee?", a: "No. Sign up, import data, and start working. You only pay the monthly subscription, and the first 14 days are free." },
    { q: "Can I cancel anytime?", a: "Yes. Cancel from billing settings — you'll keep access until the end of the current period." },
    { q: "Does it support teams?", a: "Pro plan includes up to 10 seats. Enterprise is unlimited. Each user has their own login and you control roles per member." },
  ];
  return (
    <section id="faq" className="py-20 lg:py-28 bg-secondary/30 border-t border-border">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-12">
          <Badge variant="muted">FAQ</Badge>
          <h2 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight">
            Questions? Answered.
          </h2>
        </div>
        <div className="space-y-3">
          {items.map((item) => (
            <details
              key={item.q}
              className="group rounded-xl border border-border bg-card p-5 cursor-pointer"
            >
              <summary className="font-medium flex items-center justify-between list-none">
                <span>{item.q}</span>
                <span className="text-muted-foreground transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm text-muted-foreground">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 [background:radial-gradient(60rem_30rem_at_50%_0%,_color-mix(in_oklch,_var(--color-primary)_30%,_transparent),_transparent)]" />
      <div className="relative max-w-4xl mx-auto px-6 py-24 text-center">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight">
          Ready to close more deals?
        </h2>
        <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
          Join hundreds of brokers running their entire business on Estata.
          14 days free. No credit card.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
          <Button asChild size="xl">
            <Link href="/register">
              Start free trial <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="xl">
            <Link href="/login">See live demo</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <Logo />
            <p className="text-xs text-muted-foreground mt-3 max-w-xs">
              The CRM your real estate team actually uses.
            </p>
          </div>
          <FooterCol title="Product" links={[
            { label: "Features", href: "#features" },
            { label: "Pricing", href: "#pricing" },
            { label: "FAQ", href: "#faq" },
            { label: "Demo", href: "/login" },
          ]} />
          <FooterCol title="Company" links={[
            { label: "About", href: "#" },
            { label: "Blog", href: "#" },
            { label: "Careers", href: "#" },
            { label: "Contact", href: "#" },
          ]} />
          <FooterCol title="Legal" links={[
            { label: "Privacy", href: "#" },
            { label: "Terms", href: "#" },
            { label: "Security", href: "#" },
          ]} />
        </div>
        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row gap-3 sm:justify-between text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} Estata CRM. All rights reserved.</span>
          <span className="flex items-center gap-1.5">
            <MapPin className="size-3" /> Built for modern brokerages
          </span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">{title}</h4>
      <ul className="space-y-2 text-sm">
        {links.map((l) => (
          <li key={l.label}>
            <a href={l.href} className="hover:text-primary transition-colors">{l.label}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

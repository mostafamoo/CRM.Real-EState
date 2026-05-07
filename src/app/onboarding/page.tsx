import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ArrowRight } from "lucide-react";

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
    features: ["Unlimited leads", "Microsite + custom domain", "Up to 10 users", "Priority support"],
    featured: true,
  },
  {
    name: "Enterprise",
    price: 499,
    description: "For brokerages with advanced needs.",
    features: ["Everything in Pro", "SSO + API access", "Unlimited users", "Dedicated CSM"],
  },
];

export default function OnboardingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border bg-background/85 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-3 text-sm">
            <span className="text-muted-foreground">Step 1 of 3</span>
            <div className="flex gap-1">
              <span className="size-1.5 rounded-full bg-primary" />
              <span className="size-1.5 rounded-full bg-secondary" />
              <span className="size-1.5 rounded-full bg-secondary" />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 px-6 py-12">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <Badge variant="default">Free for 14 days</Badge>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
              Choose the plan that fits your team
            </h1>
            <p className="text-muted-foreground">
              You won't be charged until your trial ends. Cancel anytime, no questions asked.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {plans.map((p) => (
              <Card
                key={p.name}
                className={p.featured ? "ring-2 ring-primary shadow-lg relative" : ""}
              >
                {p.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold uppercase tracking-wider px-3 py-1">
                    {p.badge}
                  </span>
                )}
                <CardContent className="p-6 space-y-5">
                  <div>
                    <h3 className="text-lg font-semibold">{p.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{p.description}</p>
                  </div>
                  <div>
                    <span className="text-3xl font-semibold">${p.price}</span>
                    <span className="text-muted-foreground"> / month</span>
                  </div>
                  <ul className="space-y-2 text-sm">
                    {p.features.map((f) => (
                      <li key={f} className="flex gap-2">
                        <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button asChild className="w-full" variant={p.featured ? "default" : "outline"}>
                    <Link href="/dashboard">
                      Start {p.name} trial <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Need a custom plan?{" "}
            <Link href="#" className="text-primary font-medium hover:underline">
              Contact our sales team
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

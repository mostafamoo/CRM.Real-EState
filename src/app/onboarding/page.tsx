"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/layout/logo";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ArrowRight, ArrowLeft, User, Users, Building } from "lucide-react";
import { useCRM, PLANS } from "@/lib/store";
import type { Plan } from "@/lib/types";

export default function OnboardingPage() {
  const router = useRouter();
  const { changePlan } = useCRM();
  
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<"solo" | "team" | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRoleSelect = (r: "solo" | "team") => {
    setRole(r);
    setStep(2);
  };

  const handlePlanSelect = async (p: Plan) => {
    setSelectedPlan(p);
    setIsSubmitting(true);
    try {
      await changePlan(p, "monthly");
      router.push("/dashboard");
    } catch (e) {
      console.error(e);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border bg-background/85 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-3 text-sm">
            {step > 1 && (
              <button 
                onClick={() => setStep(step - 1)} 
                className="text-muted-foreground hover:text-foreground flex items-center gap-1 mr-4 transition-colors"
              >
                <ArrowLeft className="size-4" /> Back
              </button>
            )}
            <span className="text-muted-foreground font-medium">Step {step} of 2</span>
            <div className="flex gap-1.5">
              <span className={`h-1.5 rounded-full transition-all duration-300 ${step >= 1 ? "w-6 bg-primary" : "w-1.5 bg-secondary"}`} />
              <span className={`h-1.5 rounded-full transition-all duration-300 ${step >= 2 ? "w-6 bg-primary" : "w-1.5 bg-secondary"}`} />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 px-6 py-16 flex flex-col justify-center">
        <div className="max-w-5xl mx-auto w-full space-y-12">
          
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-10">
              <div className="text-center space-y-4 max-w-2xl mx-auto">
                <Badge variant="secondary" className="px-3 py-1 text-sm bg-primary/10 text-primary border-primary/20">Welcome to Estata CRM</Badge>
                <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
                  How do you work?
                </h1>
                <p className="text-lg text-muted-foreground">
                  We'll customize your CRM experience based on your needs.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2 max-w-3xl mx-auto">
                <button
                  onClick={() => handleRoleSelect("solo")}
                  className="group text-left"
                >
                  <Card className="h-full transition-all duration-300 hover:border-primary/50 hover:shadow-md hover:shadow-primary/5 bg-card/50 hover:bg-card">
                    <CardContent className="p-8 space-y-6">
                      <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary transition-all duration-300">
                        <User className="size-7 text-primary group-hover:text-primary-foreground transition-colors" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-2xl font-semibold">I work independently</h3>
                        <p className="text-muted-foreground leading-relaxed">
                          I am a solo agent looking to manage my own leads, deals, and daily tasks efficiently.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </button>

                <button
                  onClick={() => handleRoleSelect("team")}
                  className="group text-left"
                >
                  <Card className="h-full transition-all duration-300 hover:border-primary/50 hover:shadow-md hover:shadow-primary/5 bg-card/50 hover:bg-card">
                    <CardContent className="p-8 space-y-6">
                      <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary transition-all duration-300">
                        <Users className="size-7 text-primary group-hover:text-primary-foreground transition-colors" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-2xl font-semibold">I lead a team</h3>
                        <p className="text-muted-foreground leading-relaxed">
                          I manage a team or brokerage and need collaboration, analytics, and permissions.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-10">
              <div className="text-center space-y-4 max-w-2xl mx-auto">
                <Badge variant="secondary" className="px-3 py-1 text-sm bg-primary/10 text-primary border-primary/20">Pricing & Plans</Badge>
                <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
                  Choose the right plan
                </h1>
                <p className="text-lg text-muted-foreground">
                  Select the best plan for your {role === "solo" ? "solo business" : "team"}. Free 14-day trial on all plans.
                </p>
              </div>

              <div className={`grid gap-6 mx-auto ${role === "solo" ? "max-w-md" : "max-w-5xl md:grid-cols-3"}`}>
                
                {role === "solo" && (
                  <Card className="ring-2 ring-primary shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-5">
                      <User className="size-32" />
                    </div>
                    <span className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
                    <CardContent className="p-8 space-y-8 relative z-10">
                      <div className="space-y-2">
                        <Badge className="mb-4">Recommended for you</Badge>
                        <h3 className="text-2xl font-bold">Starter Plan</h3>
                        <p className="text-muted-foreground">Everything a solo agent needs to succeed.</p>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-bold tracking-tight">${PLANS.Starter.price / 100}</span>
                        <span className="text-muted-foreground font-medium">/ month</span>
                      </div>
                      <ul className="space-y-4 text-sm font-medium">
                        {PLANS.Starter.features.map((f) => (
                          <li key={f} className="flex gap-3 items-start">
                            <CheckCircle2 className="size-5 text-primary shrink-0" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                      <Button 
                        size="lg" 
                        className="w-full text-base font-semibold h-12"
                        onClick={() => handlePlanSelect("Starter")}
                        disabled={isSubmitting}
                      >
                        {isSubmitting && selectedPlan === "Starter" ? "Setting up..." : "Start 14-day Free Trial"} <ArrowRight className="ml-2 size-5" />
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {role === "team" && (
                  <>
                    <Card className="relative overflow-hidden transition-all duration-300 hover:border-primary/50 bg-card/50 hover:bg-card">
                      <CardContent className="p-8 space-y-8">
                        <div className="space-y-2">
                          <h3 className="text-2xl font-bold">Growth</h3>
                          <p className="text-muted-foreground">For small teams getting started.</p>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-4xl font-bold tracking-tight">${PLANS.Growth.price / 100}</span>
                          <span className="text-muted-foreground">/ month</span>
                        </div>
                        <ul className="space-y-3 text-sm">
                          {PLANS.Growth.features.map((f) => (
                            <li key={f} className="flex gap-3 items-start">
                              <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                              <span className="text-muted-foreground">{f}</span>
                            </li>
                          ))}
                        </ul>
                        <Button 
                          variant="outline"
                          size="lg" 
                          className="w-full"
                          onClick={() => handlePlanSelect("Growth")}
                          disabled={isSubmitting}
                        >
                          {isSubmitting && selectedPlan === "Growth" ? "Setting up..." : "Select Growth"}
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="ring-2 ring-primary shadow-xl relative overflow-hidden transform md:-translate-y-4">
                      <span className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
                      <span className="absolute top-4 right-4 bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full">
                        Most Popular
                      </span>
                      <CardContent className="p-8 space-y-8">
                        <div className="space-y-2 pt-2">
                          <h3 className="text-2xl font-bold">Brokerage</h3>
                          <p className="text-muted-foreground">For scaling brokerages and large teams.</p>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-5xl font-bold tracking-tight">${PLANS.Brokerage.price / 100}</span>
                          <span className="text-muted-foreground font-medium">/ month</span>
                        </div>
                        <ul className="space-y-4 text-sm font-medium">
                          {PLANS.Brokerage.features.map((f) => (
                            <li key={f} className="flex gap-3 items-start">
                              <CheckCircle2 className="size-5 text-primary shrink-0" />
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                        <Button 
                          size="lg" 
                          className="w-full text-base font-semibold h-12"
                          onClick={() => handlePlanSelect("Brokerage")}
                          disabled={isSubmitting}
                        >
                          {isSubmitting && selectedPlan === "Brokerage" ? "Setting up..." : "Start 14-day Free Trial"}
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="relative overflow-hidden transition-all duration-300 hover:border-primary/50 bg-card/50 hover:bg-card">
                      <CardContent className="p-8 space-y-8">
                        <div className="space-y-2">
                          <h3 className="text-2xl font-bold">Enterprise</h3>
                          <p className="text-muted-foreground">For massive scale and custom needs.</p>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-4xl font-bold tracking-tight">Custom</span>
                        </div>
                        <ul className="space-y-3 text-sm">
                          {PLANS.Enterprise.features.map((f) => (
                            <li key={f} className="flex gap-3 items-start">
                              <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                              <span className="text-muted-foreground">{f}</span>
                            </li>
                          ))}
                        </ul>
                        <Button 
                          variant="outline"
                          size="lg" 
                          className="w-full"
                          onClick={() => handlePlanSelect("Enterprise")}
                          disabled={isSubmitting}
                        >
                          {isSubmitting && selectedPlan === "Enterprise" ? "Setting up..." : "Contact Sales"}
                        </Button>
                      </CardContent>
                    </Card>
                  </>
                )}

              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

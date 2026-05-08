"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Building, User, Users } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState("");

  const handleFinish = () => {
    router.push("/dashboard");
    router.refresh();
  };

  if (step === 1) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome to Estata</h1>
          <p className="text-muted-foreground mt-2">Let's personalize your workspace. How do you plan to use the CRM?</p>
        </div>
        <div className="grid gap-4">
          {[
            { id: "solo", icon: User, title: "Solo Agent", desc: "I'm working independently" },
            { id: "team", icon: Users, title: "Team Leader", desc: "I manage a small team of agents" },
            { id: "broker", icon: Building, title: "Brokerage", desc: "I run a full real estate brokerage" }
          ].map(r => (
            <button 
              key={r.id}
              onClick={() => setRole(r.id)}
              className={`flex items-start gap-4 p-4 rounded-xl border text-left transition-all ${role === r.id ? "border-primary bg-primary/5 ring-1 ring-primary shadow-sm" : "border-border hover:border-primary/30 hover:bg-muted/30"}`}
            >
              <div className={`mt-1 size-10 rounded-lg flex items-center justify-center shrink-0 transition-colors ${role === r.id ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground"}`}>
                <r.icon className="size-5" />
              </div>
              <div>
                <div className="font-medium text-foreground">{r.title}</div>
                <div className="text-sm text-muted-foreground mt-1">{r.desc}</div>
              </div>
            </button>
          ))}
        </div>
        <Button 
          className="w-full h-11 text-base transition-all" 
          disabled={!role} 
          onClick={() => setStep(2)}
        >
          Continue
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-center animate-in zoom-in-95 fade-in duration-500">
      <div className="size-20 rounded-full bg-success/10 text-success flex items-center justify-center mx-auto ring-8 ring-success/5">
        <CheckCircle2 className="size-10" />
      </div>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">You're all set!</h1>
        <p className="text-muted-foreground mt-3 text-lg max-w-sm mx-auto">Your workspace has been tailored to your needs. Let's start closing deals.</p>
      </div>
      <Button className="w-full h-12 text-lg rounded-xl shadow-lg shadow-primary/20" onClick={handleFinish}>
        Go to Dashboard
      </Button>
    </div>
  );
}

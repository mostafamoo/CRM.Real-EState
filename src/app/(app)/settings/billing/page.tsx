"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TBody, TD, TH, THead, TR } from "@/components/common/data-table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog";
import { useCRM, type Plan, type PaymentMethod } from "@/lib/store";
import { PLANS } from "@/lib/store";
import { CheckCircle2, Download, CreditCard, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export default function BillingPage() {
  const subscription = useCRM((s) => s.subscription);
  const paymentMethod = useCRM((s) => s.paymentMethod);
  const invoices = useCRM((s) => s.invoices);
  const changePlan = useCRM((s) => s.changePlan);
  const cancelSubscription = useCRM((s) => s.cancelSubscription);
  const resumeSubscription = useCRM((s) => s.resumeSubscription);
  const updatePaymentMethod = useCRM((s) => s.updatePaymentMethod);

  const [planOpen, setPlanOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan>(subscription.plan);
  const [selectedCycle, setSelectedCycle] = useState<"monthly" | "yearly">(subscription.cycle);

  const [cardOpen, setCardOpen] = useState(false);
  const [card, setCard] = useState({
    brand: "Visa" as PaymentMethod["brand"],
    number: "",
    expMonth: paymentMethod.expMonth,
    expYear: paymentMethod.expYear,
    cvc: "",
  });

  const [cancelOpen, setCancelOpen] = useState(false);

  function confirmPlanChange() {
    changePlan(selectedPlan, selectedCycle);
    toast.success(`Switched to ${selectedPlan} (${selectedCycle})`);
    setPlanOpen(false);
  }

  function handleSaveCard(e: React.FormEvent) {
    e.preventDefault();
    if (!card.number || card.number.replace(/\s/g, "").length < 13) {
      toast.error("Enter a valid card number");
      return;
    }
    if (!card.cvc) {
      toast.error("CVC required");
      return;
    }
    const last4 = card.number.replace(/\s/g, "").slice(-4);
    updatePaymentMethod({
      brand: card.brand,
      last4,
      expMonth: Number(card.expMonth),
      expYear: Number(card.expYear),
    });
    toast.success("Card updated");
    setCardOpen(false);
    setCard({ ...card, number: "", cvc: "" });
  }

  function downloadInvoice(invoiceId: string) {
    const inv = invoices.find((i) => i.id === invoiceId);
    if (!inv) return;
    const text = [
      `INVOICE`,
      `=========================`,
      `Number:      ${inv.id}`,
      `Date:        ${inv.date}`,
      `Description: ${inv.description}`,
      `Amount:      $${inv.amount.toLocaleString()}`,
      `Status:      ${inv.status}`,
      ``,
      `Estata CRM`,
      `support@estata.app`,
    ].join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${inv.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${inv.id}`);
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Current plan</CardTitle>
            <CardDescription>You can change your plan anytime.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start justify-between gap-3 rounded-xl border border-border bg-secondary/40 p-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-semibold">{subscription.plan}</h3>
                  {subscription.status === "active" && <Badge variant="success">Active</Badge>}
                  {subscription.status === "cancelled" && <Badge variant="warning">Cancels {subscription.cancelAt ? new Date(subscription.cancelAt).toLocaleDateString() : ""}</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">
                  {subscription.seats === 999 ? "Unlimited" : subscription.seats} seats · {subscription.cycle === "yearly" ? "Billed annually (20% off)" : "Billed monthly"}
                </p>
                <p className="mt-3">
                  <span className="text-2xl font-semibold">${subscription.price.toLocaleString()}</span>
                  <span className="text-sm text-muted-foreground"> / {subscription.cycle === "yearly" ? "year" : "month"}</span>
                </p>
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                <Button variant="default" size="sm" onClick={() => { setSelectedPlan(subscription.plan); setSelectedCycle(subscription.cycle); setPlanOpen(true); }}>
                  Change plan
                </Button>
                {subscription.status === "active" ? (
                  <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setCancelOpen(true)}>
                    Cancel
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => { resumeSubscription(); toast.success("Subscription resumed"); }}>
                    Resume
                  </Button>
                )}
              </div>
            </div>

            <ul className="space-y-2 text-sm">
              {subscription.features.map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-primary" />
                  {f}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment method</CardTitle>
            <CardDescription>Default card on file</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg border border-border p-4 bg-gradient-to-br from-secondary/40 to-secondary/20">
              <div className="flex items-center justify-between">
                <CreditCard className="size-5 text-muted-foreground" />
                <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{paymentMethod.brand}</span>
              </div>
              <div className="text-xl font-semibold tracking-wider mt-2">•••• •••• •••• {paymentMethod.last4}</div>
              <div className="text-xs text-muted-foreground mt-1">
                Expires {String(paymentMethod.expMonth).padStart(2, "0")} / {paymentMethod.expYear}
              </div>
            </div>
            <Button variant="outline" className="w-full" onClick={() => setCardOpen(true)}>Update card</Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
          <CardDescription>{invoices.length} billing history records</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <THead>
              <TR>
                <TH>Invoice</TH>
                <TH>Date</TH>
                <TH>Description</TH>
                <TH>Amount</TH>
                <TH>Status</TH>
                <TH className="text-right">Download</TH>
              </TR>
            </THead>
            <TBody>
              {invoices.map((i) => (
                <TR key={i.id}>
                  <TD className="font-medium">{i.id}</TD>
                  <TD>{i.date}</TD>
                  <TD className="text-muted-foreground">{i.description}</TD>
                  <TD>${i.amount.toLocaleString()}</TD>
                  <TD><Badge variant={i.status === "Paid" ? "success" : i.status === "Pending" ? "warning" : "destructive"}>{i.status}</Badge></TD>
                  <TD className="text-right">
                    <Button variant="ghost" size="icon-sm" onClick={() => downloadInvoice(i.id)}>
                      <Download className="size-4" />
                    </Button>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </CardContent>
      </Card>

      {/* Change plan dialog */}
      <Dialog open={planOpen} onOpenChange={setPlanOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Choose your plan</DialogTitle>
            <DialogDescription>Switch anytime — billing prorates automatically.</DialogDescription>
          </DialogHeader>

          <div className="flex justify-center my-2">
            <div className="inline-flex rounded-lg bg-secondary p-1">
              <button
                onClick={() => setSelectedCycle("monthly")}
                className={cn("px-4 py-1.5 text-sm rounded-md transition-colors", selectedCycle === "monthly" ? "bg-card shadow-sm font-medium" : "text-muted-foreground")}
              >
                Monthly
              </button>
              <button
                onClick={() => setSelectedCycle("yearly")}
                className={cn("px-4 py-1.5 text-sm rounded-md transition-colors flex items-center gap-1.5", selectedCycle === "yearly" ? "bg-card shadow-sm font-medium" : "text-muted-foreground")}
              >
                Yearly
                <Badge variant="success" className="text-[9px]">Save 20%</Badge>
              </button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {(Object.keys(PLANS) as Plan[]).map((plan) => {
              const meta = PLANS[plan];
              const price = selectedCycle === "yearly" ? Math.round(meta.price * 12 * 0.8) : meta.price;
              const isSelected = selectedPlan === plan;
              const isCurrent = subscription.plan === plan && subscription.cycle === selectedCycle;
              return (
                <button
                  key={plan}
                  onClick={() => setSelectedPlan(plan)}
                  className={cn(
                    "relative text-left rounded-xl border p-5 transition-all",
                    isSelected ? "border-primary ring-2 ring-primary shadow-lg" : "border-border hover:border-primary/40"
                  )}
                >
                  {plan === "Pro" && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider px-3 py-1">
                      <Sparkles className="size-3 inline -mt-0.5 mr-0.5" /> Most popular
                    </span>
                  )}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">{plan}</h3>
                      {isCurrent && <Badge variant="muted" className="text-[9px]">Current</Badge>}
                    </div>
                    <div>
                      <span className="text-2xl font-semibold">${price.toLocaleString()}</span>
                      <span className="text-sm text-muted-foreground"> / {selectedCycle === "yearly" ? "year" : "month"}</span>
                    </div>
                    <ul className="space-y-1.5 text-sm">
                      {meta.features.slice(0, 4).map((f) => (
                        <li key={f} className="flex gap-2">
                          <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </button>
              );
            })}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setPlanOpen(false)}>Cancel</Button>
            <Button onClick={confirmPlanChange} disabled={selectedPlan === subscription.plan && selectedCycle === subscription.cycle}>
              {selectedPlan === subscription.plan && selectedCycle === subscription.cycle
                ? "No changes"
                : `Switch to ${selectedPlan} (${selectedCycle})`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update card dialog */}
      <Dialog open={cardOpen} onOpenChange={setCardOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update payment method</DialogTitle>
            <DialogDescription>Card details are masked locally — no real charge happens.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveCard} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Card number</Label>
              <Input
                value={card.number}
                onChange={(e) => setCard({ ...card, number: e.target.value })}
                placeholder="4242 4242 4242 4242"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>Month</Label>
                <Input type="number" min={1} max={12} value={card.expMonth} onChange={(e) => setCard({ ...card, expMonth: Number(e.target.value) })} />
              </div>
              <div className="space-y-1.5">
                <Label>Year</Label>
                <Input type="number" min={2026} max={2040} value={card.expYear} onChange={(e) => setCard({ ...card, expYear: Number(e.target.value) })} />
              </div>
              <div className="space-y-1.5">
                <Label>CVC</Label>
                <Input value={card.cvc} onChange={(e) => setCard({ ...card, cvc: e.target.value })} placeholder="123" />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button type="button" variant="ghost" onClick={() => setCardOpen(false)}>Cancel</Button>
              <Button type="submit">Save card</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        onConfirm={() => { cancelSubscription(); toast.success("Subscription will end at the end of the current period"); }}
        title="Cancel subscription?"
        description="You'll keep access until the end of the current billing period. You can resume anytime."
        confirmText="Cancel subscription"
      />
    </div>
  );
}

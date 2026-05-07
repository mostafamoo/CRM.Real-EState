"use client";

import { useEffect } from "react";
import { useCRM } from "@/lib/store";

export function HydrateStore({ data }: { data: Record<string, unknown> }) {
  const hydrate = useCRM((s) => s.hydrate);
  useEffect(() => {
    if (!data) return;
    const d = data as Record<string, unknown>;
    const u = d.user as { id: string; firstName: string; lastName: string; email: string; phone: string | null; title: string | null; license: string | null; bio: string | null; } | undefined;
    const o = d.organization as { id: string; name: string; dba: string | null; license: string | null; ein: string | null; website: string | null; phone: string | null; address: string | null; city: string | null; state: string | null; zip: string | null; } | undefined;
    const sub = d.subscription as { plan?: string; price?: number; cycle?: string; seats?: number; status?: string; cancelAt?: Date | number | null; paymentMethod?: { brand: string; last4: string; expMonth: number; expYear: number } | null } | undefined;
    const subFeatures = sub?.plan === "Starter" ? ["Up to 250 leads", "Basic email automations", "1 user", "Community support"]
      : sub?.plan === "Enterprise" ? ["Everything in Pro", "SSO + API access", "Unlimited users", "Dedicated CSM", "Custom contracts and SLAs"]
      : ["Unlimited leads, deals, and listings", "Custom microsite + custom domain", "Up to 10 users", "Email & SMS automations", "Team analytics and reporting", "Priority support"];

    hydrate({
      user: u as never,
      business: o as never,
      leads: d.leads as never,
      deals: d.deals as never,
      listings: d.listings as never,
      contacts: d.contacts as never,
      tasks: d.tasks as never,
      campaigns: d.campaigns as never,
      automations: d.automations as never,
      integrations: d.integrations as never,
      offers: d.offers as never,
      events: d.calendarEvents as never,
      threads: d.threads as never,
      messages: d.messages as never,
      documents: d.documents as never,
      activity: d.activity as never,
      comments: d.comments as never,
      tags: d.tags as never,
      leadTags: d.leadTags as never,
      showings: d.showings as never,
      openHouses: d.openHouses as never,
      commissions: d.commissions as never,
      forms: d.forms as never,
      sequences: d.sequences as never,
      savedViews: d.savedViews as never,
      notifications: d.notifications as never,
      microsite: (d.microsite ?? {
        domain: "", tagline: "", heroHeadline: "", heroSubheadline: "",
        heroCtaPrimary: "", heroCtaSecondary: "", heroBackgroundStyle: "gradient-primary",
        about: "", contactEmail: "", contactPhone: "", contactAddress: "",
        testimonials: [], featuredListingIds: [],
        sections: { hero: true, listings: true, about: true, testimonials: true, contact: true, stats: false },
        theme: { primary: "#0d9488", accent: "#fbbf24" },
        pageViews: 0, clicks: 0, formSubmissions: 0, published: false,
      }) as never,
      subscription: {
        plan: (sub?.plan ?? "Pro") as never,
        price: sub?.price ?? 1490,
        cycle: (sub?.cycle ?? "monthly") as never,
        seats: sub?.seats ?? 10,
        status: (sub?.status ?? "active") as never,
        cancelAt: sub?.cancelAt ? Number(sub.cancelAt) : undefined,
        features: subFeatures,
      } as never,
      paymentMethod: (sub?.paymentMethod ?? { brand: "Visa", last4: "0000", expMonth: 1, expYear: 2030 }) as never,
      invoices: d.invoices as never,
    });
  }, [data, hydrate]);

  return null;
}

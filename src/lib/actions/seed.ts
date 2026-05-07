"use server";

import { db, t } from "@/lib/db";
import { newId } from "@/lib/auth";

const integrations = [
  { name: "Zillow", category: "Lead Sources", description: "Sync leads and listings from Zillow Premier Agent.", connected: true, color: "from-sky-500 to-blue-600" },
  { name: "Realtor.com", category: "Lead Sources", description: "Pull listing inquiries directly into Estata.", connected: true, color: "from-rose-500 to-red-600" },
  { name: "MLS Grid", category: "MLS", description: "Real-time MLS data feed for your region.", connected: false, color: "from-emerald-500 to-teal-600" },
  { name: "Google Calendar", category: "Productivity", description: "Two-way sync of showings and meetings.", connected: true, color: "from-blue-500 to-indigo-600" },
  { name: "Outlook", category: "Productivity", description: "Sync mail and calendar with Microsoft 365.", connected: false, color: "from-blue-600 to-cyan-600" },
  { name: "DocuSign", category: "Documents", description: "Send and track contracts for e-signature.", connected: true, color: "from-amber-500 to-yellow-600" },
  { name: "Mailchimp", category: "Marketing", description: "Send drip campaigns to lead segments.", connected: false, color: "from-yellow-500 to-orange-600" },
  { name: "Slack", category: "Communication", description: "Get deal notifications in your team channels.", connected: false, color: "from-purple-500 to-fuchsia-600" },
  { name: "Twilio", category: "Communication", description: "SMS and call tracking from inside leads.", connected: true, color: "from-red-500 to-rose-600" },
];

const seedListings = [
  { address: "318 Spruce Ln", city: "San Francisco", state: "CA", price: 850000, beds: 3, baths: 2, sqft: 1820, status: "Active" },
  { address: "55 Hilltop Ave", city: "Palo Alto", state: "CA", price: 1750000, beds: 4, baths: 3.5, sqft: 3200, status: "Pending" },
  { address: "201 River Pl, #5A", city: "Miami", state: "FL", price: 1200000, beds: 2, baths: 2, sqft: 1430, status: "Active" },
  { address: "1242 Bay St", city: "Seattle", state: "WA", price: 690000, beds: 4, baths: 2, sqft: 2100, status: "Sold" },
  { address: "88 Lake St, #14", city: "Chicago", state: "IL", price: 420000, beds: 1, baths: 1, sqft: 720, status: "Active" },
  { address: "97 Cedar Trail", city: "Austin", state: "TX", price: 905000, beds: 3, baths: 2.5, sqft: 2300, status: "Active" },
  { address: "12 Park Ave, #22", city: "New York", state: "NY", price: 1300000, beds: 2, baths: 2, sqft: 1290, status: "Off-market" },
];

const seedLeads = [
  { name: "Hannah Carlton", email: "hannah@example.com", phone: "+1 415-555-0182", source: "Zillow", status: "qualified", budget: 850000, city: "San Francisco" },
  { name: "Aiden Park", email: "aiden.park@mail.com", phone: "+1 312-555-0144", source: "Website", status: "new", budget: 420000, city: "Chicago" },
  { name: "Sofia Marín", email: "sofia.m@inbox.com", phone: "+1 305-555-0107", source: "Referral", status: "contacted", budget: 1200000, city: "Miami" },
  { name: "Ethan Brooks", email: "ebrooks@mail.com", phone: "+1 206-555-0193", source: "Facebook", status: "won", budget: 690000, city: "Seattle" },
  { name: "Priya Natarajan", email: "priya.n@mail.com", phone: "+1 408-555-0119", source: "Website", status: "qualified", budget: 1750000, city: "Palo Alto" },
  { name: "James O'Connor", email: "joconnor@mail.com", phone: "+1 617-555-0177", source: "Instagram", status: "contacted", budget: 540000, city: "Boston" },
  { name: "Yuki Tanaka", email: "yuki.t@mail.com", phone: "+1 213-555-0142", source: "Walk-in", status: "lost", budget: 320000, city: "Los Angeles" },
  { name: "Liam Bennett", email: "liam.b@mail.com", phone: "+1 720-555-0166", source: "Referral", status: "new", budget: 480000, city: "Denver" },
  { name: "Ava Mendoza", email: "ava.m@mail.com", phone: "+1 512-555-0124", source: "Zillow", status: "qualified", budget: 905000, city: "Austin" },
  { name: "Noah Kim", email: "noah.kim@mail.com", phone: "+1 646-555-0148", source: "Website", status: "contacted", budget: 1300000, city: "New York" },
];

const seedDeals = [
  { title: "Bayview Terrace 4BR", client: "Ethan Brooks", property: "1242 Bay St, Seattle WA", amount: 690000, stage: "Closed", closeDate: "2026-04-15" },
  { title: "Sunset Loft Penthouse", client: "Priya Natarajan", property: "55 Hilltop Ave, Palo Alto CA", amount: 1750000, stage: "Negotiation", closeDate: "2026-05-12" },
  { title: "Riverside Condo 2BR", client: "Sofia Marín", property: "201 River Pl, Miami FL", amount: 1200000, stage: "Proposal", closeDate: "2026-05-30" },
  { title: "Downtown Studio", client: "Aiden Park", property: "88 Lake St, Chicago IL", amount: 420000, stage: "Discovery", closeDate: "2026-06-04" },
  { title: "Hilltop Family Home", client: "Hannah Carlton", property: "318 Spruce Ln, San Francisco CA", amount: 850000, stage: "Contract", closeDate: "2026-05-08" },
  { title: "Lakeside 3BR", client: "Ava Mendoza", property: "97 Cedar Trail, Austin TX", amount: 905000, stage: "Negotiation", closeDate: "2026-05-22" },
  { title: "Manhattan Mid-rise", client: "Noah Kim", property: "12 Park Ave, New York NY", amount: 1300000, stage: "Discovery", closeDate: "2026-06-15" },
];

const seedContacts = [
  { name: "Robert Chen", role: "Mortgage Broker", company: "First Western Lending", email: "rchen@fwl.com", phone: "+1 212-555-0182", city: "New York" },
  { name: "Linda Velez", role: "Title Officer", company: "Pacific Title Co.", email: "lvelez@pactitle.com", phone: "+1 415-555-0144", city: "San Francisco" },
  { name: "Marcus Tan", role: "Home Inspector", company: "BlueDoor Inspections", email: "marcus@bluedoor.io", phone: "+1 305-555-0107", city: "Miami" },
  { name: "Aisha Rahman", role: "Photographer", company: "Frame Studios", email: "aisha@framestudios.com", phone: "+1 720-555-0193", city: "Denver" },
  { name: "Tom Whitman", role: "General Contractor", company: "Whitman Build Co.", email: "tom@whitmanbuild.com", phone: "+1 206-555-0119", city: "Seattle" },
];

const seedTasks = [
  { title: "Send proposal to Sofia Marín", due: "2026-05-08", priority: "High", status: "In progress" },
  { title: "Schedule home inspection — Spruce Ln", due: "2026-05-09", priority: "Medium", status: "To do" },
  { title: "Follow up with Aiden Park", due: "2026-05-10", priority: "Medium", status: "To do" },
  { title: "Prep listing photos — Cedar Trail", due: "2026-05-11", priority: "Low", status: "To do" },
  { title: "Counter-offer review with Hannah", due: "2026-05-08", priority: "High", status: "Done" },
];

const seedCampaigns = [
  { name: "Spring Open House Push", type: "Email", status: "Active", sent: 1240, opened: 412, clicked: 98, sentDate: "2026-04-22" },
  { name: "Hilltop Listing Reveal", type: "Email + SMS", status: "Active", sent: 880, opened: 350, clicked: 142, sentDate: "2026-04-25" },
  { name: "Buyer Newsletter — May", type: "Email", status: "Scheduled", sent: 0, opened: 0, clicked: 0, sentDate: "2026-05-05" },
  { name: "Cedar Trail Drip", type: "Email", status: "Paused", sent: 540, opened: 122, clicked: 38, sentDate: "2026-04-12" },
];

const seedAutomations = [
  { name: "New Zillow lead → SMS welcome", trigger: "Zillow", action: "Send SMS", active: true, runs: 412 },
  { name: "Lead inactive 7d → Re-engage email", trigger: "Inactivity", action: "Send email", active: true, runs: 128 },
  { name: "Deal moved to Contract → Notify team", trigger: "Stage change", action: "Slack message", active: true, runs: 38 },
  { name: "Listing price drop → Notify saved leads", trigger: "Price update", action: "Send email", active: false, runs: 0 },
];

const seedTags = [
  { name: "Hot", color: "bg-destructive/15 text-destructive" },
  { name: "VIP", color: "bg-warning/20 text-warning-foreground" },
  { name: "Investor", color: "bg-primary/15 text-primary" },
  { name: "First-time buyer", color: "bg-success/15 text-success" },
  { name: "Relocator", color: "bg-[var(--color-chart-4)]/15 text-[var(--color-chart-4)]" },
];

const initialMicrositeConfig = {
  domain: "estata-demo",
  tagline: "Real Estate · Top Markets",
  heroHeadline: "Find your dream home",
  heroSubheadline: "Curated listings and personalized guidance from search to closing.",
  heroCtaPrimary: "Browse listings",
  heroCtaSecondary: "Contact us",
  heroBackgroundStyle: "gradient-primary",
  about: "A boutique real-estate brokerage helping families find their perfect home.",
  contactEmail: "hello@example.com",
  contactPhone: "+1 415-555-0100",
  contactAddress: "—",
  testimonials: [
    { id: "TS-1", author: "Hannah Carlton", role: "Bought a home", body: "Made our first home purchase feel effortless.", rating: 5 },
    { id: "TS-2", author: "Ethan Brooks", role: "Sold a home", body: "Sold above asking in 9 days.", rating: 5 },
  ],
  featuredListingIds: [],
  sections: { hero: true, listings: true, about: true, testimonials: true, contact: true, stats: false },
  theme: { primary: "#0d9488", accent: "#fbbf24" },
  pageViews: 0,
  clicks: 0,
  formSubmissions: 0,
  published: true,
  lastPublishedAt: Date.now(),
};

export async function seedOrganization(orgId: string, userId: string, agentName: string) {
  const today = new Date().toISOString().split("T")[0];

  // Listings
  const listingIds: string[] = [];
  for (const l of seedListings) {
    const id = newId("MLS");
    listingIds.push(id);
    await db.insert(t.listings).values({ id, organizationId: orgId, agentName, ...l });
  }

  // Leads
  const leadIds: string[] = [];
  for (const l of seedLeads) {
    const id = newId("L");
    leadIds.push(id);
    await db.insert(t.leads).values({
      id, organizationId: orgId, agentId: userId, agentName,
      ...l, createdAt: new Date(today),
    });
  }

  // Deals
  for (const d of seedDeals) {
    await db.insert(t.deals).values({
      id: newId("D"), organizationId: orgId, agentName, ...d,
    });
  }

  // Contacts
  for (const c of seedContacts) {
    await db.insert(t.contacts).values({ id: newId("C"), organizationId: orgId, ...c });
  }

  // Tasks
  for (const tk of seedTasks) {
    await db.insert(t.tasks).values({
      id: newId("T"), organizationId: orgId, assigneeName: agentName, ...tk,
    });
  }

  // Campaigns
  for (const c of seedCampaigns) {
    await db.insert(t.campaigns).values({ id: newId("C"), organizationId: orgId, ...c });
  }

  // Automations
  for (const a of seedAutomations) {
    await db.insert(t.automations).values({ id: newId("A"), organizationId: orgId, ...a });
  }

  // Tags
  for (const tag of seedTags) {
    await db.insert(t.tags).values({ id: newId("T"), organizationId: orgId, ...tag });
  }

  // Integrations
  for (const i of integrations) {
    await db.insert(t.integrations).values({ id: newId("INT"), organizationId: orgId, ...i });
  }

  // Sample threads/messages for first 3 leads
  for (let i = 0; i < Math.min(3, leadIds.length); i++) {
    const threadId = newId("TH");
    const lead = seedLeads[i];
    const subject = i === 0 ? `Re: ${seedListings[0].address}` : i === 1 ? "Tour confirmation" : "Offer counter";
    const channel = i === 0 ? "email" : i === 1 ? "sms" : "email";
    const lastAt = Date.now() - 1000 * 60 * 60 * (i + 1);
    await db.insert(t.threads).values({
      id: threadId, organizationId: orgId, leadId: leadIds[i], subject, channel,
      lastMessageAt: new Date(lastAt), unread: i === 1 ? 0 : 1,
    });
    await db.insert(t.messages).values({
      id: newId("M"), organizationId: orgId, threadId, channel,
      direction: "inbound", leadId: leadIds[i],
      fromAddress: lead.email, toAddress: "you",
      subject, body: i === 0 ? "Hi! Could we schedule a tour?" : i === 1 ? "Confirmed for Friday." : "Can we discuss the counter?",
      read: i === 1, createdAt: new Date(lastAt),
    });
  }

  // Activity
  await db.insert(t.activity).values({
    id: newId("AC"), organizationId: orgId, kind: "lead.created",
    actor: agentName, title: "Workspace created", detail: "Welcome to Estata",
  });

  // Microsite config
  await db.insert(t.microsite).values({
    organizationId: orgId,
    config: { ...initialMicrositeConfig, featuredListingIds: listingIds.slice(0, 3) },
  });

  // Subscription
  await db.insert(t.subscriptions).values({
    organizationId: orgId, plan: "Pro", price: 1490, cycle: "monthly",
    seats: 10, status: "active",
    paymentMethod: { brand: "Visa", last4: "4242", expMonth: 9, expYear: 2027 },
  });

  // Invoices
  for (let i = 4; i >= 1; i--) {
    await db.insert(t.invoices).values({
      id: newId("INV"), organizationId: orgId,
      date: `2026-0${i}-01`, amount: 1490, status: "Paid", description: `Pro plan · 2026-0${i}`,
    });
  }
}

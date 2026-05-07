// Seed a demo workspace. Run: `node seed.mjs`
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

const db = new Database("estata.db");
db.pragma("foreign_keys = ON");
const nid = (p) => `${p}-${randomUUID().slice(0, 8)}`;
const now = Date.now();

const existingOrgs = db.prepare("SELECT id FROM organizations WHERE name = ?").all("Bay Realty Group");
for (const { id } of existingOrgs) db.prepare("DELETE FROM organizations WHERE id = ?").run(id);
db.prepare("DELETE FROM users WHERE email = ?").run("tl@tl.com");

const orgId = nid("org");
const userId = nid("usr");
const passwordHash = await bcrypt.hash("12345678", 10);

db.prepare(`INSERT INTO organizations (id, name, city, state, created_at) VALUES (?, ?, ?, ?, ?)`)
  .run(orgId, "Bay Realty Group", "San Francisco", "CA", now);

db.prepare(`INSERT INTO users (id, organization_id, email, password_hash, first_name, last_name, title, license, bio, role, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
  .run(userId, orgId, "tl@tl.com", passwordHash, "Taylor", "Lambert", "Senior Broker", "DRE 02118430",
       "15+ years selling premium homes across the Bay Area.", "owner", now);

const agentName = "Taylor Lambert";

const listings = [
  { address: "318 Spruce Ln", city: "San Francisco", state: "CA", price: 850000, beds: 3, baths: 2, sqft: 1820, status: "Active" },
  { address: "55 Hilltop Ave", city: "Palo Alto", state: "CA", price: 1750000, beds: 4, baths: 3.5, sqft: 3200, status: "Pending" },
  { address: "201 River Pl, #5A", city: "Miami", state: "FL", price: 1200000, beds: 2, baths: 2, sqft: 1430, status: "Active" },
  { address: "1242 Bay St", city: "Seattle", state: "WA", price: 690000, beds: 4, baths: 2, sqft: 2100, status: "Sold" },
  { address: "88 Lake St, #14", city: "Chicago", state: "IL", price: 420000, beds: 1, baths: 1, sqft: 720, status: "Active" },
  { address: "97 Cedar Trail", city: "Austin", state: "TX", price: 905000, beds: 3, baths: 2.5, sqft: 2300, status: "Active" },
  { address: "12 Park Ave, #22", city: "New York", state: "NY", price: 1300000, beds: 2, baths: 2, sqft: 1290, status: "Off-market" },
];
const listingIds = [];
for (const l of listings) {
  const id = nid("MLS");
  listingIds.push(id);
  db.prepare(`INSERT INTO listings (id, organization_id, address, city, state, price, beds, baths, sqft, status, agent_name, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(id, orgId, l.address, l.city, l.state, l.price, l.beds, l.baths, l.sqft, l.status, agentName, now);
}

const leads = [
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
const leadIds = [];
for (const l of leads) {
  const id = nid("L");
  leadIds.push(id);
  db.prepare(`INSERT INTO leads (id, organization_id, name, email, phone, source, status, budget, city, agent_id, agent_name, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(id, orgId, l.name, l.email, l.phone, l.source, l.status, l.budget, l.city, userId, agentName, now);
}

const deals = [
  { title: "Bayview Terrace 4BR", client: "Ethan Brooks", property: "1242 Bay St, Seattle WA", amount: 690000, stage: "Closed", closeDate: "2026-04-15" },
  { title: "Sunset Loft Penthouse", client: "Priya Natarajan", property: "55 Hilltop Ave, Palo Alto CA", amount: 1750000, stage: "Negotiation", closeDate: "2026-05-12" },
  { title: "Riverside Condo 2BR", client: "Sofia Marín", property: "201 River Pl, Miami FL", amount: 1200000, stage: "Proposal", closeDate: "2026-05-30" },
  { title: "Downtown Studio", client: "Aiden Park", property: "88 Lake St, Chicago IL", amount: 420000, stage: "Discovery", closeDate: "2026-06-04" },
  { title: "Hilltop Family Home", client: "Hannah Carlton", property: "318 Spruce Ln, San Francisco CA", amount: 850000, stage: "Contract", closeDate: "2026-05-08" },
  { title: "Lakeside 3BR", client: "Ava Mendoza", property: "97 Cedar Trail, Austin TX", amount: 905000, stage: "Negotiation", closeDate: "2026-05-22" },
];
for (const d of deals) {
  db.prepare(`INSERT INTO deals (id, organization_id, title, client, property, amount, stage, close_date, agent_name, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(nid("D"), orgId, d.title, d.client, d.property, d.amount, d.stage, d.closeDate, agentName, now);
}

const contacts = [
  { name: "Robert Chen", role: "Mortgage Broker", company: "First Western Lending", email: "rchen@fwl.com", phone: "+1 212-555-0182", city: "New York" },
  { name: "Linda Velez", role: "Title Officer", company: "Pacific Title Co.", email: "lvelez@pactitle.com", phone: "+1 415-555-0144", city: "San Francisco" },
  { name: "Marcus Tan", role: "Home Inspector", company: "BlueDoor Inspections", email: "marcus@bluedoor.io", phone: "+1 305-555-0107", city: "Miami" },
];
for (const c of contacts) {
  db.prepare(`INSERT INTO contacts (id, organization_id, name, role, company, email, phone, city, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(nid("C"), orgId, c.name, c.role, c.company, c.email, c.phone, c.city, now);
}

const tasks = [
  { title: "Send proposal to Sofia Marín", due: "2026-05-08", priority: "High", status: "In progress" },
  { title: "Schedule home inspection — Spruce Ln", due: "2026-05-09", priority: "Medium", status: "To do" },
  { title: "Follow up with Aiden Park", due: "2026-05-10", priority: "Medium", status: "To do" },
  { title: "Counter-offer review with Hannah", due: "2026-05-08", priority: "High", status: "Done" },
];
for (const t of tasks) {
  db.prepare(`INSERT INTO tasks (id, organization_id, title, due, priority, assignee_name, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(nid("T"), orgId, t.title, t.due, t.priority, agentName, t.status, now);
}

const campaigns = [
  { name: "Spring Open House Push", type: "Email", status: "Active", sent: 1240, opened: 412, clicked: 98, sentDate: "2026-04-22" },
  { name: "Hilltop Listing Reveal", type: "Email + SMS", status: "Active", sent: 880, opened: 350, clicked: 142, sentDate: "2026-04-25" },
  { name: "Buyer Newsletter — May", type: "Email", status: "Scheduled", sent: 0, opened: 0, clicked: 0, sentDate: "2026-05-05" },
];
for (const c of campaigns) {
  db.prepare(`INSERT INTO campaigns (id, organization_id, name, type, status, sent, opened, clicked, sent_date, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(nid("CMP"), orgId, c.name, c.type, c.status, c.sent, c.opened, c.clicked, c.sentDate, now);
}

const automations = [
  { name: "New Zillow lead → SMS welcome", trigger: "Zillow", action: "Send SMS", active: 1, runs: 412 },
  { name: "Lead inactive 7d → Re-engage email", trigger: "Inactivity", action: "Send email", active: 1, runs: 128 },
];
for (const a of automations) {
  db.prepare(`INSERT INTO automations (id, organization_id, name, trigger, action, active, runs, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(nid("AUT"), orgId, a.name, a.trigger, a.action, a.active, a.runs, now);
}

const tags = [
  { name: "Hot", color: "bg-destructive/15 text-destructive" },
  { name: "VIP", color: "bg-warning/20 text-warning-foreground" },
  { name: "Investor", color: "bg-primary/15 text-primary" },
];
for (const t of tags) db.prepare(`INSERT INTO tags (id, organization_id, name, color) VALUES (?, ?, ?, ?)`).run(nid("TAG"), orgId, t.name, t.color);

const integrations = [
  { name: "Zillow", category: "Lead Sources", description: "Sync leads from Zillow.", connected: 1, color: "from-sky-500 to-blue-600" },
  { name: "Realtor.com", category: "Lead Sources", description: "Pull listing inquiries.", connected: 1, color: "from-rose-500 to-red-600" },
  { name: "MLS Grid", category: "MLS", description: "Real-time MLS data feed.", connected: 0, color: "from-emerald-500 to-teal-600" },
  { name: "Google Calendar", category: "Productivity", description: "Two-way sync.", connected: 1, color: "from-blue-500 to-indigo-600" },
  { name: "DocuSign", category: "Documents", description: "Send and track contracts.", connected: 1, color: "from-amber-500 to-yellow-600" },
  { name: "Slack", category: "Communication", description: "Team notifications.", connected: 0, color: "from-purple-500 to-fuchsia-600" },
];
for (const i of integrations) {
  db.prepare(`INSERT INTO integrations (id, organization_id, name, category, description, connected, color) VALUES (?, ?, ?, ?, ?, ?, ?)`)
    .run(nid("INT"), orgId, i.name, i.category, i.description, i.connected, i.color);
}

for (let i = 0; i < 3; i++) {
  const tid = nid("TH");
  const subject = ["Re: 318 Spruce Ln", "Tour confirmation", "Offer counter"][i];
  const channel = ["email", "sms", "email"][i];
  const at = now - 1000 * 60 * 60 * (i + 1);
  db.prepare(`INSERT INTO threads (id, organization_id, lead_id, subject, channel, last_message_at, unread) VALUES (?, ?, ?, ?, ?, ?, ?)`)
    .run(tid, orgId, leadIds[i], subject, channel, at, i === 1 ? 0 : 1);
  db.prepare(`INSERT INTO messages (id, organization_id, thread_id, channel, direction, lead_id, from_address, to_address, subject, body, read, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(nid("M"), orgId, tid, channel, "inbound", leadIds[i],
      leads[i].email, "you", subject,
      ["Hi! Could we schedule a tour?", "Confirmed for Friday.", "Can we discuss the counter?"][i],
      i === 1 ? 1 : 0, at);
}

db.prepare(`INSERT INTO activity (id, organization_id, kind, actor, title, detail, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`)
  .run(nid("AC"), orgId, "lead.created", agentName, "Workspace ready", "Welcome to Estata", now);

db.prepare(`INSERT INTO microsite (organization_id, config, updated_at) VALUES (?, ?, ?)`).run(orgId, JSON.stringify({
  domain: "bay-realty",
  tagline: "Real Estate · San Francisco Bay Area",
  heroHeadline: "Find your dream home in the Bay Area",
  heroSubheadline: "Curated listings from top agents.",
  heroCtaPrimary: "Browse listings",
  heroCtaSecondary: "Contact us",
  heroBackgroundStyle: "gradient-primary",
  about: "Bay Realty Group is a boutique real-estate brokerage with 15+ years experience.",
  contactEmail: "hello@bay-realty.com",
  contactPhone: "+1 415-555-0100",
  contactAddress: "450 Mission St #800, San Francisco, CA 94105",
  testimonials: [
    { id: "TS-1", author: "Hannah Carlton", role: "Bought a home", body: "Made our first home purchase feel effortless.", rating: 5 },
    { id: "TS-2", author: "Ethan Brooks", role: "Sold a home", body: "Sold above asking in 9 days.", rating: 5 },
  ],
  featuredListingIds: listingIds.slice(0, 3),
  sections: { hero: true, listings: true, about: true, testimonials: true, contact: true, stats: false },
  theme: { primary: "#0d9488", accent: "#fbbf24" },
  pageViews: 12418, clicks: 2103, formSubmissions: 184,
  published: true, lastPublishedAt: now,
}), now);

db.prepare(`INSERT INTO subscriptions (organization_id, plan, price, cycle, seats, status, payment_method) VALUES (?, ?, ?, ?, ?, ?, ?)`)
  .run(orgId, "Pro", 1490, "monthly", 10, "active",
       JSON.stringify({ brand: "Visa", last4: "4242", expMonth: 9, expYear: 2027 }));

for (let i = 4; i >= 1; i--) {
  db.prepare(`INSERT INTO invoices (id, organization_id, date, amount, status, description) VALUES (?, ?, ?, ?, ?, ?)`)
    .run(nid("INV"), orgId, `2026-0${i}-01`, 1490, "Paid", `Pro plan · 2026-0${i}`);
}

console.log("✓ Seeded demo workspace");
console.log("  Email: tl@tl.com");
console.log("  Password: 12345678");

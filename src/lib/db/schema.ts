import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

const id = () => text("id").primaryKey();
const ts = (name: string) => integer(name, { mode: "timestamp_ms" });

// === Auth & Tenancy ===
export const organizations = sqliteTable("organizations", {
  id: id(),
  name: text("name").notNull(),
  dba: text("dba"),
  license: text("license"),
  ein: text("ein"),
  website: text("website"),
  phone: text("phone"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zip: text("zip"),
  createdAt: ts("created_at").notNull().default(sql`(unixepoch() * 1000)`),
});

export const users = sqliteTable("users", {
  id: id(),
  organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text("phone"),
  title: text("title"),
  license: text("license"),
  bio: text("bio"),
  role: text("role", { enum: ["owner", "admin", "manager", "agent"] }).notNull().default("agent"),
  createdAt: ts("created_at").notNull().default(sql`(unixepoch() * 1000)`),
});

export const sessions = sqliteTable("sessions", {
  id: id(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expiresAt: ts("expires_at").notNull(),
  createdAt: ts("created_at").notNull().default(sql`(unixepoch() * 1000)`),
});

// === Core CRM ===
export const leads = sqliteTable("leads", {
  id: id(),
  organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  source: text("source").notNull(),
  status: text("status").notNull().default("new"),
  budget: integer("budget").notNull().default(0),
  city: text("city"),
  agentId: text("agent_id").references(() => users.id),
  agentName: text("agent_name"),
  createdAt: ts("created_at").notNull().default(sql`(unixepoch() * 1000)`),
});

export const deals = sqliteTable("deals", {
  id: id(),
  organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  client: text("client").notNull(),
  property: text("property"),
  amount: integer("amount").notNull().default(0),
  stage: text("stage").notNull().default("Discovery"),
  closeDate: text("close_date"),
  agentName: text("agent_name"),
  createdAt: ts("created_at").notNull().default(sql`(unixepoch() * 1000)`),
});

export const listings = sqliteTable("listings", {
  id: id(),
  organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state"),
  price: integer("price").notNull().default(0),
  beds: integer("beds").notNull().default(0),
  baths: real("baths").notNull().default(0),
  sqft: integer("sqft").notNull().default(0),
  status: text("status").notNull().default("Active"),
  agentName: text("agent_name"),
  createdAt: ts("created_at").notNull().default(sql`(unixepoch() * 1000)`),
});

export const contacts = sqliteTable("contacts", {
  id: id(),
  organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  role: text("role"),
  company: text("company"),
  email: text("email"),
  phone: text("phone"),
  city: text("city"),
  createdAt: ts("created_at").notNull().default(sql`(unixepoch() * 1000)`),
});

export const tasks = sqliteTable("tasks", {
  id: id(),
  organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  due: text("due"),
  priority: text("priority").notNull().default("Medium"),
  assigneeName: text("assignee_name"),
  status: text("status").notNull().default("To do"),
  related: text("related"),
  createdAt: ts("created_at").notNull().default(sql`(unixepoch() * 1000)`),
});

// === Operations ===
export const showings = sqliteTable("showings", {
  id: id(),
  organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  listingId: text("listing_id").notNull().references(() => listings.id, { onDelete: "cascade" }),
  leadId: text("lead_id").notNull().references(() => leads.id, { onDelete: "cascade" }),
  date: text("date").notNull(),
  time: text("time").notNull(),
  agentName: text("agent_name"),
  status: text("status").notNull().default("Scheduled"),
  feedback: text("feedback", { mode: "json" }),
  createdAt: ts("created_at").notNull().default(sql`(unixepoch() * 1000)`),
});

export const openHouses = sqliteTable("open_houses", {
  id: id(),
  organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  listingId: text("listing_id").notNull().references(() => listings.id, { onDelete: "cascade" }),
  date: text("date").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  agentName: text("agent_name"),
  status: text("status").notNull().default("Upcoming"),
  attendees: text("attendees", { mode: "json" }).notNull().default(sql`'[]'`),
  createdAt: ts("created_at").notNull().default(sql`(unixepoch() * 1000)`),
});

export const offers = sqliteTable("offers", {
  id: id(),
  organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  listing: text("listing").notNull(),
  buyer: text("buyer").notNull(),
  amount: integer("amount").notNull().default(0),
  status: text("status").notNull().default("Pending"),
  submittedBy: text("submitted_by"),
  date: text("date").notNull(),
  createdAt: ts("created_at").notNull().default(sql`(unixepoch() * 1000)`),
});

export const commissions = sqliteTable("commissions", {
  id: id(),
  organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  dealId: text("deal_id").notNull().references(() => deals.id, { onDelete: "cascade" }),
  amount: integer("amount").notNull(),
  splitPercent: integer("split_percent").notNull(),
  agentName: text("agent_name"),
  brokerage: integer("brokerage").notNull(),
  agentTake: integer("agent_take").notNull(),
  status: text("status").notNull().default("Pending"),
  paidAt: text("paid_at"),
  createdAt: ts("created_at").notNull().default(sql`(unixepoch() * 1000)`),
});

// === Communications ===
export const threads = sqliteTable("threads", {
  id: id(),
  organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  leadId: text("lead_id").references(() => leads.id, { onDelete: "set null" }),
  subject: text("subject").notNull(),
  channel: text("channel").notNull(),
  lastMessageAt: ts("last_message_at").notNull().default(sql`(unixepoch() * 1000)`),
  unread: integer("unread").notNull().default(0),
});

export const messages = sqliteTable("messages", {
  id: id(),
  organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  threadId: text("thread_id").notNull().references(() => threads.id, { onDelete: "cascade" }),
  channel: text("channel").notNull(),
  direction: text("direction").notNull(),
  leadId: text("lead_id").references(() => leads.id, { onDelete: "set null" }),
  fromAddress: text("from_address").notNull(),
  toAddress: text("to_address").notNull(),
  subject: text("subject"),
  body: text("body").notNull(),
  callDuration: integer("call_duration"),
  read: integer("read", { mode: "boolean" }).notNull().default(false),
  createdAt: ts("created_at").notNull().default(sql`(unixepoch() * 1000)`),
});

// === Documents ===
export const documents = sqliteTable("documents", {
  id: id(),
  organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  type: text("type").notNull(),
  size: integer("size").notNull().default(0),
  status: text("status").notNull().default("Draft"),
  signers: text("signers", { mode: "json" }).notNull().default(sql`'[]'`),
  relatedType: text("related_type"),
  relatedId: text("related_id"),
  uploadedBy: text("uploaded_by"),
  createdAt: ts("created_at").notNull().default(sql`(unixepoch() * 1000)`),
});

// === Activity & Comments ===
export const activity = sqliteTable("activity", {
  id: id(),
  organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  kind: text("kind").notNull(),
  actor: text("actor").notNull(),
  title: text("title").notNull(),
  detail: text("detail"),
  entityType: text("entity_type"),
  entityId: text("entity_id"),
  createdAt: ts("created_at").notNull().default(sql`(unixepoch() * 1000)`),
});

export const comments = sqliteTable("comments", {
  id: id(),
  organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  author: text("author").notNull(),
  body: text("body").notNull(),
  mentions: text("mentions", { mode: "json" }).notNull().default(sql`'[]'`),
  createdAt: ts("created_at").notNull().default(sql`(unixepoch() * 1000)`),
});

// === Tags ===
export const tags = sqliteTable("tags", {
  id: id(),
  organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  color: text("color").notNull(),
});

export const leadTags = sqliteTable("lead_tags", {
  id: id(),
  leadId: text("lead_id").notNull().references(() => leads.id, { onDelete: "cascade" }),
  tagId: text("tag_id").notNull().references(() => tags.id, { onDelete: "cascade" }),
});

// === Marketing ===
export const campaigns = sqliteTable("campaigns", {
  id: id(),
  organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  type: text("type").notNull(),
  status: text("status").notNull().default("Draft"),
  sent: integer("sent").notNull().default(0),
  opened: integer("opened").notNull().default(0),
  clicked: integer("clicked").notNull().default(0),
  sentDate: text("sent_date"),
  createdAt: ts("created_at").notNull().default(sql`(unixepoch() * 1000)`),
});

export const automations = sqliteTable("automations", {
  id: id(),
  organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  trigger: text("trigger").notNull(),
  action: text("action").notNull(),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  runs: integer("runs").notNull().default(0),
  createdAt: ts("created_at").notNull().default(sql`(unixepoch() * 1000)`),
});

export const sequences = sqliteTable("sequences", {
  id: id(),
  organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  trigger: text("trigger").notNull(),
  steps: text("steps", { mode: "json" }).notNull().default(sql`'[]'`),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  enrolled: integer("enrolled").notNull().default(0),
  createdAt: ts("created_at").notNull().default(sql`(unixepoch() * 1000)`),
});

export const integrations = sqliteTable("integrations", {
  id: id(),
  organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  category: text("category").notNull(),
  description: text("description"),
  connected: integer("connected", { mode: "boolean" }).notNull().default(false),
  color: text("color"),
});

export const forms = sqliteTable("forms", {
  id: id(),
  organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  source: text("source"),
  fields: text("fields", { mode: "json" }).notNull().default(sql`'[]'`),
  submissions: integer("submissions").notNull().default(0),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: ts("created_at").notNull().default(sql`(unixepoch() * 1000)`),
});

// === Calendar & Misc ===
export const calendarEvents = sqliteTable("calendar_events", {
  id: id(),
  organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  day: integer("day").notNull(),
  time: text("time").notNull(),
  type: text("type").notNull().default("meeting"),
});

export const savedViews = sqliteTable("saved_views", {
  id: id(),
  organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  entity: text("entity").notNull(),
  name: text("name").notNull(),
  filters: text("filters", { mode: "json" }).notNull().default(sql`'{}'`),
  createdAt: ts("created_at").notNull().default(sql`(unixepoch() * 1000)`),
});

export const notifications = sqliteTable("notifications", {
  id: id(),
  organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  body: text("body"),
  read: integer("read", { mode: "boolean" }).notNull().default(false),
  createdAt: ts("created_at").notNull().default(sql`(unixepoch() * 1000)`),
});

// === Microsite & Subscription ===
export const microsite = sqliteTable("microsite", {
  organizationId: text("organization_id").primaryKey().references(() => organizations.id, { onDelete: "cascade" }),
  config: text("config", { mode: "json" }).notNull(),
  updatedAt: ts("updated_at").notNull().default(sql`(unixepoch() * 1000)`),
});

export const subscriptions = sqliteTable("subscriptions", {
  organizationId: text("organization_id").primaryKey().references(() => organizations.id, { onDelete: "cascade" }),
  plan: text("plan").notNull().default("Pro"),
  price: integer("price").notNull().default(1490),
  cycle: text("cycle").notNull().default("monthly"),
  seats: integer("seats").notNull().default(10),
  status: text("status").notNull().default("active"),
  cancelAt: ts("cancel_at"),
  paymentMethod: text("payment_method", { mode: "json" }),
});

export const invoices = sqliteTable("invoices", {
  id: id(),
  organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  date: text("date").notNull(),
  amount: integer("amount").notNull(),
  status: text("status").notNull().default("Paid"),
  description: text("description"),
});

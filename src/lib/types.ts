export type Channel = "email" | "sms" | "call" | "whatsapp";
export type MessageDir = "inbound" | "outbound";

export type Message = {
  id: string;
  threadId: string;
  channel: Channel | string;
  direction: MessageDir | string;
  leadId?: string | null;
  contactId?: string | null;
  fromAddress: string;
  toAddress: string;
  subject?: string | null;
  body: string;
  createdAt: number | Date | string;
  read: boolean;
  starred?: boolean;
  callDuration?: number | null;
};

export type Thread = {
  id: string;
  leadId?: string;
  contactId?: string;
  subject: string;
  channel: Channel;
  lastMessageAt: number;
  unread: number;
};

export type Document = {
  id: string;
  name: string;
  type: "Listing Agreement" | "Purchase Agreement" | "Disclosure" | "Inspection" | "Counter Offer" | "Addendum" | "Other";
  size: number;
  status: "Draft" | "Sent" | "Signed" | "Expired";
  signers: { name: string; email: string; signed: boolean; signedAt?: number }[];
  relatedType?: string | null;
  relatedId?: string | null;
  createdAt: number | Date | string;
  uploadedBy: string | null;
};

export type ActivityKind =
  | "lead.created" | "lead.updated" | "lead.deleted"
  | "deal.created" | "deal.stage" | "deal.deleted"
  | "listing.created" | "listing.deleted"
  | "task.completed" | "task.created"
  | "showing.scheduled" | "showing.completed"
  | "openhouse.scheduled"
  | "document.signed" | "document.sent"
  | "campaign.sent"
  | "automation.run"
  | "comment.added";

export type Activity = {
  id: string;
  kind: ActivityKind;
  actor: string;
  title: string;
  detail?: string;
  entityType?: "lead" | "deal" | "listing" | "task" | "showing" | "openhouse" | "document" | "campaign";
  entityId?: string;
  createdAt: number;
};

export type Tag = {
  id: string;
  name: string;
  color: string;
};

export type CustomField = {
  id: string;
  entity: "lead" | "deal" | "listing" | "contact";
  name: string;
  type: "text" | "number" | "date" | "select";
  options?: string[];
};

export type Showing = {
  id: string;
  listingId: string;
  leadId: string;
  date: string;
  time: string;
  agent: string;
  status: "Scheduled" | "Completed" | "Cancelled" | "No-show";
  notes?: string;
  feedback?: { interested: boolean; rating: number; notes: string };
};

export type OpenHouse = {
  id: string;
  listingId: string;
  date: string;
  startTime: string;
  endTime: string;
  agent: string;
  status: "Upcoming" | "Live" | "Done";
  attendees: { name: string; email: string; phone: string; interested: boolean; checkInAt: number }[];
};

export type Commission = {
  id: string;
  dealId: string;
  amount: number;
  splitPercent: number;
  agent: string;
  brokerage: number;
  agentTake: number;
  status: "Pending" | "Paid";
  paidAt?: string;
};

export type LeadForm = {
  id: string;
  name: string;
  fields: { id: string; label: string; type: "text" | "email" | "phone" | "select"; required: boolean; options?: string[] }[];
  source: string;
  submissions: number;
  active: boolean;
  createdAt: number;
};

export type SequenceStep = {
  id: string;
  delayDays: number;
  channel: "email" | "sms";
  subject?: string;
  body: string;
};

export type Sequence = {
  id: string;
  name: string;
  trigger: string;
  steps: SequenceStep[];
  active: boolean;
  enrolled: number;
};

export type Comment = {
  id: string;
  entityType: "lead" | "deal" | "listing";
  entityId: string;
  author: string;
  body: string;
  mentions: string[];
  createdAt: number;
};

export type SavedView = {
  id: string;
  entity: "leads" | "deals" | "listings";
  name: string;
  filters: Record<string, string>;
  createdAt: number;
};

export type Testimonial = {
  id: string;
  author: string;
  role: string;
  body: string;
  rating: number;
};

export type SectionKey = "hero" | "listings" | "about" | "testimonials" | "contact" | "stats";

export type Plan = "Starter" | "Growth" | "Brokerage" | "Enterprise";

export type Subscription = {
  plan: Plan;
  price: number;
  cycle: "monthly" | "yearly";
  seats: number;
  status: "active" | "cancelled" | "past_due";
  cancelAt?: number;
  features: string[];
};

export type PaymentMethod = {
  brand: "Visa" | "Mastercard" | "Amex";
  last4: string;
  expMonth: number;
  expYear: number;
};

export type Invoice = {
  id: string;
  date: string;
  amount: number;
  status: "Paid" | "Pending" | "Failed";
  description: string;
};

export type MicrositeConfig = {
  domain: string;
  tagline: string;
  heroHeadline: string;
  heroSubheadline: string;
  heroCtaPrimary: string;
  heroCtaSecondary: string;
  heroBackgroundStyle: "gradient-primary" | "gradient-warm" | "gradient-cool" | "minimal";
  about: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  testimonials: Testimonial[];
  featuredListingIds: string[];
  sections: Record<SectionKey, boolean>;
  theme: { primary: string; accent: string };
  pageViews: number;
  clicks: number;
  formSubmissions: number;
  published: boolean;
  lastPublishedAt?: number;
};

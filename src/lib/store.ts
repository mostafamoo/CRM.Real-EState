"use client";

import { create } from "zustand";
import * as actions from "@/lib/actions/crm";
import type {
  Activity, ActivityKind, Comment, Commission, Document, Invoice, LeadForm,
  Message, MicrositeConfig, OpenHouse, PaymentMethod, Plan, SavedView,
  Sequence, Showing, Subscription, Tag, Testimonial, Thread,
} from "@/lib/types";

export type Lead = {
  id: string; name: string; email: string; phone: string | null;
  source: string; status: string; budget: number;
  city: string | null; agentName: string | null; createdAt: Date | string | number;
};
export type Deal = {
  id: string; title: string; client: string; property: string | null;
  amount: number; stage: string; closeDate: string | null; agentName: string | null;
};
export type Listing = {
  id: string; address: string; city: string; state: string | null;
  price: number; beds: number; baths: number; sqft: number;
  status: string; agentName: string | null;
};
export type Contact = {
  id: string; name: string; role: string | null; company: string | null;
  email: string | null; phone: string | null; city: string | null;
};
export type Task = {
  id: string; title: string; due: string | null; priority: string;
  assigneeName: string | null; status: string; related: string | null;
};

export type Campaign = {
  id: string; name: string; type: string; status: string;
  sent: number; opened: number; clicked: number; sentDate: string | null;
};

export type Automation = {
  id: string; name: string; trigger: string; action: string;
  active: boolean; runs: number;
};

export type Integration = {
  id: string; name: string; category: string;
  description: string | null; connected: boolean; color: string | null;
};

export type Offer = {
  id: string; listing: string; buyer: string; amount: number;
  status: string; submittedBy: string | null; date: string;
};

export type CalendarEvent = {
  id: string; title: string; day: number; time: string; type: string;
};

export type User = {
  id: string; firstName: string; lastName: string; email: string;
  phone: string | null; title: string | null; license: string | null; bio: string | null;
};

export type Business = {
  id: string; name: string; dba: string | null; license: string | null;
  ein: string | null; website: string | null; phone: string | null;
  address: string | null; city: string | null; state: string | null; zip: string | null;
};

export type Notification = {
  id: string; title: string; body: string | null;
  read: boolean; createdAt: Date | string | number;
};

type CRMState = {
  hydrated: boolean;
  user: User;
  business: Business;
  leads: Lead[];
  deals: Deal[];
  listings: Listing[];
  contacts: Contact[];
  tasks: Task[];
  campaigns: Campaign[];
  automations: Automation[];
  integrations: Integration[];
  offers: Offer[];
  events: CalendarEvent[];
  threads: Thread[];
  messages: Message[];
  documents: Document[];
  activity: Activity[];
  comments: Comment[];
  tags: Tag[];
  leadTags: Record<string, string[]>;
  showings: Showing[];
  openHouses: OpenHouse[];
  commissions: Commission[];
  forms: LeadForm[];
  sequences: Sequence[];
  savedViews: SavedView[];
  notifications: Notification[];
  microsite: MicrositeConfig;
  subscription: Subscription;
  paymentMethod: PaymentMethod;
  invoices: Invoice[];

  hydrate: (data: Partial<CRMState>) => void;
  patch: <K extends keyof CRMState>(key: K, value: CRMState[K]) => void;

  // Mutations (call server actions and update local state)
  addLead: (lead: Omit<Lead, "id" | "createdAt">) => Promise<void>;
  updateLead: (id: string, patch: Partial<Lead>) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
  deleteLeads: (ids: string[]) => Promise<void>;
  importLeads: (rows: Omit<Lead, "id" | "createdAt">[]) => Promise<number>;

  addDeal: (deal: Omit<Deal, "id">) => Promise<void>;
  updateDeal: (id: string, patch: Partial<Deal>) => Promise<void>;
  moveDealStage: (id: string, stage: string) => Promise<void>;
  deleteDeal: (id: string) => Promise<void>;

  addListing: (l: Omit<Listing, "id">) => Promise<void>;
  updateListing: (id: string, patch: Partial<Listing>) => Promise<void>;
  deleteListing: (id: string) => Promise<void>;

  addContact: (c: Omit<Contact, "id">) => Promise<void>;
  updateContact: (id: string, patch: Partial<Contact>) => Promise<void>;
  deleteContact: (id: string) => Promise<void>;

  addTask: (t: Omit<Task, "id">) => Promise<void>;
  updateTask: (id: string, patch: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;

  addCampaign: (c: Omit<Campaign, "id" | "sent" | "opened" | "clicked">) => Promise<void>;
  updateCampaign: (id: string, patch: Partial<Campaign>) => Promise<void>;
  deleteCampaign: (id: string) => Promise<void>;

  addAutomation: (a: Omit<Automation, "id" | "runs">) => Promise<void>;
  toggleAutomation: (id: string) => Promise<void>;
  deleteAutomation: (id: string) => Promise<void>;

  toggleIntegration: (name: string) => Promise<void>;

  addOffer: (o: Omit<Offer, "id" | "date">) => Promise<void>;
  updateOffer: (id: string, patch: Partial<Offer>) => Promise<void>;
  deleteOffer: (id: string) => Promise<void>;

  addEvent: (e: Omit<CalendarEvent, "id">) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;

  updateUser: (patch: Partial<User>) => Promise<void>;
  updateBusiness: (patch: Partial<Business>) => Promise<void>;

  markAllRead: () => Promise<void>;

  sendMessage: (m: { threadId?: string; channel: string; direction: string; leadId?: string; from: string; to: string; subject?: string; body: string; callDuration?: number; }) => Promise<void>;
  markThreadRead: (threadId: string) => Promise<void>;

  addDocument: (d: Omit<Document, "id" | "createdAt">) => Promise<void>;
  signDocument: (docId: string, signerEmail: string) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;

  addTag: (name: string, color: string) => Promise<string>;
  toggleLeadTag: (leadId: string, tagId: string) => Promise<void>;
  deleteTag: (id: string) => Promise<void>;

  addShowing: (s: Omit<Showing, "id">) => Promise<void>;
  updateShowing: (id: string, patch: Partial<Showing>) => Promise<void>;
  deleteShowing: (id: string) => Promise<void>;

  addOpenHouse: (oh: Omit<OpenHouse, "id" | "attendees" | "status">) => Promise<void>;
  registerAttendee: (ohId: string, attendee: { name: string; email: string; phone: string; interested: boolean; }) => Promise<void>;
  deleteOpenHouse: (id: string) => Promise<void>;

  addCommission: (c: Omit<Commission, "id">) => Promise<void>;
  updateCommission: (id: string, patch: Partial<Commission>) => Promise<void>;

  addForm: (f: Omit<LeadForm, "id" | "submissions" | "createdAt">) => Promise<void>;
  updateForm: (id: string, patch: Partial<LeadForm>) => Promise<void>;
  deleteForm: (id: string) => Promise<void>;
  recordSubmission: (formId: string) => Promise<void>;

  addSequence: (s: Omit<Sequence, "id" | "enrolled">) => Promise<void>;
  updateSequence: (id: string, patch: Partial<Sequence>) => Promise<void>;
  toggleSequence: (id: string) => Promise<void>;
  deleteSequence: (id: string) => Promise<void>;

  addComment: (c: Omit<Comment, "id" | "createdAt">) => Promise<void>;

  addSavedView: (v: Omit<SavedView, "id" | "createdAt">) => Promise<void>;
  deleteSavedView: (id: string) => Promise<void>;

  updateMicrosite: (patch: Partial<MicrositeConfig>) => Promise<void>;
  toggleMicrositeSection: (key: keyof MicrositeConfig["sections"]) => Promise<void>;
  toggleFeaturedListing: (listingId: string) => Promise<void>;
  addTestimonial: (t: Omit<Testimonial, "id">) => Promise<void>;
  updateTestimonial: (id: string, patch: Partial<Testimonial>) => Promise<void>;
  deleteTestimonial: (id: string) => Promise<void>;
  publishMicrosite: () => Promise<void>;

  changePlan: (plan: Plan, cycle?: "monthly" | "yearly") => Promise<void>;
  cancelSubscription: () => Promise<void>;
  resumeSubscription: () => Promise<void>;
  updatePaymentMethod: (pm: PaymentMethod) => Promise<void>;

  resetAll: () => void;
};

const emptyMicrosite: MicrositeConfig = {
  domain: "",
  tagline: "",
  heroHeadline: "",
  heroSubheadline: "",
  heroCtaPrimary: "",
  heroCtaSecondary: "",
  heroBackgroundStyle: "gradient-primary",
  about: "",
  contactEmail: "",
  contactPhone: "",
  contactAddress: "",
  testimonials: [],
  featuredListingIds: [],
  sections: { hero: true, listings: true, about: true, testimonials: true, contact: true, stats: false },
  theme: { primary: "#0d9488", accent: "#fbbf24" },
  pageViews: 0,
  clicks: 0,
  formSubmissions: 0,
  published: false,
};

export const PLANS: Record<Plan, { price: number; seats: number; features: string[] }> = {
  Starter: { price: 49, seats: 1, features: ["Up to 250 leads", "Basic email automations", "1 user", "Community support"] },
  Pro: { price: 1490, seats: 10, features: ["Unlimited leads, deals, and listings", "Custom microsite + custom domain", "Up to 10 users", "Email & SMS automations", "Team analytics and reporting", "Priority support"] },
  Enterprise: { price: 4990, seats: 999, features: ["Everything in Pro", "SSO + API access", "Unlimited users", "Dedicated CSM", "Custom contracts and SLAs"] },
};

const initialState: Omit<CRMState, "hydrate" | "patch" | "resetAll" | keyof Mutations> = {
  hydrated: false,
  user: { id: "", firstName: "", lastName: "", email: "", phone: null, title: null, license: null, bio: null },
  business: { id: "", name: "", dba: null, license: null, ein: null, website: null, phone: null, address: null, city: null, state: null, zip: null },
  leads: [], deals: [], listings: [], contacts: [], tasks: [],
  campaigns: [], automations: [], integrations: [], offers: [], events: [],
  threads: [], messages: [], documents: [], activity: [], comments: [],
  tags: [], leadTags: {}, showings: [], openHouses: [], commissions: [],
  forms: [], sequences: [], savedViews: [], notifications: [],
  microsite: emptyMicrosite,
  subscription: { plan: "Pro", price: 1490, cycle: "monthly", seats: 10, status: "active", features: PLANS.Pro.features },
  paymentMethod: { brand: "Visa", last4: "0000", expMonth: 1, expYear: 2030 },
  invoices: [],
};

type Mutations = Omit<CRMState, keyof typeof initialState | "hydrate" | "patch" | "resetAll">;

function nid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export const useCRM = create<CRMState>()((set, get) => ({
  ...initialState,

  hydrate: (data) => set((s) => ({ ...s, ...data, hydrated: true })),
  patch: (key, value) => set({ [key]: value } as Partial<CRMState>),

  // Leads
  addLead: async (lead) => {
    const tempId = nid("L");
    const optimistic: Lead = { ...lead, id: tempId, createdAt: new Date().toISOString() };
    set((s) => ({ leads: [optimistic, ...s.leads] }));
    try {
      await actions.createLead({
        name: lead.name, email: lead.email, phone: lead.phone ?? undefined,
        source: lead.source, status: lead.status, budget: lead.budget,
        city: lead.city ?? undefined, agentName: lead.agentName ?? undefined,
      });
    } catch (e) {
      set((s) => ({ leads: s.leads.filter((l) => l.id !== tempId) }));
      throw e;
    }
  },
  updateLead: async (id, patch) => {
    const prev = get().leads.find((l) => l.id === id);
    set((s) => ({ leads: s.leads.map((l) => (l.id === id ? { ...l, ...patch } : l)) }));
    try {
      await actions.updateLead(id, patch as never);
    } catch (e) {
      if (prev) set((s) => ({ leads: s.leads.map((l) => (l.id === id ? prev : l)) }));
      throw e;
    }
  },
  deleteLead: async (id) => {
    const prev = get().leads;
    set((s) => ({ leads: s.leads.filter((l) => l.id !== id) }));
    try { await actions.deleteLead(id); } catch (e) { set({ leads: prev }); throw e; }
  },
  deleteLeads: async (ids) => {
    const prev = get().leads;
    set((s) => ({ leads: s.leads.filter((l) => !ids.includes(l.id)) }));
    try { await actions.deleteLeadsBulk(ids); } catch (e) { set({ leads: prev }); throw e; }
  },
  importLeads: async (rows) => {
    const count = await actions.importLeads(rows.map((r) => ({
      name: r.name, email: r.email, phone: r.phone ?? undefined,
      source: r.source, status: r.status, budget: r.budget,
      city: r.city ?? undefined, agentName: r.agentName ?? undefined,
    })));
    return count;
  },

  // Deals
  addDeal: async (d) => {
    const id = nid("D");
    const opt: Deal = { ...d, id };
    set((s) => ({ deals: [opt, ...s.deals] }));
    try { await actions.createDeal(d as never); } catch (e) { set((s) => ({ deals: s.deals.filter((x) => x.id !== id) })); throw e; }
  },
  updateDeal: async (id, patch) => {
    const prev = get().deals.find((d) => d.id === id);
    set((s) => ({ deals: s.deals.map((d) => (d.id === id ? { ...d, ...patch } : d)) }));
    try { await actions.updateDeal(id, patch as never); } catch (e) { if (prev) set((s) => ({ deals: s.deals.map((d) => (d.id === id ? prev : d)) })); throw e; }
  },
  moveDealStage: async (id, stage) => {
    const prev = get().deals.find((d) => d.id === id);
    set((s) => ({ deals: s.deals.map((d) => (d.id === id ? { ...d, stage } : d)) }));
    try { await actions.moveDealStage(id, stage); } catch (e) { if (prev) set((s) => ({ deals: s.deals.map((d) => (d.id === id ? prev : d)) })); throw e; }
  },
  deleteDeal: async (id) => {
    const prev = get().deals;
    set((s) => ({ deals: s.deals.filter((d) => d.id !== id) }));
    try { await actions.deleteDeal(id); } catch (e) { set({ deals: prev }); throw e; }
  },

  // Listings
  addListing: async (l) => {
    const id = nid("MLS");
    set((s) => ({ listings: [{ ...l, id }, ...s.listings] }));
    try { await actions.createListing(l as never); } catch (e) { set((s) => ({ listings: s.listings.filter((x) => x.id !== id) })); throw e; }
  },
  updateListing: async (id, patch) => {
    set((s) => ({ listings: s.listings.map((l) => (l.id === id ? { ...l, ...patch } : l)) }));
    await actions.updateListing(id, patch as never);
  },
  deleteListing: async (id) => {
    const prev = get().listings;
    set((s) => ({ listings: s.listings.filter((l) => l.id !== id) }));
    try { await actions.deleteListing(id); } catch (e) { set({ listings: prev }); throw e; }
  },

  // Contacts
  addContact: async (c) => {
    const id = nid("C");
    set((s) => ({ contacts: [{ ...c, id }, ...s.contacts] }));
    try { await actions.createContact(c as never); } catch (e) { set((s) => ({ contacts: s.contacts.filter((x) => x.id !== id) })); throw e; }
  },
  updateContact: async (id, patch) => {
    set((s) => ({ contacts: s.contacts.map((c) => (c.id === id ? { ...c, ...patch } : c)) }));
    await actions.updateContact(id, patch as never);
  },
  deleteContact: async (id) => {
    const prev = get().contacts;
    set((s) => ({ contacts: s.contacts.filter((c) => c.id !== id) }));
    try { await actions.deleteContact(id); } catch (e) { set({ contacts: prev }); throw e; }
  },

  // Tasks
  addTask: async (t) => {
    const id = nid("T");
    set((s) => ({ tasks: [{ ...t, id }, ...s.tasks] }));
    try { await actions.createTask(t as never); } catch (e) { set((s) => ({ tasks: s.tasks.filter((x) => x.id !== id) })); throw e; }
  },
  updateTask: async (id, patch) => {
    set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) }));
    await actions.updateTask(id, patch as never);
  },
  deleteTask: async (id) => {
    const prev = get().tasks;
    set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }));
    try { await actions.deleteTask(id); } catch (e) { set({ tasks: prev }); throw e; }
  },
  toggleTask: async (id) => {
    set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, status: t.status === "Done" ? "To do" : "Done" } : t)) }));
    await actions.toggleTask(id);
  },

  // Campaigns
  addCampaign: async (c) => {
    const id = nid("CMP");
    set((s) => ({ campaigns: [{ ...c, id, sent: 0, opened: 0, clicked: 0 }, ...s.campaigns] }));
    try { await actions.createCampaign(c as never); } catch (e) { set((s) => ({ campaigns: s.campaigns.filter((x) => x.id !== id) })); throw e; }
  },
  updateCampaign: async (id, patch) => {
    set((s) => ({ campaigns: s.campaigns.map((c) => (c.id === id ? { ...c, ...patch } : c)) }));
    await actions.updateCampaign(id, patch as never);
  },
  deleteCampaign: async (id) => {
    const prev = get().campaigns;
    set((s) => ({ campaigns: s.campaigns.filter((c) => c.id !== id) }));
    try { await actions.deleteCampaign(id); } catch (e) { set({ campaigns: prev }); throw e; }
  },

  // Automations
  addAutomation: async (a) => {
    const id = nid("AUT");
    set((s) => ({ automations: [{ ...a, id, runs: 0 }, ...s.automations] }));
    try { await actions.createAutomation(a as never); } catch (e) { set((s) => ({ automations: s.automations.filter((x) => x.id !== id) })); throw e; }
  },
  toggleAutomation: async (id) => {
    set((s) => ({ automations: s.automations.map((a) => (a.id === id ? { ...a, active: !a.active } : a)) }));
    await actions.toggleAutomation(id);
  },
  deleteAutomation: async (id) => {
    const prev = get().automations;
    set((s) => ({ automations: s.automations.filter((a) => a.id !== id) }));
    try { await actions.deleteAutomation(id); } catch (e) { set({ automations: prev }); throw e; }
  },

  toggleIntegration: async (name) => {
    set((s) => ({ integrations: s.integrations.map((i) => (i.name === name ? { ...i, connected: !i.connected } : i)) }));
    await actions.toggleIntegration(name);
  },

  // Offers
  addOffer: async (o) => {
    const id = nid("OFR");
    const date = new Date().toISOString().split("T")[0];
    set((s) => ({ offers: [{ ...o, id, date }, ...s.offers] }));
    try { await actions.createOffer(o as never); } catch (e) { set((s) => ({ offers: s.offers.filter((x) => x.id !== id) })); throw e; }
  },
  updateOffer: async (id, patch) => {
    set((s) => ({ offers: s.offers.map((o) => (o.id === id ? { ...o, ...patch } : o)) }));
    await actions.updateOffer(id, patch as never);
  },
  deleteOffer: async (id) => {
    const prev = get().offers;
    set((s) => ({ offers: s.offers.filter((o) => o.id !== id) }));
    try { await actions.deleteOffer(id); } catch (e) { set({ offers: prev }); throw e; }
  },

  // Events
  addEvent: async (e) => {
    const id = nid("EV");
    set((s) => ({ events: [{ ...e, id }, ...s.events] }));
    try { await actions.createEvent(e as never); } catch (err) { set((s) => ({ events: s.events.filter((x) => x.id !== id) })); throw err; }
  },
  deleteEvent: async (id) => {
    const prev = get().events;
    set((s) => ({ events: s.events.filter((e) => e.id !== id) }));
    try { await actions.deleteEvent(id); } catch (e) { set({ events: prev }); throw e; }
  },

  // User / Business
  updateUser: async (patch) => {
    set((s) => ({ user: { ...s.user, ...patch } }));
    await actions.updateUserProfile(patch as never);
  },
  updateBusiness: async (patch) => {
    set((s) => ({ business: { ...s.business, ...patch } }));
    await actions.updateBusiness(patch as never);
  },

  markAllRead: async () => {
    set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) }));
    await actions.markNotificationsRead();
  },

  // Messages
  sendMessage: async (m) => {
    const tempId = nid("M");
    const threadId = m.threadId ?? nid("TH");
    const msg: Message = {
      id: tempId, threadId, channel: m.channel,
      direction: m.direction,
      leadId: m.leadId, fromAddress: m.from, toAddress: m.to,
      subject: m.subject, body: m.body, callDuration: m.callDuration ?? null,
      createdAt: Date.now(), read: m.direction === "outbound",
    };
    set((s) => ({ messages: [...s.messages, msg] }));
    await actions.sendMessage(m);
  },
  markThreadRead: async (threadId) => {
    set((s) => ({
      threads: s.threads.map((t) => t.id === threadId ? { ...t, unread: 0 } : t),
      messages: s.messages.map((m) => m.threadId === threadId ? { ...m, read: true } : m),
    }));
    await actions.markThreadRead(threadId);
  },

  // Documents
  addDocument: async (d) => {
    const id = nid("DOC");
    set((s) => ({ documents: [{ ...d, id, createdAt: Date.now() }, ...s.documents] }));
    try { await actions.createDocument(d as never); } catch (e) { set((s) => ({ documents: s.documents.filter((x) => x.id !== id) })); throw e; }
  },
  signDocument: async (docId, signerEmail) => {
    set((s) => ({
      documents: s.documents.map((d) => {
        if (d.id !== docId) return d;
        const signers = d.signers.map((sg) => sg.email === signerEmail ? { ...sg, signed: true, signedAt: Date.now() } : sg);
        const allSigned = signers.every((sg) => sg.signed);
        return { ...d, signers, status: allSigned ? "Signed" : d.status };
      }),
    }));
    await actions.signDocument(docId, signerEmail);
  },
  deleteDocument: async (id) => {
    const prev = get().documents;
    set((s) => ({ documents: s.documents.filter((d) => d.id !== id) }));
    try { await actions.deleteDocument(id); } catch (e) { set({ documents: prev }); throw e; }
  },

  // Tags
  addTag: async (name, color) => {
    const id = await actions.createTag(name, color);
    const tag: Tag = { id, name, color };
    set((s) => ({ tags: [...s.tags, tag] }));
    return id;
  },
  toggleLeadTag: async (leadId, tagId) => {
    set((s) => {
      const cur = s.leadTags[leadId] ?? [];
      const next = cur.includes(tagId) ? cur.filter((t) => t !== tagId) : [...cur, tagId];
      return { leadTags: { ...s.leadTags, [leadId]: next } };
    });
    await actions.toggleLeadTag(leadId, tagId);
  },
  deleteTag: async (id) => {
    set((s) => ({ tags: s.tags.filter((t) => t.id !== id) }));
    await actions.deleteTag(id);
  },

  // Showings
  addShowing: async (sh) => {
    const id = nid("SH");
    set((s) => ({ showings: [{ ...sh, id }, ...s.showings] }));
    try { await actions.createShowing(sh as never); } catch (e) { set((s) => ({ showings: s.showings.filter((x) => x.id !== id) })); throw e; }
  },
  updateShowing: async (id, patch) => {
    set((s) => ({ showings: s.showings.map((sh) => (sh.id === id ? { ...sh, ...patch } : sh)) }));
    await actions.updateShowing(id, patch as never);
  },
  deleteShowing: async (id) => {
    const prev = get().showings;
    set((s) => ({ showings: s.showings.filter((sh) => sh.id !== id) }));
    try { await actions.deleteShowing(id); } catch (e) { set({ showings: prev }); throw e; }
  },

  // Open Houses
  addOpenHouse: async (oh) => {
    const id = nid("OH");
    set((s) => ({ openHouses: [{ ...oh, id, attendees: [], status: "Upcoming" }, ...s.openHouses] }));
    try { await actions.createOpenHouse(oh as never); } catch (e) { set((s) => ({ openHouses: s.openHouses.filter((x) => x.id !== id) })); throw e; }
  },
  registerAttendee: async (ohId, attendee) => {
    set((s) => ({
      openHouses: s.openHouses.map((o) => o.id === ohId
        ? { ...o, attendees: [...o.attendees, { ...attendee, checkInAt: Date.now() }] } : o),
    }));
    await actions.registerOpenHouseAttendee(ohId, attendee);
  },
  deleteOpenHouse: async (id) => {
    const prev = get().openHouses;
    set((s) => ({ openHouses: s.openHouses.filter((o) => o.id !== id) }));
    try { await actions.deleteOpenHouse(id); } catch (e) { set({ openHouses: prev }); throw e; }
  },

  // Commissions
  addCommission: async (c) => {
    const id = nid("CM");
    set((s) => ({ commissions: [{ ...c, id }, ...s.commissions] }));
    try { await actions.createCommission(c as never); } catch (e) { set((s) => ({ commissions: s.commissions.filter((x) => x.id !== id) })); throw e; }
  },
  updateCommission: async (id, patch) => {
    set((s) => ({ commissions: s.commissions.map((c) => (c.id === id ? { ...c, ...patch } : c)) }));
    await actions.updateCommission(id, patch as never);
  },

  // Forms
  addForm: async (f) => {
    const id = nid("F");
    set((s) => ({ forms: [{ ...f, id, submissions: 0, createdAt: Date.now() }, ...s.forms] }));
    try { await actions.createForm(f as never); } catch (e) { set((s) => ({ forms: s.forms.filter((x) => x.id !== id) })); throw e; }
  },
  updateForm: async (id, patch) => {
    set((s) => ({ forms: s.forms.map((f) => (f.id === id ? { ...f, ...patch } : f)) }));
    await actions.updateForm(id, patch as never);
  },
  deleteForm: async (id) => {
    const prev = get().forms;
    set((s) => ({ forms: s.forms.filter((f) => f.id !== id) }));
    try { await actions.deleteForm(id); } catch (e) { set({ forms: prev }); throw e; }
  },
  recordSubmission: async (formId) => {
    set((s) => ({ forms: s.forms.map((f) => (f.id === formId ? { ...f, submissions: f.submissions + 1 } : f)) }));
    await actions.recordFormSubmission(formId);
  },

  // Sequences
  addSequence: async (sq) => {
    const id = nid("SEQ");
    set((s) => ({ sequences: [{ ...sq, id, enrolled: 0 }, ...s.sequences] }));
    try { await actions.createSequence(sq as never); } catch (e) { set((s) => ({ sequences: s.sequences.filter((x) => x.id !== id) })); throw e; }
  },
  updateSequence: async (id, patch) => {
    set((s) => ({ sequences: s.sequences.map((sq) => (sq.id === id ? { ...sq, ...patch } : sq)) }));
    await actions.updateSequence(id, patch as never);
  },
  toggleSequence: async (id) => {
    set((s) => ({ sequences: s.sequences.map((sq) => (sq.id === id ? { ...sq, active: !sq.active } : sq)) }));
    await actions.toggleSequence(id);
  },
  deleteSequence: async (id) => {
    const prev = get().sequences;
    set((s) => ({ sequences: s.sequences.filter((sq) => sq.id !== id) }));
    try { await actions.deleteSequence(id); } catch (e) { set({ sequences: prev }); throw e; }
  },

  // Comments
  addComment: async (c) => {
    const id = nid("CT");
    set((s) => ({ comments: [{ ...c, id, createdAt: Date.now() }, ...s.comments] }));
    await actions.createComment(c as never);
  },

  // Saved Views
  addSavedView: async (v) => {
    const id = nid("SV");
    set((s) => ({ savedViews: [...s.savedViews, { ...v, id, createdAt: Date.now() }] }));
    await actions.createSavedView(v as never);
  },
  deleteSavedView: async (id) => {
    set((s) => ({ savedViews: s.savedViews.filter((v) => v.id !== id) }));
    await actions.deleteSavedView(id);
  },

  // Microsite
  updateMicrosite: async (patch) => {
    set((s) => ({ microsite: { ...s.microsite, ...patch, published: false } }));
    await actions.updateMicrositeConfig(patch as never);
  },
  toggleMicrositeSection: async (key) => {
    const cur = get().microsite.sections;
    const next = { ...cur, [key]: !cur[key] };
    set((s) => ({ microsite: { ...s.microsite, sections: next, published: false } }));
    await actions.updateMicrositeConfig({ sections: next });
  },
  toggleFeaturedListing: async (listingId) => {
    const cur = get().microsite.featuredListingIds;
    const next = cur.includes(listingId) ? cur.filter((id) => id !== listingId) : [...cur, listingId];
    set((s) => ({ microsite: { ...s.microsite, featuredListingIds: next, published: false } }));
    await actions.updateMicrositeConfig({ featuredListingIds: next });
  },
  addTestimonial: async (ts) => {
    const tid = nid("TS");
    const next = [{ ...ts, id: tid }, ...get().microsite.testimonials];
    set((s) => ({ microsite: { ...s.microsite, testimonials: next, published: false } }));
    await actions.updateMicrositeConfig({ testimonials: next });
  },
  updateTestimonial: async (id, patch) => {
    const next = get().microsite.testimonials.map((t) => (t.id === id ? { ...t, ...patch } : t));
    set((s) => ({ microsite: { ...s.microsite, testimonials: next, published: false } }));
    await actions.updateMicrositeConfig({ testimonials: next });
  },
  deleteTestimonial: async (id) => {
    const next = get().microsite.testimonials.filter((t) => t.id !== id);
    set((s) => ({ microsite: { ...s.microsite, testimonials: next, published: false } }));
    await actions.updateMicrositeConfig({ testimonials: next });
  },
  publishMicrosite: async () => {
    set((s) => ({ microsite: { ...s.microsite, published: true, lastPublishedAt: Date.now() } }));
    await actions.publishMicrosite();
  },

  // Subscription
  changePlan: async (plan, cycle) => {
    const c = cycle ?? get().subscription.cycle;
    const meta = PLANS[plan];
    const price = c === "yearly" ? Math.round(meta.price * 12 * 0.8) : meta.price;
    set((s) => ({
      subscription: {
        ...s.subscription, plan, price, cycle: c,
        seats: meta.seats, features: meta.features, status: "active", cancelAt: undefined,
      },
    }));
    await actions.changePlan(plan, c);
  },
  cancelSubscription: async () => {
    const at = Date.now() + 1000 * 60 * 60 * 24 * 30;
    set((s) => ({ subscription: { ...s.subscription, status: "cancelled", cancelAt: at } }));
    await actions.cancelSubscription();
  },
  resumeSubscription: async () => {
    set((s) => ({ subscription: { ...s.subscription, status: "active", cancelAt: undefined } }));
    await actions.resumeSubscription();
  },
  updatePaymentMethod: async (pm) => {
    set({ paymentMethod: pm });
    await actions.updatePaymentMethod(pm);
  },

  resetAll: () => {
    if (typeof window !== "undefined") window.location.reload();
  },
}));

export type {
  Activity, ActivityKind, Comment, Commission, Document, Invoice, LeadForm,
  Message, MicrositeConfig, OpenHouse, PaymentMethod, Plan, SavedView, Sequence,
  Showing, Subscription, Tag, Testimonial, Thread,
};

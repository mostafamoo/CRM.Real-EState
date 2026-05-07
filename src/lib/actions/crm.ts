"use server";

import { revalidatePath } from "next/cache";
import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import { db, t } from "@/lib/db";
import { newId, requireSession } from "@/lib/auth";

async function ctx() {
  return await requireSession();
}

async function logActivity(opts: {
  organizationId: string;
  actor: string;
  kind: string;
  title: string;
  detail?: string;
  entityType?: string;
  entityId?: string;
}) {
  await db.insert(t.activity).values({
    id: newId("AC"),
    organizationId: opts.organizationId,
    kind: opts.kind,
    actor: opts.actor,
    title: opts.title,
    detail: opts.detail ?? null,
    entityType: opts.entityType ?? null,
    entityId: opts.entityId ?? null,
  });
}

async function pushNotification(orgId: string, userId: string | null, title: string, body?: string) {
  await db.insert(t.notifications).values({
    id: newId("N"),
    organizationId: orgId,
    userId: userId ?? null,
    title,
    body: body ?? null,
  });
}

// === Leads ===
export async function createLead(input: {
  name: string; email: string; phone?: string; source: string; status: string;
  budget: number; city?: string; agentName?: string;
}) {
  const s = await ctx();
  const id = newId("L");
  await db.insert(t.leads).values({
    id, organizationId: s.organizationId,
    name: input.name, email: input.email, phone: input.phone ?? null,
    source: input.source, status: input.status, budget: input.budget,
    city: input.city ?? null, agentId: s.userId, agentName: input.agentName ?? null,
  });
  await logActivity({ organizationId: s.organizationId, actor: s.email, kind: "lead.created", title: "Created lead", detail: input.name, entityType: "lead", entityId: id });
  await pushNotification(s.organizationId, s.userId, "New lead created", input.name);
  revalidatePath("/leads");
  revalidatePath("/dashboard");
  return id;
}

export async function updateLead(id: string, patch: Partial<{
  name: string; email: string; phone: string; source: string; status: string;
  budget: number; city: string; agentName: string;
}>) {
  const s = await ctx();
  await db.update(t.leads).set(patch).where(and(eq(t.leads.id, id), eq(t.leads.organizationId, s.organizationId)));
  await logActivity({ organizationId: s.organizationId, actor: s.email, kind: "lead.updated", title: "Updated lead", entityType: "lead", entityId: id });
  revalidatePath("/leads");
  revalidatePath(`/leads/${id}`);
}

export async function deleteLead(id: string) {
  const s = await ctx();
  const [lead] = await db.select().from(t.leads).where(and(eq(t.leads.id, id), eq(t.leads.organizationId, s.organizationId))).limit(1);
  await db.delete(t.leads).where(and(eq(t.leads.id, id), eq(t.leads.organizationId, s.organizationId)));
  if (lead) await logActivity({ organizationId: s.organizationId, actor: s.email, kind: "lead.deleted", title: "Deleted lead", detail: lead.name });
  revalidatePath("/leads");
}

export async function deleteLeadsBulk(ids: string[]) {
  const s = await ctx();
  await db.delete(t.leads).where(and(inArray(t.leads.id, ids), eq(t.leads.organizationId, s.organizationId)));
  revalidatePath("/leads");
}

export async function importLeads(rows: Array<Parameters<typeof createLead>[0]>) {
  const s = await ctx();
  let count = 0;
  for (const r of rows) {
    await db.insert(t.leads).values({
      id: newId("L"), organizationId: s.organizationId,
      name: r.name, email: r.email, phone: r.phone ?? null,
      source: r.source, status: r.status, budget: r.budget,
      city: r.city ?? null, agentId: s.userId, agentName: r.agentName ?? null,
    });
    count++;
  }
  await logActivity({ organizationId: s.organizationId, actor: s.email, kind: "lead.created", title: `Imported ${count} leads` });
  revalidatePath("/leads");
  return count;
}

// === Deals ===
export async function createDeal(input: {
  title: string; client: string; property?: string; amount: number;
  stage: string; closeDate?: string; agentName?: string;
}) {
  const s = await ctx();
  const id = newId("D");
  await db.insert(t.deals).values({
    id, organizationId: s.organizationId,
    title: input.title, client: input.client, property: input.property ?? null,
    amount: input.amount, stage: input.stage, closeDate: input.closeDate ?? null,
    agentName: input.agentName ?? null,
  });
  await logActivity({ organizationId: s.organizationId, actor: s.email, kind: "deal.created", title: "Created deal", detail: input.title, entityType: "deal", entityId: id });
  revalidatePath("/deals");
  revalidatePath("/pipeline");
  return id;
}
export async function updateDeal(id: string, patch: Partial<Parameters<typeof createDeal>[0]>) {
  const s = await ctx();
  await db.update(t.deals).set(patch).where(and(eq(t.deals.id, id), eq(t.deals.organizationId, s.organizationId)));
  revalidatePath("/deals");
  revalidatePath("/pipeline");
}
export async function moveDealStage(id: string, stage: string) {
  const s = await ctx();
  await db.update(t.deals).set({ stage }).where(and(eq(t.deals.id, id), eq(t.deals.organizationId, s.organizationId)));
  await logActivity({ organizationId: s.organizationId, actor: s.email, kind: "deal.stage", title: `Moved deal to ${stage}`, entityType: "deal", entityId: id });
  revalidatePath("/deals");
  revalidatePath("/pipeline");
}
export async function deleteDeal(id: string) {
  const s = await ctx();
  await db.delete(t.deals).where(and(eq(t.deals.id, id), eq(t.deals.organizationId, s.organizationId)));
  revalidatePath("/deals");
  revalidatePath("/pipeline");
}

// === Listings ===
export async function createListing(input: {
  address: string; city: string; state?: string; price: number;
  beds: number; baths: number; sqft: number; status: string; agentName?: string;
}) {
  const s = await ctx();
  const id = newId("MLS");
  await db.insert(t.listings).values({
    id, organizationId: s.organizationId,
    address: input.address, city: input.city, state: input.state ?? null,
    price: input.price, beds: input.beds, baths: input.baths, sqft: input.sqft,
    status: input.status, agentName: input.agentName ?? null,
  });
  await logActivity({ organizationId: s.organizationId, actor: s.email, kind: "listing.created", title: "Added listing", detail: input.address, entityType: "listing", entityId: id });
  revalidatePath("/listings");
  return id;
}
export async function updateListing(id: string, patch: Partial<Parameters<typeof createListing>[0]>) {
  const s = await ctx();
  await db.update(t.listings).set(patch).where(and(eq(t.listings.id, id), eq(t.listings.organizationId, s.organizationId)));
  revalidatePath("/listings");
  revalidatePath(`/listings/${id}`);
}
export async function deleteListing(id: string) {
  const s = await ctx();
  await db.delete(t.listings).where(and(eq(t.listings.id, id), eq(t.listings.organizationId, s.organizationId)));
  revalidatePath("/listings");
}

// === Contacts ===
export async function createContact(input: { name: string; role?: string; company?: string; email?: string; phone?: string; city?: string; }) {
  const s = await ctx();
  const id = newId("C");
  await db.insert(t.contacts).values({
    id, organizationId: s.organizationId,
    name: input.name, role: input.role ?? null, company: input.company ?? null,
    email: input.email ?? null, phone: input.phone ?? null, city: input.city ?? null,
  });
  revalidatePath("/contacts");
  return id;
}
export async function updateContact(id: string, patch: Partial<Parameters<typeof createContact>[0]>) {
  const s = await ctx();
  await db.update(t.contacts).set(patch).where(and(eq(t.contacts.id, id), eq(t.contacts.organizationId, s.organizationId)));
  revalidatePath("/contacts");
}
export async function deleteContact(id: string) {
  const s = await ctx();
  await db.delete(t.contacts).where(and(eq(t.contacts.id, id), eq(t.contacts.organizationId, s.organizationId)));
  revalidatePath("/contacts");
}

// === Tasks ===
export async function createTask(input: { title: string; due?: string; priority: string; assigneeName?: string; status: string; related?: string; }) {
  const s = await ctx();
  const id = newId("T");
  await db.insert(t.tasks).values({
    id, organizationId: s.organizationId,
    title: input.title, due: input.due ?? null, priority: input.priority,
    assigneeName: input.assigneeName ?? null, status: input.status, related: input.related ?? null,
  });
  await logActivity({ organizationId: s.organizationId, actor: s.email, kind: "task.created", title: "Created task", detail: input.title, entityType: "task", entityId: id });
  revalidatePath("/tasks");
  return id;
}
export async function updateTask(id: string, patch: Partial<Parameters<typeof createTask>[0]>) {
  const s = await ctx();
  await db.update(t.tasks).set(patch).where(and(eq(t.tasks.id, id), eq(t.tasks.organizationId, s.organizationId)));
  revalidatePath("/tasks");
}
export async function toggleTask(id: string) {
  const s = await ctx();
  const [task] = await db.select().from(t.tasks).where(and(eq(t.tasks.id, id), eq(t.tasks.organizationId, s.organizationId))).limit(1);
  if (!task) return;
  const newStatus = task.status === "Done" ? "To do" : "Done";
  await db.update(t.tasks).set({ status: newStatus }).where(eq(t.tasks.id, id));
  if (newStatus === "Done") {
    await logActivity({ organizationId: s.organizationId, actor: s.email, kind: "task.completed", title: "Completed task", detail: task.title, entityType: "task", entityId: id });
  }
  revalidatePath("/tasks");
}
export async function deleteTask(id: string) {
  const s = await ctx();
  await db.delete(t.tasks).where(and(eq(t.tasks.id, id), eq(t.tasks.organizationId, s.organizationId)));
  revalidatePath("/tasks");
}

// === Showings ===
export async function createShowing(input: { listingId: string; leadId: string; date: string; time: string; agentName?: string; status: string; }) {
  const s = await ctx();
  const id = newId("SH");
  await db.insert(t.showings).values({
    id, organizationId: s.organizationId,
    listingId: input.listingId, leadId: input.leadId, date: input.date,
    time: input.time, agentName: input.agentName ?? null, status: input.status,
  });
  await logActivity({ organizationId: s.organizationId, actor: s.email, kind: "showing.scheduled", title: "Scheduled showing", detail: `${input.date} ${input.time}` });
  revalidatePath("/showings");
  return id;
}
export async function updateShowing(id: string, patch: Partial<{ status: string; date: string; time: string; agentName: string; feedback: unknown; }>) {
  const s = await ctx();
  await db.update(t.showings).set(patch).where(and(eq(t.showings.id, id), eq(t.showings.organizationId, s.organizationId)));
  revalidatePath("/showings");
}
export async function deleteShowing(id: string) {
  const s = await ctx();
  await db.delete(t.showings).where(and(eq(t.showings.id, id), eq(t.showings.organizationId, s.organizationId)));
  revalidatePath("/showings");
}

// === Open Houses ===
export async function createOpenHouse(input: { listingId: string; date: string; startTime: string; endTime: string; agentName?: string; }) {
  const s = await ctx();
  const id = newId("OH");
  await db.insert(t.openHouses).values({
    id, organizationId: s.organizationId,
    listingId: input.listingId, date: input.date,
    startTime: input.startTime, endTime: input.endTime,
    agentName: input.agentName ?? null, status: "Upcoming", attendees: [],
  });
  await logActivity({ organizationId: s.organizationId, actor: s.email, kind: "openhouse.scheduled", title: "Scheduled open house", detail: `${input.date} ${input.startTime}` });
  revalidatePath("/open-houses");
  return id;
}
export async function registerOpenHouseAttendee(openHouseId: string, attendee: { name: string; email: string; phone: string; interested: boolean; }) {
  const s = await ctx();
  const [oh] = await db.select().from(t.openHouses).where(and(eq(t.openHouses.id, openHouseId), eq(t.openHouses.organizationId, s.organizationId))).limit(1);
  if (!oh) return;
  const attendees = (oh.attendees as unknown as Array<{ checkInAt: number }>) ?? [];
  attendees.push({ ...attendee, checkInAt: Date.now() });
  await db.update(t.openHouses).set({ attendees }).where(eq(t.openHouses.id, openHouseId));
  // Auto-create lead
  const leadId = newId("L");
  await db.insert(t.leads).values({
    id: leadId, organizationId: s.organizationId,
    name: attendee.name, email: attendee.email, phone: attendee.phone,
    source: "Walk-in", status: "new", budget: 0, city: null, agentName: oh.agentName,
  });
  revalidatePath("/open-houses");
  revalidatePath("/leads");
}
export async function deleteOpenHouse(id: string) {
  const s = await ctx();
  await db.delete(t.openHouses).where(and(eq(t.openHouses.id, id), eq(t.openHouses.organizationId, s.organizationId)));
  revalidatePath("/open-houses");
}

// === Offers ===
export async function createOffer(input: { listing: string; buyer: string; amount: number; status: string; submittedBy: string; }) {
  const s = await ctx();
  const id = newId("OFR");
  await db.insert(t.offers).values({
    id, organizationId: s.organizationId, ...input,
    date: new Date().toISOString().split("T")[0],
  });
  revalidatePath("/offers");
  return id;
}
export async function updateOffer(id: string, patch: Partial<{ status: string; amount: number; }>) {
  const s = await ctx();
  await db.update(t.offers).set(patch).where(and(eq(t.offers.id, id), eq(t.offers.organizationId, s.organizationId)));
  revalidatePath("/offers");
}
export async function deleteOffer(id: string) {
  const s = await ctx();
  await db.delete(t.offers).where(and(eq(t.offers.id, id), eq(t.offers.organizationId, s.organizationId)));
  revalidatePath("/offers");
}

// === Commissions ===
export async function createCommission(input: { dealId: string; amount: number; splitPercent: number; agentName: string; brokerage: number; agentTake: number; status: string; }) {
  const s = await ctx();
  const id = newId("CM");
  await db.insert(t.commissions).values({
    id, organizationId: s.organizationId, ...input,
  });
  revalidatePath("/commissions");
  return id;
}
export async function updateCommission(id: string, patch: Partial<{ status: string; paidAt: string; }>) {
  const s = await ctx();
  await db.update(t.commissions).set(patch).where(and(eq(t.commissions.id, id), eq(t.commissions.organizationId, s.organizationId)));
  revalidatePath("/commissions");
}

// === Messages ===
export async function sendMessage(input: {
  threadId?: string; channel: string; direction: string;
  leadId?: string; from: string; to: string;
  subject?: string; body: string; callDuration?: number;
}) {
  const s = await ctx();
  let threadId = input.threadId;
  if (!threadId) {
    threadId = newId("TH");
    await db.insert(t.threads).values({
      id: threadId, organizationId: s.organizationId,
      leadId: input.leadId ?? null,
      subject: input.subject ?? input.body.slice(0, 40),
      channel: input.channel, lastMessageAt: new Date(), unread: 0,
    });
  } else {
    await db.update(t.threads).set({
      lastMessageAt: new Date(),
      unread: input.direction === "inbound" ? sql`${t.threads.unread} + 1` : t.threads.unread,
    }).where(eq(t.threads.id, threadId));
  }
  const id = newId("M");
  await db.insert(t.messages).values({
    id, organizationId: s.organizationId, threadId,
    channel: input.channel, direction: input.direction,
    leadId: input.leadId ?? null,
    fromAddress: input.from, toAddress: input.to,
    subject: input.subject ?? null, body: input.body,
    callDuration: input.callDuration ?? null,
    read: input.direction === "outbound",
  });
  revalidatePath("/inbox");
  revalidatePath("/leads");
  return id;
}
export async function markThreadRead(threadId: string) {
  const s = await ctx();
  await db.update(t.threads).set({ unread: 0 }).where(and(eq(t.threads.id, threadId), eq(t.threads.organizationId, s.organizationId)));
  await db.update(t.messages).set({ read: true }).where(eq(t.messages.threadId, threadId));
  revalidatePath("/inbox");
}

// === Documents ===
export async function createDocument(input: { name: string; type: string; size: number; status: string; signers: Array<{ name: string; email: string; signed: boolean; signedAt?: number }>; relatedType?: string; relatedId?: string; uploadedBy: string; }) {
  const s = await ctx();
  const id = newId("DOC");
  await db.insert(t.documents).values({
    id, organizationId: s.organizationId,
    name: input.name, type: input.type, size: input.size, status: input.status,
    signers: input.signers, relatedType: input.relatedType ?? null,
    relatedId: input.relatedId ?? null, uploadedBy: input.uploadedBy,
  });
  await logActivity({ organizationId: s.organizationId, actor: s.email, kind: "document.sent", title: "Uploaded document", detail: input.name, entityType: "document", entityId: id });
  revalidatePath("/documents");
  return id;
}
export async function signDocument(id: string, signerEmail: string) {
  const s = await ctx();
  const [doc] = await db.select().from(t.documents).where(and(eq(t.documents.id, id), eq(t.documents.organizationId, s.organizationId))).limit(1);
  if (!doc) return;
  type Signer = { name: string; email: string; signed: boolean; signedAt?: number };
  const signers = (doc.signers as unknown as Signer[]).map((sg) =>
    sg.email === signerEmail ? { ...sg, signed: true, signedAt: Date.now() } : sg
  );
  const allSigned = signers.every((sg) => sg.signed);
  await db.update(t.documents).set({ signers, status: allSigned ? "Signed" : doc.status }).where(eq(t.documents.id, id));
  await logActivity({ organizationId: s.organizationId, actor: signerEmail, kind: "document.signed", title: "Signed document", detail: doc.name, entityType: "document", entityId: id });
  revalidatePath("/documents");
}
export async function deleteDocument(id: string) {
  const s = await ctx();
  await db.delete(t.documents).where(and(eq(t.documents.id, id), eq(t.documents.organizationId, s.organizationId)));
  revalidatePath("/documents");
}

// === Tags ===
export async function createTag(name: string, color: string) {
  const s = await ctx();
  const id = newId("TAG");
  await db.insert(t.tags).values({ id, organizationId: s.organizationId, name, color });
  revalidatePath("/leads");
  return id;
}
export async function toggleLeadTag(leadId: string, tagId: string) {
  await ctx();
  const [existing] = await db.select().from(t.leadTags).where(and(eq(t.leadTags.leadId, leadId), eq(t.leadTags.tagId, tagId))).limit(1);
  if (existing) {
    await db.delete(t.leadTags).where(eq(t.leadTags.id, existing.id));
  } else {
    await db.insert(t.leadTags).values({ id: newId("LT"), leadId, tagId });
  }
  revalidatePath(`/leads/${leadId}`);
}
export async function deleteTag(id: string) {
  const s = await ctx();
  await db.delete(t.tags).where(and(eq(t.tags.id, id), eq(t.tags.organizationId, s.organizationId)));
  revalidatePath("/leads");
}

// === Comments ===
export async function createComment(input: { entityType: string; entityId: string; author: string; body: string; mentions: string[]; }) {
  const s = await ctx();
  const id = newId("CT");
  await db.insert(t.comments).values({ id, organizationId: s.organizationId, ...input });
  await logActivity({ organizationId: s.organizationId, actor: input.author, kind: "comment.added", title: "Added comment", detail: input.body.slice(0, 60) });
  revalidatePath(`/${input.entityType}s/${input.entityId}`);
  return id;
}

// === Campaigns ===
export async function createCampaign(input: { name: string; type: string; status: string; sentDate?: string; }) {
  const s = await ctx();
  const id = newId("CMP");
  await db.insert(t.campaigns).values({
    id, organizationId: s.organizationId, ...input, sent: 0, opened: 0, clicked: 0,
    sentDate: input.sentDate ?? null,
  });
  revalidatePath("/campaigns");
  return id;
}
export async function updateCampaign(id: string, patch: Partial<{ status: string; }>) {
  const s = await ctx();
  await db.update(t.campaigns).set(patch).where(and(eq(t.campaigns.id, id), eq(t.campaigns.organizationId, s.organizationId)));
  revalidatePath("/campaigns");
}
export async function deleteCampaign(id: string) {
  const s = await ctx();
  await db.delete(t.campaigns).where(and(eq(t.campaigns.id, id), eq(t.campaigns.organizationId, s.organizationId)));
  revalidatePath("/campaigns");
}

// === Automations ===
export async function createAutomation(input: { name: string; trigger: string; action: string; active: boolean; }) {
  const s = await ctx();
  const id = newId("AUT");
  await db.insert(t.automations).values({ id, organizationId: s.organizationId, ...input, runs: 0 });
  revalidatePath("/automation");
  return id;
}
export async function toggleAutomation(id: string) {
  const s = await ctx();
  const [a] = await db.select().from(t.automations).where(and(eq(t.automations.id, id), eq(t.automations.organizationId, s.organizationId))).limit(1);
  if (!a) return;
  await db.update(t.automations).set({ active: !a.active }).where(eq(t.automations.id, id));
  revalidatePath("/automation");
}
export async function deleteAutomation(id: string) {
  const s = await ctx();
  await db.delete(t.automations).where(and(eq(t.automations.id, id), eq(t.automations.organizationId, s.organizationId)));
  revalidatePath("/automation");
}

// === Sequences ===
export async function createSequence(input: { name: string; trigger: string; steps: unknown; active: boolean; }) {
  const s = await ctx();
  const id = newId("SEQ");
  await db.insert(t.sequences).values({ id, organizationId: s.organizationId, ...input, enrolled: 0 });
  revalidatePath("/sequences");
  return id;
}
export async function updateSequence(id: string, patch: Partial<{ active: boolean; enrolled: number; }>) {
  const s = await ctx();
  await db.update(t.sequences).set(patch).where(and(eq(t.sequences.id, id), eq(t.sequences.organizationId, s.organizationId)));
  revalidatePath("/sequences");
}
export async function toggleSequence(id: string) {
  const s = await ctx();
  const [sq] = await db.select().from(t.sequences).where(and(eq(t.sequences.id, id), eq(t.sequences.organizationId, s.organizationId))).limit(1);
  if (!sq) return;
  await db.update(t.sequences).set({ active: !sq.active }).where(eq(t.sequences.id, id));
  revalidatePath("/sequences");
}
export async function deleteSequence(id: string) {
  const s = await ctx();
  await db.delete(t.sequences).where(and(eq(t.sequences.id, id), eq(t.sequences.organizationId, s.organizationId)));
  revalidatePath("/sequences");
}

// === Forms ===
export async function createForm(input: { name: string; source?: string; fields: unknown; active: boolean; }) {
  const s = await ctx();
  const id = newId("F");
  await db.insert(t.forms).values({
    id, organizationId: s.organizationId,
    name: input.name, source: input.source ?? null, fields: input.fields,
    active: input.active, submissions: 0,
  });
  revalidatePath("/forms");
  return id;
}
export async function updateForm(id: string, patch: Partial<{ active: boolean; name: string; }>) {
  const s = await ctx();
  await db.update(t.forms).set(patch).where(and(eq(t.forms.id, id), eq(t.forms.organizationId, s.organizationId)));
  revalidatePath("/forms");
}
export async function deleteForm(id: string) {
  const s = await ctx();
  await db.delete(t.forms).where(and(eq(t.forms.id, id), eq(t.forms.organizationId, s.organizationId)));
  revalidatePath("/forms");
}
export async function recordFormSubmission(formId: string) {
  await ctx();
  await db.update(t.forms).set({ submissions: sql`${t.forms.submissions} + 1` }).where(eq(t.forms.id, formId));
  revalidatePath("/forms");
}

// === Integrations ===
export async function toggleIntegration(name: string) {
  const s = await ctx();
  const [i] = await db.select().from(t.integrations).where(and(eq(t.integrations.name, name), eq(t.integrations.organizationId, s.organizationId))).limit(1);
  if (!i) return;
  await db.update(t.integrations).set({ connected: !i.connected }).where(eq(t.integrations.id, i.id));
  revalidatePath("/integrations");
}

// === Calendar Events ===
export async function createEvent(input: { title: string; day: number; time: string; type: string; }) {
  const s = await ctx();
  const id = newId("EV");
  await db.insert(t.calendarEvents).values({ id, organizationId: s.organizationId, ...input });
  revalidatePath("/calendar");
  return id;
}
export async function deleteEvent(id: string) {
  const s = await ctx();
  await db.delete(t.calendarEvents).where(and(eq(t.calendarEvents.id, id), eq(t.calendarEvents.organizationId, s.organizationId)));
  revalidatePath("/calendar");
}

// === User / Business / Notifications ===
export async function updateUserProfile(patch: Partial<{ firstName: string; lastName: string; email: string; phone: string; title: string; license: string; bio: string; }>) {
  const s = await ctx();
  await db.update(t.users).set(patch).where(eq(t.users.id, s.userId));
  revalidatePath("/settings/profile");
}
export async function updateBusiness(patch: Partial<{ name: string; dba: string; license: string; ein: string; website: string; phone: string; address: string; city: string; state: string; zip: string; }>) {
  const s = await ctx();
  await db.update(t.organizations).set(patch).where(eq(t.organizations.id, s.organizationId));
  revalidatePath("/settings/business");
}
export async function markNotificationsRead() {
  const s = await ctx();
  await db.update(t.notifications).set({ read: true }).where(and(eq(t.notifications.organizationId, s.organizationId), eq(t.notifications.read, false)));
  revalidatePath("/dashboard");
}

// === Microsite ===
export async function updateMicrositeConfig(patch: Record<string, unknown>) {
  const s = await ctx();
  const [existing] = await db.select().from(t.microsite).where(eq(t.microsite.organizationId, s.organizationId)).limit(1);
  const newConfig = { ...(existing?.config as object ?? {}), ...patch, published: false };
  if (existing) {
    await db.update(t.microsite).set({ config: newConfig, updatedAt: new Date() }).where(eq(t.microsite.organizationId, s.organizationId));
  } else {
    await db.insert(t.microsite).values({ organizationId: s.organizationId, config: newConfig });
  }
  revalidatePath("/microsite");
}
export async function publishMicrosite() {
  const s = await ctx();
  const [existing] = await db.select().from(t.microsite).where(eq(t.microsite.organizationId, s.organizationId)).limit(1);
  if (!existing) return;
  await db.update(t.microsite).set({
    config: { ...(existing.config as object), published: true, lastPublishedAt: Date.now() },
    updatedAt: new Date(),
  }).where(eq(t.microsite.organizationId, s.organizationId));
  await logActivity({ organizationId: s.organizationId, actor: s.email, kind: "campaign.sent", title: "Published microsite" });
  revalidatePath("/microsite");
}

// === Subscription ===
const PLANS = {
  Starter: { price: 49, seats: 1, features: ["Up to 250 leads", "Basic email automations", "1 user", "Community support"] },
  Pro: { price: 1490, seats: 10, features: ["Unlimited leads, deals, and listings", "Custom microsite + custom domain", "Up to 10 users", "Email & SMS automations", "Team analytics and reporting", "Priority support"] },
  Enterprise: { price: 4990, seats: 999, features: ["Everything in Pro", "SSO + API access", "Unlimited users", "Dedicated CSM", "Custom contracts and SLAs"] },
};
export async function changePlan(plan: keyof typeof PLANS, cycle: "monthly" | "yearly") {
  const s = await ctx();
  const meta = PLANS[plan];
  const price = cycle === "yearly" ? Math.round(meta.price * 12 * 0.8) : meta.price;
  await db.update(t.subscriptions).set({
    plan, price, cycle, seats: meta.seats, status: "active", cancelAt: null,
  }).where(eq(t.subscriptions.organizationId, s.organizationId));
  revalidatePath("/settings/billing");
}
export async function cancelSubscription() {
  const s = await ctx();
  const cancelAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
  await db.update(t.subscriptions).set({ status: "cancelled", cancelAt }).where(eq(t.subscriptions.organizationId, s.organizationId));
  revalidatePath("/settings/billing");
}
export async function resumeSubscription() {
  const s = await ctx();
  await db.update(t.subscriptions).set({ status: "active", cancelAt: null }).where(eq(t.subscriptions.organizationId, s.organizationId));
  revalidatePath("/settings/billing");
}
export async function updatePaymentMethod(pm: { brand: string; last4: string; expMonth: number; expYear: number; }) {
  const s = await ctx();
  await db.update(t.subscriptions).set({ paymentMethod: pm }).where(eq(t.subscriptions.organizationId, s.organizationId));
  revalidatePath("/settings/billing");
}

// === Saved Views ===
export async function createSavedView(input: { entity: string; name: string; filters: Record<string, string>; }) {
  const s = await ctx();
  const id = newId("SV");
  await db.insert(t.savedViews).values({
    id, organizationId: s.organizationId, userId: s.userId,
    entity: input.entity, name: input.name, filters: input.filters,
  });
  revalidatePath(`/${input.entity}`);
  return id;
}
export async function deleteSavedView(id: string) {
  const s = await ctx();
  await db.delete(t.savedViews).where(and(eq(t.savedViews.id, id), eq(t.savedViews.organizationId, s.organizationId)));
  revalidatePath("/leads");
  revalidatePath("/deals");
}

// === Bulk fetch helpers (for app hydration) ===
export async function fetchAllForOrg() {
  const s = await ctx();
  const orgId = s.organizationId;

  const [
    user, organization,
    leadsRows, dealsRows, listingsRows, contactsRows, tasksRows,
    showingsRows, openHousesRows, offersRows, commissionsRows,
    threadsRows, messagesRows, documentsRows, activityRows, commentsRows,
    tagsRows, leadTagsRows, campaignsRows, automationsRows, sequencesRows,
    integrationsRows, formsRows, calendarEventsRows, savedViewsRows,
    notificationsRows, micrositeRow, subscriptionRow, invoicesRows,
  ] = await Promise.all([
    db.select().from(t.users).where(eq(t.users.id, s.userId)).limit(1),
    db.select().from(t.organizations).where(eq(t.organizations.id, orgId)).limit(1),
    db.select().from(t.leads).where(eq(t.leads.organizationId, orgId)).orderBy(desc(t.leads.createdAt)),
    db.select().from(t.deals).where(eq(t.deals.organizationId, orgId)).orderBy(desc(t.deals.createdAt)),
    db.select().from(t.listings).where(eq(t.listings.organizationId, orgId)).orderBy(desc(t.listings.createdAt)),
    db.select().from(t.contacts).where(eq(t.contacts.organizationId, orgId)).orderBy(desc(t.contacts.createdAt)),
    db.select().from(t.tasks).where(eq(t.tasks.organizationId, orgId)).orderBy(desc(t.tasks.createdAt)),
    db.select().from(t.showings).where(eq(t.showings.organizationId, orgId)).orderBy(desc(t.showings.createdAt)),
    db.select().from(t.openHouses).where(eq(t.openHouses.organizationId, orgId)).orderBy(desc(t.openHouses.createdAt)),
    db.select().from(t.offers).where(eq(t.offers.organizationId, orgId)).orderBy(desc(t.offers.createdAt)),
    db.select().from(t.commissions).where(eq(t.commissions.organizationId, orgId)).orderBy(desc(t.commissions.createdAt)),
    db.select().from(t.threads).where(eq(t.threads.organizationId, orgId)).orderBy(desc(t.threads.lastMessageAt)),
    db.select().from(t.messages).where(eq(t.messages.organizationId, orgId)).orderBy(asc(t.messages.createdAt)),
    db.select().from(t.documents).where(eq(t.documents.organizationId, orgId)).orderBy(desc(t.documents.createdAt)),
    db.select().from(t.activity).where(eq(t.activity.organizationId, orgId)).orderBy(desc(t.activity.createdAt)).limit(200),
    db.select().from(t.comments).where(eq(t.comments.organizationId, orgId)).orderBy(desc(t.comments.createdAt)),
    db.select().from(t.tags).where(eq(t.tags.organizationId, orgId)),
    db.select().from(t.leadTags),
    db.select().from(t.campaigns).where(eq(t.campaigns.organizationId, orgId)).orderBy(desc(t.campaigns.createdAt)),
    db.select().from(t.automations).where(eq(t.automations.organizationId, orgId)).orderBy(desc(t.automations.createdAt)),
    db.select().from(t.sequences).where(eq(t.sequences.organizationId, orgId)).orderBy(desc(t.sequences.createdAt)),
    db.select().from(t.integrations).where(eq(t.integrations.organizationId, orgId)),
    db.select().from(t.forms).where(eq(t.forms.organizationId, orgId)).orderBy(desc(t.forms.createdAt)),
    db.select().from(t.calendarEvents).where(eq(t.calendarEvents.organizationId, orgId)),
    db.select().from(t.savedViews).where(eq(t.savedViews.organizationId, orgId)),
    db.select().from(t.notifications).where(eq(t.notifications.organizationId, orgId)).orderBy(desc(t.notifications.createdAt)).limit(50),
    db.select().from(t.microsite).where(eq(t.microsite.organizationId, orgId)).limit(1),
    db.select().from(t.subscriptions).where(eq(t.subscriptions.organizationId, orgId)).limit(1),
    db.select().from(t.invoices).where(eq(t.invoices.organizationId, orgId)).orderBy(desc(t.invoices.date)),
  ]);

  const leadTagsMap: Record<string, string[]> = {};
  for (const lt of leadTagsRows) {
    leadTagsMap[lt.leadId] = leadTagsMap[lt.leadId] ?? [];
    leadTagsMap[lt.leadId].push(lt.tagId);
  }

  return {
    user: user[0],
    organization: organization[0],
    leads: leadsRows,
    deals: dealsRows,
    listings: listingsRows,
    contacts: contactsRows,
    tasks: tasksRows,
    showings: showingsRows,
    openHouses: openHousesRows,
    offers: offersRows,
    commissions: commissionsRows,
    threads: threadsRows,
    messages: messagesRows,
    documents: documentsRows,
    activity: activityRows,
    comments: commentsRows,
    tags: tagsRows,
    leadTags: leadTagsMap,
    campaigns: campaignsRows,
    automations: automationsRows,
    sequences: sequencesRows,
    integrations: integrationsRows,
    forms: formsRows,
    calendarEvents: calendarEventsRows,
    savedViews: savedViewsRows,
    notifications: notificationsRows,
    microsite: micrositeRow[0]?.config ?? null,
    subscription: subscriptionRow[0],
    invoices: invoicesRows,
  };
}

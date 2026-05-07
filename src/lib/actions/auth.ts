"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, t } from "@/lib/db";
import { hashPassword, verifyPassword, signToken, setSessionCookie, clearSessionCookie, newId } from "@/lib/auth";
import { seedOrganization } from "./seed";

export type AuthResult = { ok: true } | { ok: false; error: string };

export async function signupAction(formData: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  company: string;
}): Promise<AuthResult> {
  const email = formData.email.trim().toLowerCase();
  if (!email || !formData.password || !formData.firstName) {
    return { ok: false, error: "Missing required fields" };
  }
  if (formData.password.length < 8) {
    return { ok: false, error: "Password must be at least 8 characters" };
  }

  const [existing] = await db.select().from(t.users).where(eq(t.users.email, email)).limit(1);
  if (existing) return { ok: false, error: "Email already in use" };

  const orgId = newId("org");
  const userId = newId("usr");

  await db.insert(t.organizations).values({
    id: orgId,
    name: formData.company || `${formData.firstName}'s Workspace`,
    city: "—",
    state: "—",
  });

  await db.insert(t.users).values({
    id: userId,
    organizationId: orgId,
    email,
    passwordHash: await hashPassword(formData.password),
    firstName: formData.firstName,
    lastName: formData.lastName,
    role: "owner",
  });

  await seedOrganization(orgId, userId, `${formData.firstName} ${formData.lastName}`);

  const token = await signToken({ userId, organizationId: orgId, email });
  await setSessionCookie(token);
  return { ok: true };
}

export async function loginAction(formData: {
  email: string;
  password: string;
}): Promise<AuthResult> {
  const email = formData.email.trim().toLowerCase();
  const [user] = await db.select().from(t.users).where(eq(t.users.email, email)).limit(1);
  if (!user) return { ok: false, error: "Invalid email or password" };

  const valid = await verifyPassword(formData.password, user.passwordHash);
  if (!valid) return { ok: false, error: "Invalid email or password" };

  const token = await signToken({
    userId: user.id,
    organizationId: user.organizationId,
    email: user.email,
  });
  await setSessionCookie(token);
  return { ok: true };
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/login");
}

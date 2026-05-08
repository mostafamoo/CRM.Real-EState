import "server-only";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

const url =
  process.env.TURSO_DATABASE_URL ||
  process.env.DATABASE_URL ||
  (process.env.VERCEL ? "libsql://dummy-url.turso.io" : "file:./estata.db");

const authToken = process.env.TURSO_AUTH_TOKEN;

const client = createClient({
  url,
  authToken,
});

export const db = drizzle(client, { schema });

export * as t from "./schema";

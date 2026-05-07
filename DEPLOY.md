# Deploying Estata CRM to Vercel + Turso

This guide walks through deploying the app to **Vercel** with a **Turso** (libSQL/SQLite cloud) database.

---

## 1) Create a Turso database

1. Go to [turso.tech](https://turso.tech) and sign up (you can use your GitHub account).
2. Click **Create database** and pick a name (e.g. `estata-prod`). Select a region close to you.
3. Once created, open the database and click **Connect** → **Connection string**.
4. Copy:
   - **URL** (looks like `libsql://estata-prod-yourname.turso.io`)
   - **Auth token** (a long random string)

Keep these handy — you'll paste them into Vercel and run them locally to push the schema.

---

## 2) Push the schema to Turso

From your local machine, in the project folder:

```bash
TURSO_DATABASE_URL="libsql://estata-prod-yourname.turso.io" \
TURSO_AUTH_TOKEN="<your-auth-token>" \
npm run db:push
```

Confirm any "Yes, I want to" prompts. This creates all 30+ tables in your remote Turso DB.

(Optional) seed a demo workspace:

```bash
TURSO_DATABASE_URL="libsql://..." TURSO_AUTH_TOKEN="..." npm run db:seed
```

---

## 3) Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub.
2. Click **Add New** → **Project**.
3. Select the `CRM.Real-EState` repository.
4. Leave framework / build settings as the defaults (Vercel auto-detects Next.js).
5. Expand **Environment Variables** and add 3 keys:

   | Key                  | Value                                      |
   | -------------------- | ------------------------------------------ |
   | `JWT_SECRET`         | A random string (e.g. `openssl rand -hex 32`) |
   | `TURSO_DATABASE_URL` | `libsql://...turso.io`                     |
   | `TURSO_AUTH_TOKEN`   | Your auth token                            |

6. Click **Deploy**. First build takes 2–3 minutes.

When it's done, you get a URL like `https://crm-real-estate-xyz.vercel.app`. Send that to your client.

---

## 4) Generating a strong JWT_SECRET

Run this in your terminal:

```bash
openssl rand -hex 32
```

Use the output as your `JWT_SECRET` value. It should look like a 64-character hex string.

> ⚠️ Keep it secret. Anyone with this value can forge sessions.

---

## 5) Custom domain (optional)

In your Vercel project → **Settings** → **Domains** → add your custom domain (e.g. `crm.yourcompany.com`) and follow the DNS instructions. Vercel handles HTTPS automatically.

---

## 6) Updating the app

Whenever you push to `main` on GitHub, Vercel auto-deploys.

For schema changes:

```bash
TURSO_DATABASE_URL=... TURSO_AUTH_TOKEN=... npm run db:push
```

---

## Troubleshooting

**"Cannot connect to database"** — Double-check `TURSO_DATABASE_URL` starts with `libsql://` and `TURSO_AUTH_TOKEN` is correct. Redeploy after fixing env vars.

**"Module not found: @libsql/client"** — Run `npm install` locally and push the updated `package-lock.json`.

**"User already exists"** when re-seeding — That's fine, the seed script removes and re-creates the demo org each run.

**Build fails with "out of memory"** — Add `NODE_OPTIONS="--max-old-space-size=4096"` to Vercel's env vars.

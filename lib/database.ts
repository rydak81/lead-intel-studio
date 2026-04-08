import { mkdir } from "node:fs/promises";
import path from "node:path";

import { PGlite } from "@electric-sql/pglite";

declare global {
  var __leadIntelDb: Promise<PGlite> | undefined;
}

async function initDatabase() {
  const dataDir = process.env.VERCEL
    ? path.join("/tmp", "lead-intel-studio")
    : path.join(process.cwd(), ".data");
  await mkdir(dataDir, { recursive: true });

  const db = new PGlite(path.join(dataDir, "lead-intel-studio"));

  await db.exec(`
    CREATE TABLE IF NOT EXISTS imports (
      id TEXT PRIMARY KEY,
      file_name TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS contacts (
      id TEXT PRIMARY KEY,
      source TEXT NOT NULL,
      import_id TEXT REFERENCES imports(id) ON DELETE SET NULL,
      first_name TEXT NOT NULL DEFAULT '',
      last_name TEXT NOT NULL DEFAULT '',
      full_name TEXT NOT NULL DEFAULT '',
      title TEXT NOT NULL DEFAULT '',
      company_name TEXT NOT NULL DEFAULT '',
      linkedin_url TEXT,
      linkedin_public_url TEXT,
      corporate_email TEXT,
      linkedin_email TEXT,
      phone TEXT,
      location TEXT,
      city TEXT,
      country TEXT,
      company_website TEXT,
      last_action TEXT,
      last_action_at TEXT,
      organization_type TEXT,
      buying_group TEXT,
      account_summary TEXT,
      role_summary TEXT,
      research_summary TEXT,
      pain_points JSONB NOT NULL DEFAULT '[]'::jsonb,
      goals JSONB NOT NULL DEFAULT '[]'::jsonb,
      objections JSONB NOT NULL DEFAULT '[]'::jsonb,
      talking_points JSONB NOT NULL DEFAULT '[]'::jsonb,
      personalization_anchors JSONB NOT NULL DEFAULT '[]'::jsonb,
      source_evidence JSONB NOT NULL DEFAULT '[]'::jsonb,
      outreach_subject TEXT,
      outreach_body TEXT,
      outreach_channel TEXT,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  return db;
}

export async function getDb() {
  if (!globalThis.__leadIntelDb) {
    globalThis.__leadIntelDb = initDatabase();
  }

  return globalThis.__leadIntelDb;
}

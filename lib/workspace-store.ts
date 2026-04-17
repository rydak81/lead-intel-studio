import { randomUUID } from "node:crypto";

import { getDb } from "@/lib/database";
import { parseLeadExportCsv } from "@/lib/csv";
import { enrichContact, generateOutreachDraft } from "@/lib/workflows";
import type { ContactRecord, LeadWorkspaceSnapshot } from "@/lib/types";

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

type ContactRow = {
  id: string;
  source: string;
  first_name: string;
  last_name: string;
  full_name: string;
  title: string;
  company_name: string;
  linkedin_url: string | null;
  linkedin_public_url: string | null;
  corporate_email: string | null;
  linkedin_email: string | null;
  phone: string | null;
  location: string | null;
  city: string | null;
  country: string | null;
  company_website: string | null;
  last_action: string | null;
  last_action_at: string | null;
  organization_type: string | null;
  buying_group: string | null;
  account_summary: string | null;
  role_summary: string | null;
  research_summary: string | null;
  pain_points: string[] | null;
  goals: string[] | null;
  objections: string[] | null;
  talking_points: string[] | null;
  personalization_anchors: string[] | null;
  source_evidence: string[] | null;
  outreach_subject: string | null;
  outreach_body: string | null;
  outreach_channel: string | null;
  created_at: string;
  updated_at: string;
};

function mapRowToContact(row: ContactRow): ContactRecord {
  return {
    id: row.id,
    source: row.source as ContactRecord["source"],
    firstName: row.first_name,
    lastName: row.last_name,
    fullName: row.full_name,
    title: row.title,
    companyName: row.company_name,
    linkedinUrl: row.linkedin_url ?? undefined,
    linkedinPublicUrl: row.linkedin_public_url ?? undefined,
    corporateEmail: row.corporate_email ?? undefined,
    linkedinEmail: row.linkedin_email ?? undefined,
    phone: row.phone ?? undefined,
    location: row.location ?? undefined,
    city: row.city ?? undefined,
    country: row.country ?? undefined,
    companyWebsite: row.company_website ?? undefined,
    lastAction: row.last_action ?? undefined,
    lastActionAt: row.last_action_at ?? undefined
  };
}

export async function importContactsFromCsv(input: { csvText: string; fileName: string }) {
  if (!input.csvText.trim()) {
    throw new ValidationError("The uploaded CSV file is empty.");
  }

  const parsedContacts = parseLeadExportCsv(input.csvText);

  if (!parsedContacts.length) {
    throw new ValidationError(
      "No importable rows were found. The CSV must include First name, Last name, or Company columns."
    );
  }

  const db = await getDb();
  const importId = randomUUID();

  await db.query("INSERT INTO imports (id, file_name) VALUES ($1, $2)", [importId, input.fileName]);

  let importedCount = 0;
  const failures: string[] = [];

  for (const contact of parsedContacts) {
    try {
      const enriched = await enrichContact(contact);

      await db.query(
      `
        INSERT INTO contacts (
          id, source, import_id, first_name, last_name, full_name, title, company_name,
          linkedin_url, linkedin_public_url, corporate_email, linkedin_email, phone, location,
          city, country, company_website, last_action, last_action_at, organization_type,
          buying_group, account_summary, role_summary, research_summary, pain_points, goals,
          objections, talking_points, personalization_anchors, source_evidence, updated_at
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8,
          $9, $10, $11, $12, $13, $14,
          $15, $16, $17, $18, $19, $20,
          $21, $22, $23, $24, $25::jsonb, $26::jsonb,
          $27::jsonb, $28::jsonb, $29::jsonb, $30::jsonb, NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
          source = EXCLUDED.source,
          import_id = EXCLUDED.import_id,
          first_name = EXCLUDED.first_name,
          last_name = EXCLUDED.last_name,
          full_name = EXCLUDED.full_name,
          title = EXCLUDED.title,
          company_name = EXCLUDED.company_name,
          linkedin_url = EXCLUDED.linkedin_url,
          linkedin_public_url = EXCLUDED.linkedin_public_url,
          corporate_email = EXCLUDED.corporate_email,
          linkedin_email = EXCLUDED.linkedin_email,
          phone = EXCLUDED.phone,
          location = EXCLUDED.location,
          city = EXCLUDED.city,
          country = EXCLUDED.country,
          company_website = EXCLUDED.company_website,
          last_action = EXCLUDED.last_action,
          last_action_at = EXCLUDED.last_action_at,
          organization_type = EXCLUDED.organization_type,
          buying_group = EXCLUDED.buying_group,
          account_summary = EXCLUDED.account_summary,
          role_summary = EXCLUDED.role_summary,
          research_summary = EXCLUDED.research_summary,
          pain_points = EXCLUDED.pain_points,
          goals = EXCLUDED.goals,
          objections = EXCLUDED.objections,
          talking_points = EXCLUDED.talking_points,
          personalization_anchors = EXCLUDED.personalization_anchors,
          source_evidence = EXCLUDED.source_evidence,
          updated_at = NOW()
      `,
      [
        contact.id,
        contact.source,
        importId,
        contact.firstName,
        contact.lastName,
        contact.fullName,
        contact.title,
        contact.companyName,
        contact.linkedinUrl ?? null,
        contact.linkedinPublicUrl ?? null,
        contact.corporateEmail ?? null,
        contact.linkedinEmail ?? null,
        contact.phone ?? null,
        contact.location ?? null,
        contact.city ?? null,
        contact.country ?? null,
        contact.companyWebsite ?? null,
        contact.lastAction ?? null,
        contact.lastActionAt ?? null,
        enriched.organizationType,
        enriched.buyingGroup,
        enriched.accountSummary,
        enriched.roleSummary,
        enriched.researchSummary,
        JSON.stringify(enriched.painPoints),
        JSON.stringify(enriched.goals),
        JSON.stringify(enriched.objections),
        JSON.stringify(enriched.talkingPoints),
        JSON.stringify(enriched.personalizationAnchors),
        JSON.stringify(enriched.sourceEvidence)
      ]
    );
      importedCount += 1;
    } catch (error) {
      const label = contact.fullName || contact.companyName || contact.id;
      console.error(`Failed to persist contact ${label}:`, error);
      failures.push(label);
    }
  }

  return {
    importId,
    importedCount,
    skippedCount: failures.length,
    skipped: failures
  };
}

export async function generateDraftsForContacts(contactIds: string[]) {
  const db = await getDb();

  const ids = contactIds.length ? contactIds : (await listContactIds());
  const results: string[] = [];

  for (const contactId of ids) {
    const rowResult = await db.query<ContactRow>("SELECT * FROM contacts WHERE id = $1", [contactId]);
    const row = rowResult.rows[0];
    if (!row) {
      continue;
    }

    const draft = await generateOutreachDraft(mapRowToContact(row), {
      organizationType: row.organization_type ?? "unknown",
      buyingGroup: row.buying_group ?? "unknown",
      accountSummary: row.account_summary ?? "",
      roleSummary: row.role_summary ?? "",
      researchSummary: row.research_summary ?? "",
      painPoints: row.pain_points ?? [],
      goals: row.goals ?? [],
      objections: row.objections ?? [],
      talkingPoints: row.talking_points ?? [],
      personalizationAnchors: row.personalization_anchors ?? []
    });

    await db.query(
      `
        UPDATE contacts
        SET outreach_subject = $2,
            outreach_body = $3,
            outreach_channel = $4,
            personalization_anchors = $5::jsonb,
            updated_at = NOW()
        WHERE id = $1
      `,
      [
        contactId,
        draft.subjectLine,
        draft.body,
        draft.channel,
        JSON.stringify(draft.personalizationAnchors)
      ]
    );

    results.push(contactId);
  }

  return { updatedCount: results.length };
}

async function listContactIds() {
  const db = await getDb();
  const result = await db.query<{ id: string }>("SELECT id FROM contacts ORDER BY created_at DESC");
  return result.rows.map((row) => row.id);
}

export async function getWorkspaceSnapshot(): Promise<LeadWorkspaceSnapshot> {
  const db = await getDb();
  const result = await db.query<ContactRow>(`
    SELECT * FROM contacts
    ORDER BY updated_at DESC, created_at DESC
  `);

  const contacts = result.rows.map(mapRowToContact);

  return {
    contacts,
    accountResearch: dedupeAccounts(result.rows),
    prospectResearch: result.rows.map((row) => ({
      contactId: row.id,
      roleSummary: row.role_summary ?? "",
      likelyGoals: row.goals ?? [],
      likelyObjections: row.objections ?? [],
      talkingPoints: row.talking_points ?? [],
      buyingGroup: (row.buying_group ?? "unknown") as LeadWorkspaceSnapshot["prospectResearch"][number]["buyingGroup"],
      confidence: 0.72
    })),
    drafts: result.rows
      .filter((row) => row.outreach_subject && row.outreach_body)
      .map((row) => ({
        contactId: row.id,
        channel: (row.outreach_channel ?? "gmail") as LeadWorkspaceSnapshot["drafts"][number]["channel"],
        subjectLine: row.outreach_subject ?? "",
        opener: "",
        body: row.outreach_body ?? "",
        callToAction: "",
        personalizationAnchors: row.personalization_anchors ?? []
      }))
  };
}

function dedupeAccounts(rows: ContactRow[]) {
  const byCompany = new Map<string, ContactRow>();

  for (const row of rows) {
    const key = row.company_name.trim().toLowerCase();
    if (!byCompany.has(key)) {
      byCompany.set(key, row);
    }
  }

  return Array.from(byCompany.values()).map((row) => ({
    companyName: row.company_name,
    website: row.company_website ?? undefined,
    organizationType: (row.organization_type ?? "unknown") as LeadWorkspaceSnapshot["accountResearch"][number]["organizationType"],
    marketplaceSignals: row.source_evidence ?? [],
    businessSummary: row.account_summary ?? "",
    painPoints: row.pain_points ?? [],
    triggers: row.goals ?? [],
    confidence: 0.72
  }));
}

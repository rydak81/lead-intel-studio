# Lead Intel Studio

Lead Intel Studio is a starter app for a custom lead-research and outreach system. It now includes a working CSV upload flow that persists imported contacts, enriches each record, groups account intelligence, and lets you generate outreach drafts for selected contacts or the full workspace.

## Why this approach

This should be a normal application, not an OpenClaw-first automation stack.

- CRM data, message approvals, and outbound controls benefit from explicit roles, logs, and database records.
- The AI layer should be swappable so you can use OpenAI, Anthropic, or both depending on cost and quality.
- Dripify works well as an execution channel, but the core system of record should stay in your app.

## Current MVP contents

- A workspace dashboard in [`app/page.tsx`](/Users/rdacus/Downloads/lead-intel-studio/app/page.tsx)
- A client-side import and selection UI in [`app/workspace-client.tsx`](/Users/rdacus/Downloads/lead-intel-studio/app/workspace-client.tsx)
- A sample JSON blueprint route in [`app/api/blueprint/route.ts`](/Users/rdacus/Downloads/lead-intel-studio/app/api/blueprint/route.ts)
- A CSV import route in [`app/api/contacts/import/route.ts`](/Users/rdacus/Downloads/lead-intel-studio/app/api/contacts/import/route.ts)
- A draft-generation route in [`app/api/drafts/generate/route.ts`](/Users/rdacus/Downloads/lead-intel-studio/app/api/drafts/generate/route.ts)
- CSV parsing logic based on your export shape in [`lib/csv.ts`](/Users/rdacus/Downloads/lead-intel-studio/lib/csv.ts)
- A local persisted data store in [`lib/database.ts`](/Users/rdacus/Downloads/lead-intel-studio/lib/database.ts)
- Workspace persistence and query logic in [`lib/workspace-store.ts`](/Users/rdacus/Downloads/lead-intel-studio/lib/workspace-store.ts)
- Domain types for contacts, research, and drafts in [`lib/types.ts`](/Users/rdacus/Downloads/lead-intel-studio/lib/types.ts)
- Heuristic grouping and classification logic in [`lib/pipeline.ts`](/Users/rdacus/Downloads/lead-intel-studio/lib/pipeline.ts)
- AI and fallback workflow logic in [`lib/workflows.ts`](/Users/rdacus/Downloads/lead-intel-studio/lib/workflows.ts)

## Recommended production architecture

1. Ingestion
   - CSV upload for lead exports and account exports.
   - Salesforce OAuth app plus REST API for smaller syncs and Bulk API 2.0 for larger pulls.
2. Data model
   - `accounts`
   - `contacts`
   - `research_runs`
   - `source_evidence`
   - `buying_groups`
   - `message_drafts`
   - `campaigns`
   - `engagement_events`
3. Research pipeline
   - Normalize records.
   - Resolve account domain and LinkedIn identity.
   - Gather company and prospect facts with evidence links.
   - Classify organization type and buying group.
   - Generate outreach messaging from approved playbooks.
4. Execution
   - Gmail draft or send support with approval states.
   - Dripify CSV export so the sequencing engine stays consistent with your LinkedIn workflow.
   - Salesforce task and note writeback.
5. Feedback loop
   - Capture opens, replies, booked meetings, and opportunities.
   - Score which combinations of title, organization type, opener, and CTA are converting.

## Suggested next implementation steps

1. Add database storage and auth.
2. Replace heuristic enrichment with a queued worker that calls the model provider and web research provider.
3. Add Salesforce OAuth and contact sync.
4. Add Gmail draft creation and send approval.
5. Add a Dripify CSV formatter for campaign uploads.

## Setup

1. Install dependencies:

```bash
pnpm install
```

2. Start the app:

```bash
pnpm dev
```

3. Open `http://localhost:3000`.

## CSV workflow

1. Open the app.
2. Upload a lead export CSV from the workspace.
3. The contacts are parsed, enriched, and stored in the local app database under `.data/lead-intel-studio`.
4. Select one or more contacts.
5. Generate outreach drafts for the selected contacts or for the full imported set.

## AI configuration

- If `OPENAI_API_KEY` is set, outreach generation uses OpenAI.
- If `OPENAI_ENABLE_WEB_RESEARCH=true`, OpenAI web search is also enabled for the request.
- If no API key is set, the app falls back to built-in heuristic enrichment and drafting.

## Current persistence note

- Local development persists to `.data/lead-intel-studio`.
- On Vercel this MVP uses `/tmp/lead-intel-studio`, which is useful for demo flows but not durable storage.
- For durable production persistence, the next step is swapping the local PGlite store for Neon or another hosted Postgres database.

## Current recommendation on tooling

- Best core build choice: custom app with provider-swappable AI orchestration.
- Best AI setup: keep OpenAI and Anthropic both available behind a common interface.
- Best outreach execution mix: Gmail for direct email drafts and Dripify for LinkedIn-centric sequencing.
- Best immediate input path: CSV first, then Salesforce sync once schema and approval flow are settled.

## Important guardrails

- Store evidence links for every enrichment claim.
- Separate confirmed facts from model inference.
- Keep a human approval step before first-touch sends.
- Rate-limit outreach and monitor bounce or spam signals.
- Keep compliance review in scope for CAN-SPAM, privacy, and platform usage policies.

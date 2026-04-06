# Lead Intel Studio

Lead Intel Studio is a starter app for a custom lead-research and outreach system. It is designed to ingest contacts from a CSV export today, add Salesforce import next, enrich each account and prospect, classify the buying committee, and produce reviewed outreach drafts for Gmail or Dripify workflows.

## Why this approach

This should be a normal application, not an OpenClaw-first automation stack.

- CRM data, message approvals, and outbound controls benefit from explicit roles, logs, and database records.
- The AI layer should be swappable so you can use OpenAI, Anthropic, or both depending on cost and quality.
- Dripify works well as an execution channel, but the core system of record should stay in your app.

## Current MVP contents

- A dashboard in [`app/page.tsx`](/Users/rdacus/Downloads/lead-intel-studio/app/page.tsx)
- A sample JSON blueprint route in [`app/api/blueprint/route.ts`](/Users/rdacus/Downloads/lead-intel-studio/app/api/blueprint/route.ts)
- CSV parsing logic based on your export shape in [`lib/csv.ts`](/Users/rdacus/Downloads/lead-intel-studio/lib/csv.ts)
- Domain types for contacts, research, and drafts in [`lib/types.ts`](/Users/rdacus/Downloads/lead-intel-studio/lib/types.ts)
- Heuristic grouping and classification logic in [`lib/pipeline.ts`](/Users/rdacus/Downloads/lead-intel-studio/lib/pipeline.ts)
- Starter research and messaging prompts in [`lib/prompts.ts`](/Users/rdacus/Downloads/lead-intel-studio/lib/prompts.ts)

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

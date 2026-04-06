# System Design

## Product recommendation

Build this as a custom application with a swappable AI layer.

- Use the app as the system of record for contacts, accounts, research evidence, approval states, drafts, and campaign outcomes.
- Use OpenAI or Anthropic behind a provider interface, not as the entire operating system.
- Use Dripify and Gmail as execution channels, not as the place where research and decisioning lives.

## Best-fit stack

- Frontend and orchestration: Next.js App Router
- Database: Postgres
- Jobs: background queue for enrichment and draft generation
- Auth: Google or work-email auth
- AI provider abstraction: one interface with OpenAI and Anthropic adapters
- Research inputs: company site, LinkedIn profile data, CRM context, and approved web research sources
- Outreach outputs: Gmail drafts, Dripify CSV exports, and Salesforce task or note writeback

## Data model

- `accounts`
- `contacts`
- `contact_identities`
- `research_runs`
- `source_evidence`
- `classifications`
- `buying_committees`
- `playbooks`
- `message_drafts`
- `campaigns`
- `engagement_events`

## Research pipeline

1. Import leads from CSV or Salesforce.
2. Normalize and deduplicate contact and account records.
3. Resolve website, LinkedIn profile, and account ownership.
4. Collect source-backed company facts.
5. Collect source-backed role and prospect facts.
6. Classify organization type.
7. Classify buying group and group contacts by account team.
8. Generate outreach drafts from approved playbooks.
9. Route to approval queue.
10. Send or export to channel.
11. Capture reply and conversion outcomes.

## Channel strategy

### Gmail

- Best for direct email drafts and controlled sending.
- Start with draft creation only.
- Add sending only after you have rate limits, suppression logic, and bounce monitoring.

### Dripify

- Best for LinkedIn-centric execution.
- Feed it CSV-ready lead exports and approved message variants.
- Ingest performance back into your app so testing results are preserved centrally.

### Salesforce

- Best as upstream CRM and downstream activity log.
- Pull contacts, accounts, owners, and status fields in.
- Write tasks, notes, and opportunity signals back.

## Message-generation rules

- Keep separate playbooks by title, industry, and organization type.
- Require a factual anchor for every opener.
- Generate short variants, not one long sequence only.
- Score messages against clarity, specificity, and relevance.
- Keep first-touch drafts under a strict approval workflow.

## Features that will matter fast

- Research evidence viewer
- Manual approve or reject queue
- Reply sentiment and intent classifier
- Duplicate detection across imports
- Campaign experiment tracking
- Deliverability health dashboard
- Account map showing everyone imported at the same company

## Suggested milestones

### Milestone 1

- CSV import
- Contact and account normalization
- Heuristic classification
- Manual draft generation
- Gmail draft export

### Milestone 2

- Salesforce sync
- Source-backed enrichment jobs
- Buying committee detection
- Playbook-based message generation
- Dripify export formatter

### Milestone 3

- Approval workflow
- Reply handling
- Outcome scoring
- CRM writeback
- Experiment reporting

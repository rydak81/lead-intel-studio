import { sampleWorkspace } from "@/lib/sample-data";

export const implementationBlueprint = {
  productDecision: {
    recommendation: "custom_app",
    reason:
      "A standard app gives you cleaner control over imports, approvals, audit trails, and outbound safety than an automation-first agent shell."
  },
  connectors: {
    csv: {
      phase: "now",
      status: "implemented_in_mvp",
      notes: "Supports your exported lead shape and can be extended for account-level CSV imports."
    },
    salesforce: {
      phase: "next",
      status: "planned",
      notes:
        "Use REST API for smaller syncs and Bulk API 2.0 for larger asynchronous pulls. Mirror Contacts, Accounts, Tasks, and custom outreach fields."
    },
    gmail: {
      phase: "next",
      status: "planned",
      notes:
        "Default to draft creation first, then move to controlled sends after approval rules, throttling, and deliverability monitoring are in place."
    },
    dripify: {
      phase: "next",
      status: "planned",
      notes:
        "Use CSV-oriented campaign handoff and performance ingestion so Dripify stays the execution layer rather than the source of truth."
    }
  },
  researchPipeline: [
    "Import and normalize contacts and accounts",
    "Resolve company domain, LinkedIn identity, and dedupe",
    "Collect source-backed account research",
    "Collect source-backed prospect research",
    "Classify organization type and buying group",
    "Group contacts into buying committees by account",
    "Generate email and LinkedIn draft variants from approved playbooks",
    "Log outcomes and feed wins back into the scoring layer"
  ],
  recommendedFeatures: [
    "Human approval queue for first-touch outreach",
    "Evidence store for every enrichment statement",
    "Campaign experiments with versioned messaging",
    "Reply classification and Salesforce writeback",
    "Deliverability and throttling guardrails",
    "Role and industry playbooks for marketplace selling"
  ],
  sampleWorkspace
};

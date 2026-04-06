import type {
  AccountResearch,
  BuyingGroup,
  ContactRecord,
  LeadWorkspaceSnapshot,
  OrganizationType,
  OutreachDraft,
  ProspectResearch
} from "@/lib/types";

const executiveTitles = ["chief", "ceo", "founder", "owner", "president"];
const operationsTitles = ["operations", "operator", "supply chain", "logistics"];
const ecommerceTitles = ["ecommerce", "marketplace", "amazon", "walmart", "digital"];
const financeTitles = ["finance", "cfo", "controller"];
const marketingTitles = ["marketing", "growth", "brand"];
const partnershipsTitles = ["partnership", "business development", "alliances"];

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export function inferOrganizationType(contact: ContactRecord): OrganizationType {
  const haystack = normalize(`${contact.companyName} ${contact.title} ${contact.companyWebsite ?? ""}`);

  if (haystack.includes("agency")) {
    return "agency";
  }
  if (haystack.includes("aggregator") || haystack.includes("portfolio")) {
    return "aggregator";
  }
  if (haystack.includes("software") || haystack.includes("platform")) {
    return "software";
  }
  if (haystack.includes("reseller") || haystack.includes("distributor")) {
    return "reseller";
  }
  if (haystack.includes("marketplace") || haystack.includes("amazon")) {
    return "marketplace_service_provider";
  }
  if (contact.companyWebsite) {
    return "brand";
  }

  return "unknown";
}

export function inferBuyingGroup(title: string): BuyingGroup {
  const normalized = normalize(title);

  if (executiveTitles.some((token) => normalized.includes(token))) {
    return "executive";
  }
  if (operationsTitles.some((token) => normalized.includes(token))) {
    return "operations";
  }
  if (ecommerceTitles.some((token) => normalized.includes(token))) {
    return "ecommerce";
  }
  if (financeTitles.some((token) => normalized.includes(token))) {
    return "finance";
  }
  if (marketingTitles.some((token) => normalized.includes(token))) {
    return "marketing";
  }
  if (partnershipsTitles.some((token) => normalized.includes(token))) {
    return "partnerships";
  }

  return "unknown";
}

export function buildAccountResearch(contacts: ContactRecord[]): AccountResearch[] {
  const grouped = new Map<string, ContactRecord[]>();

  for (const contact of contacts) {
    const key = contact.companyName.trim().toLowerCase();
    const bucket = grouped.get(key) ?? [];
    bucket.push(contact);
    grouped.set(key, bucket);
  }

  return Array.from(grouped.values()).map((companyContacts) => {
    const anchor = companyContacts[0];
    const organizationType = inferOrganizationType(anchor);
    const titles = companyContacts.map((item) => item.title).filter(Boolean);

    return {
      companyName: anchor.companyName,
      website: anchor.companyWebsite,
      organizationType,
      marketplaceSignals: [
        "Has marketplace-related role titles or company descriptors",
        "Needs audit of channel mix, retail media, and content operations"
      ],
      businessSummary: `${anchor.companyName} appears to be a ${organizationType.replaceAll("_", " ")} with ${companyContacts.length} tracked contact${companyContacts.length === 1 ? "" : "s"} in this workspace.`,
      painPoints: [
        "Marketplace channel performance is often fragmented across teams and tools",
        "Leadership usually lacks a single operating view across content, pricing, and fulfillment"
      ],
      triggers: titles.length
        ? [`Buying committee detected across roles: ${titles.join(", ")}`]
        : ["No internal buying committee pattern has been confirmed yet"],
      confidence: 0.56
    };
  });
}

export function buildProspectResearch(contacts: ContactRecord[]): ProspectResearch[] {
  return contacts.map((contact) => {
    const buyingGroup = inferBuyingGroup(contact.title);

    return {
      contactId: contact.id,
      roleSummary: `${contact.fullName || "This contact"} likely influences ${buyingGroup === "unknown" ? "commercial" : buyingGroup} decisions for ${contact.companyName}.`,
      likelyGoals: [
        "Grow sales on Amazon, Walmart, and other marketplaces",
        "Reduce operational drag across catalog, pricing, and reporting"
      ],
      likelyObjections: [
        "Concerned another vendor will add complexity instead of clarity",
        "May believe current agency or internal team already covers the problem"
      ],
      talkingPoints: [
        "Lead with a company-specific observation rather than a product pitch",
        "Anchor the message in measurable marketplace outcomes and team efficiency"
      ],
      buyingGroup,
      confidence: 0.58
    };
  });
}

export function buildOutreachDrafts(contacts: ContactRecord[]): OutreachDraft[] {
  return contacts.map((contact) => ({
    contactId: contact.id,
    channel: contact.corporateEmail ? "gmail" : "dripify",
    subjectLine: `${contact.companyName} marketplace growth idea`,
    opener: `I spent time looking at ${contact.companyName} and wanted to reach out with one specific marketplace growth angle.`,
    body: `${contact.firstName || "There"} seems to be an opportunity to tighten how ${contact.companyName} handles marketplace execution across visibility, conversion, and operational follow-through. I put together a short perspective on what teams in similar roles typically improve first and where quick wins often show up.`,
    callToAction: "Would it be useful if I sent over the tailored version for your team?",
    personalizationAnchors: [
      contact.title,
      contact.companyName,
      contact.location ?? "location not yet enriched"
    ].filter(Boolean)
  }));
}

export function buildWorkspaceSnapshot(contacts: ContactRecord[]): LeadWorkspaceSnapshot {
  return {
    contacts,
    accountResearch: buildAccountResearch(contacts),
    prospectResearch: buildProspectResearch(contacts),
    drafts: buildOutreachDrafts(contacts)
  };
}

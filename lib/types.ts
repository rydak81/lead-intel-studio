export type ImportSource = "csv" | "salesforce";

export type ResearchStatus = "queued" | "running" | "complete" | "blocked";

export type OrganizationType =
  | "brand"
  | "agency"
  | "aggregator"
  | "reseller"
  | "software"
  | "marketplace_service_provider"
  | "unknown";

export type BuyingGroup =
  | "executive"
  | "operations"
  | "ecommerce"
  | "marketing"
  | "finance"
  | "partnerships"
  | "unknown";

export type OutreachChannel = "gmail" | "dripify" | "salesforce_task";

export interface ContactRecord {
  id: string;
  source: ImportSource;
  firstName: string;
  lastName: string;
  fullName: string;
  title: string;
  companyName: string;
  linkedinUrl?: string;
  linkedinPublicUrl?: string;
  corporateEmail?: string;
  linkedinEmail?: string;
  phone?: string;
  location?: string;
  city?: string;
  country?: string;
  companyWebsite?: string;
  lastAction?: string;
  lastActionAt?: string;
}

export interface AccountResearch {
  companyName: string;
  website?: string;
  organizationType: OrganizationType;
  marketplaceSignals: string[];
  businessSummary: string;
  painPoints: string[];
  triggers: string[];
  confidence: number;
}

export interface ProspectResearch {
  contactId: string;
  roleSummary: string;
  likelyGoals: string[];
  likelyObjections: string[];
  talkingPoints: string[];
  buyingGroup: BuyingGroup;
  confidence: number;
}

export interface OutreachDraft {
  contactId: string;
  channel: OutreachChannel;
  subjectLine: string;
  opener: string;
  body: string;
  callToAction: string;
  personalizationAnchors: string[];
}

export interface LeadWorkspaceSnapshot {
  contacts: ContactRecord[];
  accountResearch: AccountResearch[];
  prospectResearch: ProspectResearch[];
  drafts: OutreachDraft[];
}

import { inferBuyingGroup, inferOrganizationType } from "@/lib/pipeline";
import { createOpenAiText, isOpenAiConfigured } from "@/lib/openai";
import type { ContactRecord, OutreachChannel } from "@/lib/types";

type EnrichedContact = {
  organizationType: string;
  buyingGroup: string;
  accountSummary: string;
  roleSummary: string;
  researchSummary: string;
  painPoints: string[];
  goals: string[];
  objections: string[];
  talkingPoints: string[];
  personalizationAnchors: string[];
  sourceEvidence: string[];
};

type DraftInput = {
  organizationType: string;
  buyingGroup: string;
  accountSummary: string;
  roleSummary: string;
  researchSummary: string;
  painPoints: string[];
  goals: string[];
  objections: string[];
  talkingPoints: string[];
  personalizationAnchors: string[];
};

function defaultPainPoints(contact: ContactRecord) {
  return [
    `${contact.companyName} may be juggling marketplace growth and execution across multiple people or tools.`,
    "Cold outreach is more likely to land if it offers a concrete operational or revenue insight."
  ];
}

export async function enrichContact(contact: ContactRecord): Promise<EnrichedContact> {
  const organizationType = inferOrganizationType(contact);
  const buyingGroup = inferBuyingGroup(contact.title);
  const base = {
    organizationType,
    buyingGroup,
    accountSummary: `${contact.companyName} appears to be a ${organizationType.replaceAll("_", " ")} that could benefit from more coordinated marketplace execution.`,
    roleSummary: `${contact.fullName || "This contact"} likely influences ${buyingGroup.replaceAll("_", " ")} decisions at ${contact.companyName}.`,
    researchSummary: `${contact.companyName} and ${contact.fullName || "this contact"} were imported from your lead list and enriched from known fields like title, company, website, and location.`,
    painPoints: defaultPainPoints(contact),
    goals: [
      "Increase qualified marketplace pipeline or conversion",
      "Improve visibility into catalog, pricing, content, and operations"
    ],
    objections: [
      "May already have an agency or internal team handling marketplace work",
      "May worry that another vendor adds noise instead of a clear operating plan"
    ],
    talkingPoints: [
      "Lead with one relevant marketplace insight, not a broad pitch",
      "Map the message to the contact's likely operating goals and buying group"
    ],
    personalizationAnchors: [contact.companyName, contact.title, contact.location].filter(
      (value): value is string => Boolean(value)
    ),
    sourceEvidence: [
      `Imported title: ${contact.title || "not provided"}`,
      `Imported company: ${contact.companyName}`,
      `Imported website: ${contact.companyWebsite || "not provided"}`
    ]
  };

  if (!isOpenAiConfigured()) {
    return base;
  }

  try {
    const aiSummary = await createOpenAiText(`
You are enriching a B2B marketplace-selling lead from imported CRM-style fields.

Return a concise research brief in plain text with these sections:
Account summary:
Role summary:
Research summary:
Pain points:
Goals:
Objections:
Talking points:

Contact:
- Name: ${contact.fullName}
- Title: ${contact.title}
- Company: ${contact.companyName}
- Website: ${contact.companyWebsite ?? "Unknown"}
- Location: ${contact.location ?? "Unknown"}
- Corporate email: ${contact.corporateEmail ?? "Unknown"}

Keep it specific, grounded, and useful for cold outreach.
`);

    return {
      ...base,
      researchSummary: aiSummary || base.researchSummary
    };
  } catch {
    return base;
  }
}

export async function generateOutreachDraft(contact: ContactRecord, input: DraftInput) {
  const channel: OutreachChannel = contact.corporateEmail ? "gmail" : "dripify";

  if (!isOpenAiConfigured()) {
    return {
      contactId: contact.id,
      channel,
      subjectLine: `${contact.companyName} marketplace growth idea`,
      opener: `I spent a little time looking at ${contact.companyName} and wanted to share one marketplace angle that seems relevant to your team.`,
      body: `Hi ${contact.firstName || "there"},\n\n${input.accountSummary} ${input.roleSummary}\n\nFrom the way your role is framed, I would guess a few priorities matter most right now: ${input.goals.slice(0, 2).join("; ")}.\n\nA useful first conversation would be around where marketplace execution tends to break down across content, pricing, reporting, and operational follow-through, and what that means for growth.\n\nWould it be helpful if I sent over a short tailored perspective for ${contact.companyName}?`,
      callToAction: "Would it be helpful if I sent over a short tailored perspective?",
      personalizationAnchors: input.personalizationAnchors
    };
  }

  try {
    const draftText = await createOpenAiText(`
Write one concise cold outreach email for this contact.

Requirements:
- Respectful, specific, and conversion-oriented
- No hype or fake urgency
- 120 to 170 words
- Use the supplied context only
- End with a low-friction CTA
- First line must feel personalized

Contact:
- Name: ${contact.fullName}
- Title: ${contact.title}
- Company: ${contact.companyName}

Context:
- Organization type: ${input.organizationType}
- Buying group: ${input.buyingGroup}
- Account summary: ${input.accountSummary}
- Role summary: ${input.roleSummary}
- Research summary: ${input.researchSummary}
- Pain points: ${input.painPoints.join("; ")}
- Goals: ${input.goals.join("; ")}
- Objections: ${input.objections.join("; ")}
- Talking points: ${input.talkingPoints.join("; ")}

Return plain text in this exact format:
Subject: ...

Body:
...
`);

    const [subjectLine = `${contact.companyName} marketplace growth idea`, ...rest] =
      draftText.split("\n");
    const cleanedSubject = subjectLine.replace(/^Subject:\s*/i, "").trim();
    const cleanedBody = rest.join("\n").replace(/^Body:\s*/i, "").trim();

    return {
      contactId: contact.id,
      channel,
      subjectLine: cleanedSubject || `${contact.companyName} marketplace growth idea`,
      opener: "",
      body: cleanedBody || draftText,
      callToAction: "Would it be worth sending over a tailored perspective?",
      personalizationAnchors: input.personalizationAnchors
    };
  } catch {
    return {
      contactId: contact.id,
      channel,
      subjectLine: `${contact.companyName} marketplace growth idea`,
      opener: "",
      body: `Hi ${contact.firstName || "there"},\n\n${input.accountSummary} ${input.roleSummary}\n\nI thought it might be useful to reach out because teams in similar roles are often looking for a clearer operating view across marketplace performance, content, pricing, and execution. If that is relevant on your side, I can send over a short tailored point of view for ${contact.companyName}.\n\nWould that be helpful?`,
      callToAction: "Would that be helpful?",
      personalizationAnchors: input.personalizationAnchors
    };
  }
}

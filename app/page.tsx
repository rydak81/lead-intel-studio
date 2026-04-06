import { sampleWorkspace } from "@/lib/sample-data";
import { messagingPrompt, researchPrompt } from "@/lib/prompts";

const stackChoices = [
  {
    label: "Core app",
    value: "Next.js dashboard + background workers + Postgres"
  },
  {
    label: "AI layer",
    value: "Provider-swappable orchestration with OpenAI or Anthropic"
  },
  {
    label: "Import",
    value: "CSV now, Salesforce REST or Bulk API 2.0 next"
  },
  {
    label: "Research",
    value: "Company + contact enrichment, source-backed notes, confidence scoring"
  },
  {
    label: "Outbound",
    value: "Gmail drafts and Dripify CSV-ready exports with human approval"
  }
];

const featureBacklog = [
  "Approval queue before any message is sent",
  "Reply detection and CRM writeback",
  "A/B testing for subject lines and openers",
  "Deliverability scoring and throttling",
  "Buying committee maps for each account",
  "Playbook library by vertical, title, and organization type"
];

export default function Home() {
  return (
    <main className="page-shell">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Lead Research And Outreach OS</p>
          <h1>Build once, import anywhere, research deeply, and send smarter outreach.</h1>
          <p className="lede">
            This starter is designed around your workflow: pull leads from CSV or Salesforce,
            enrich the company and contact, classify the account and buying group, then produce
            high-context outreach drafts that can flow into Gmail or Dripify-friendly uploads.
          </p>
        </div>
        <div className="hero-card">
          <p className="card-kicker">Recommendation</p>
          <h2>Use a custom app, not OpenClaw, as the system backbone.</h2>
          <p>
            OpenClaw is better suited for isolated automation experiments. For CRM data, outreach
            approvals, auditability, and long-running enrichment jobs, a standard app with a
            swappable model layer is the cleaner foundation.
          </p>
        </div>
      </section>

      <section className="grid two-up">
        <article className="panel">
          <p className="section-label">Best-Fit Stack</p>
          <div className="spec-list">
            {stackChoices.map((choice) => (
              <div className="spec-row" key={choice.label}>
                <span>{choice.label}</span>
                <strong>{choice.value}</strong>
              </div>
            ))}
          </div>
        </article>

        <article className="panel">
          <p className="section-label">MVP Workflow</p>
          <ol className="flow-list">
            <li>Import contacts from CSV or Salesforce.</li>
            <li>Normalize account and prospect records.</li>
            <li>Run source-backed company and role research.</li>
            <li>Classify organization type and buying group.</li>
            <li>Group contacts by account and internal team.</li>
            <li>Generate channel-specific outreach drafts for review.</li>
          </ol>
        </article>
      </section>

      <section className="grid stats">
        <article className="metric">
          <span>Imported Contacts</span>
          <strong>{sampleWorkspace.contacts.length}</strong>
        </article>
        <article className="metric">
          <span>Accounts Grouped</span>
          <strong>{sampleWorkspace.accountResearch.length}</strong>
        </article>
        <article className="metric">
          <span>Drafts Prepared</span>
          <strong>{sampleWorkspace.drafts.length}</strong>
        </article>
      </section>

      <section className="grid two-up">
        <article className="panel">
          <p className="section-label">Sample Contacts</p>
          <div className="contact-list">
            {sampleWorkspace.contacts.map((contact) => (
              <div className="contact-card" key={contact.id}>
                <div>
                  <h3>{contact.fullName}</h3>
                  <p>{contact.title}</p>
                </div>
                <div className="meta">
                  <span>{contact.companyName}</span>
                  <span>{contact.location}</span>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="panel">
          <p className="section-label">Account Intelligence</p>
          <div className="contact-list">
            {sampleWorkspace.accountResearch.map((account) => (
              <div className="contact-card" key={account.companyName}>
                <div>
                  <h3>{account.companyName}</h3>
                  <p>{account.organizationType.replaceAll("_", " ")}</p>
                </div>
                <div className="meta">
                  <span>{account.marketplaceSignals[0]}</span>
                  <span>confidence {account.confidence}</span>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid two-up">
        <article className="panel prompt-panel">
          <p className="section-label">Research Prompt Shape</p>
          <pre>{researchPrompt}</pre>
        </article>
        <article className="panel prompt-panel">
          <p className="section-label">Messaging Prompt Shape</p>
          <pre>{messagingPrompt}</pre>
        </article>
      </section>

      <section className="grid two-up">
        <article className="panel">
          <p className="section-label">Recommended Additions</p>
          <ul className="backlog-list">
            {featureBacklog.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
        <article className="panel">
          <p className="section-label">Outbound Guardrails</p>
          <ul className="backlog-list">
            <li>Keep human approval before first-touch sends.</li>
            <li>Cap daily volume and warm domains deliberately.</li>
            <li>Separate research confidence from confirmed facts.</li>
            <li>Store source links with every enrichment result.</li>
            <li>Write engagement outcomes back into the lead record.</li>
          </ul>
        </article>
      </section>
    </main>
  );
}

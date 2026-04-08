"use client";

import { useRouter } from "next/navigation";
import { useDeferredValue, useMemo, useState, useTransition } from "react";

import type { LeadWorkspaceSnapshot } from "@/lib/types";

type Props = {
  workspace: LeadWorkspaceSnapshot;
  isOpenAiReady: boolean;
};

export function WorkspaceClient({ workspace, isOpenAiReady }: Props) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [status, setStatus] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const deferredSelectedIds = useDeferredValue(selectedIds);

  const selectedSet = useMemo(() => new Set(deferredSelectedIds), [deferredSelectedIds]);
  const contactsWithDrafts = workspace.drafts.map((draft) => draft.contactId);

  const visibleDrafts = workspace.drafts.filter((draft) =>
    selectedSet.size ? selectedSet.has(draft.contactId) : true
  );

  async function importCsv(formData: FormData) {
    setStatus("Importing contacts and enriching records...");

    const response = await fetch("/api/contacts/import", {
      method: "POST",
      body: formData
    });

    const payload = (await response.json()) as { importedCount?: number; error?: string };

    if (!response.ok) {
      setStatus(payload.error ?? "Import failed.");
      return;
    }

    startTransition(() => {
      router.refresh();
    });
    setStatus(`Imported ${payload.importedCount ?? 0} contacts.`);
  }

  async function generateDrafts(contactIds: string[]) {
    setStatus(contactIds.length ? "Generating outreach for selected contacts..." : "Generating outreach for all imported contacts...");

    const response = await fetch("/api/drafts/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ contactIds })
    });

    const payload = (await response.json()) as { updatedCount?: number; error?: string };

    if (!response.ok) {
      setStatus(payload.error ?? "Draft generation failed.");
      return;
    }

    startTransition(() => {
      router.refresh();
    });
    setStatus(`Generated ${payload.updatedCount ?? 0} outreach drafts.`);
  }

  return (
    <main className="page-shell">
      <section className="hero workspace-hero">
        <div className="hero-copy">
          <p className="eyebrow">Lead Research Workspace</p>
          <h1>Upload contacts, enrich them, and generate outreach you can select contact by contact.</h1>
          <p className="lede">
            Import a CSV, persist the contacts, classify each record, and generate tailored drafts
            for one person, a few selected contacts, or the whole workspace.
          </p>
          <div className="status-row">
            <span className={`status-pill ${isOpenAiReady ? "ready" : "offline"}`}>
              {isOpenAiReady ? "OpenAI connected" : "OpenAI not configured"}
            </span>
            <span className="status-copy">
              {isOpenAiReady
                ? "Draft generation will use the configured model."
                : "The app will use the built-in fallback drafting logic until you add an API key."}
            </span>
          </div>
        </div>

        <div className="hero-card">
          <p className="card-kicker">Upload CSV</p>
          <form
            action={(formData) => {
              void importCsv(formData);
            }}
            className="upload-form"
          >
            <label className="upload-field">
              <span>Lead export file</span>
              <input name="file" type="file" accept=".csv,text/csv" required />
            </label>
            <button className="primary-button" disabled={isPending} type="submit">
              {isPending ? "Working..." : "Import And Enrich"}
            </button>
          </form>
          <p className="helper-copy">
            Works with your current exported lead format and stores imported records in the local
            app data store.
          </p>
        </div>
      </section>

      <section className="grid stats">
        <article className="metric">
          <span>Imported Contacts</span>
          <strong>{workspace.contacts.length}</strong>
        </article>
        <article className="metric">
          <span>Accounts Grouped</span>
          <strong>{workspace.accountResearch.length}</strong>
        </article>
        <article className="metric">
          <span>Drafts Ready</span>
          <strong>{workspace.drafts.length}</strong>
        </article>
      </section>

      <section className="grid two-up">
        <article className="panel">
          <div className="panel-header">
            <div>
              <p className="section-label">Contact Workspace</p>
              <p className="panel-subcopy">Select one or multiple contacts, then generate drafts.</p>
            </div>
            <div className="panel-actions">
              <button
                className="secondary-button"
                disabled={!workspace.contacts.length || isPending}
                onClick={() => {
                  void generateDrafts(selectedIds);
                }}
                type="button"
              >
                {selectedIds.length ? `Generate For ${selectedIds.length}` : "Generate For All"}
              </button>
              <button
                className="ghost-button"
                disabled={!selectedIds.length || isPending}
                onClick={() => {
                  setSelectedIds([]);
                }}
                type="button"
              >
                Clear Selection
              </button>
            </div>
          </div>

          <div className="contact-list">
            {workspace.contacts.length ? (
              workspace.contacts.map((contact) => {
                const isSelected = selectedSet.has(contact.id);
                const hasDraft = contactsWithDrafts.includes(contact.id);

                return (
                  <label className={`contact-card selectable ${isSelected ? "selected" : ""}`} key={contact.id}>
                    <div className="select-shell">
                      <input
                        checked={isSelected}
                        onChange={(event) => {
                          setSelectedIds((current) =>
                            event.target.checked
                              ? [...current, contact.id]
                              : current.filter((item) => item !== contact.id)
                          );
                        }}
                        type="checkbox"
                      />
                    </div>
                    <div>
                      <h3>{contact.fullName || "Unnamed contact"}</h3>
                      <p>{contact.title || "Title not provided"}</p>
                    </div>
                    <div className="meta">
                      <span>{contact.companyName}</span>
                      <span>{contact.location || contact.country || "Location unavailable"}</span>
                      <span className={`mini-pill ${hasDraft ? "ready" : "offline"}`}>
                        {hasDraft ? "draft ready" : "no draft yet"}
                      </span>
                    </div>
                  </label>
                );
              })
            ) : (
              <div className="empty-state">
                <h3>No contacts imported yet</h3>
                <p>Upload a CSV to start building your lead workspace.</p>
              </div>
            )}
          </div>
        </article>

        <article className="panel">
          <p className="section-label">Account Intelligence</p>
          <div className="contact-list">
            {workspace.accountResearch.length ? (
              workspace.accountResearch.map((account) => (
                <div className="contact-card" key={account.companyName}>
                  <div>
                    <h3>{account.companyName}</h3>
                    <p>{account.organizationType.replaceAll("_", " ")}</p>
                  </div>
                  <div className="meta">
                    <span>{account.businessSummary}</span>
                    <span>{account.painPoints[0] ?? "No pain points yet"}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <h3>No account research yet</h3>
                <p>Importing contacts will also create grouped account intelligence.</p>
              </div>
            )}
          </div>
        </article>
      </section>

      <section className="grid two-up">
        <article className="panel">
          <p className="section-label">Prospect Research</p>
          <div className="draft-list">
            {workspace.prospectResearch.length ? (
              workspace.prospectResearch.map((prospect) => (
                <div className="draft-card" key={prospect.contactId}>
                  <h3>{prospect.roleSummary}</h3>
                  <p>{prospect.talkingPoints[0] ?? "Talking points will appear here."}</p>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <h3>No research entries yet</h3>
                <p>Contact enrichment will populate this panel automatically.</p>
              </div>
            )}
          </div>
        </article>

        <article className="panel">
          <p className="section-label">Outreach Drafts</p>
          <div className="draft-list">
            {visibleDrafts.length ? (
              visibleDrafts.map((draft) => (
                <div className="draft-card" key={draft.contactId}>
                  <div className="draft-header">
                    <span className="mini-pill ready">{draft.channel}</span>
                    <strong>{draft.subjectLine}</strong>
                  </div>
                  <p>{draft.body}</p>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <h3>No drafts generated yet</h3>
                <p>Select contacts and generate outreach when you are ready.</p>
              </div>
            )}
          </div>
        </article>
      </section>

      <section className="status-footer">
        <p>{status || "The workspace is ready for your first upload."}</p>
      </section>
    </main>
  );
}

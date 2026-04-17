import { WorkspaceClient } from "@/app/workspace-client";
import { isOpenAiConfigured } from "@/lib/openai";
import type { LeadWorkspaceSnapshot } from "@/lib/types";
import { getWorkspaceSnapshot } from "@/lib/workspace-store";

export const dynamic = "force-dynamic";

const emptyWorkspace: LeadWorkspaceSnapshot = {
  contacts: [],
  accountResearch: [],
  prospectResearch: [],
  drafts: []
};

export default async function Home() {
  let workspace: LeadWorkspaceSnapshot = emptyWorkspace;
  let loadError: string | null = null;

  try {
    workspace = await getWorkspaceSnapshot();
  } catch (error) {
    loadError =
      error instanceof Error
        ? error.message
        : "Unable to load workspace data from the local database.";
    console.error("Failed to load workspace snapshot:", error);
  }

  return (
    <WorkspaceClient
      isOpenAiReady={isOpenAiConfigured()}
      loadError={loadError}
      workspace={workspace}
    />
  );
}

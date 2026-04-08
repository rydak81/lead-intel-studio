import { WorkspaceClient } from "@/app/workspace-client";
import { isOpenAiConfigured } from "@/lib/openai";
import { getWorkspaceSnapshot } from "@/lib/workspace-store";

export const dynamic = "force-dynamic";

export default async function Home() {
  const workspace = await getWorkspaceSnapshot();

  return <WorkspaceClient isOpenAiReady={isOpenAiConfigured()} workspace={workspace} />;
}

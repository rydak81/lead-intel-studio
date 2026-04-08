import { NextResponse } from "next/server";

import { generateDraftsForContacts } from "@/lib/workspace-store";

export async function POST(request: Request) {
  const payload = (await request.json()) as { contactIds?: string[] };
  const result = await generateDraftsForContacts(payload.contactIds ?? []);
  return NextResponse.json(result);
}

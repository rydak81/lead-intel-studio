import { NextResponse } from "next/server";
import { z } from "zod";

import { generateDraftsForContacts } from "@/lib/workspace-store";

const requestSchema = z.object({
  contactIds: z.array(z.string().min(1)).default([])
});

export async function POST(request: Request) {
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(rawBody ?? {});
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request body.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const result = await generateDraftsForContacts(parsed.data.contactIds);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Draft generation failed:", error);
    const message =
      error instanceof Error
        ? error.message
        : "An unexpected error occurred while generating drafts.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

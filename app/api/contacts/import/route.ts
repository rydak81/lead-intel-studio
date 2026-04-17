import { NextResponse } from "next/server";

import { importContactsFromCsv, ValidationError } from "@/lib/workspace-store";

const MAX_FILE_BYTES = 10 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "A CSV file is required." }, { status: 400 });
    }

    if (file.size === 0) {
      return NextResponse.json({ error: "The uploaded file is empty." }, { status: 400 });
    }

    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json(
        { error: `File is too large. Maximum size is ${MAX_FILE_BYTES / (1024 * 1024)} MB.` },
        { status: 413 }
      );
    }

    const csvText = await file.text();
    const result = await importContactsFromCsv({
      csvText,
      fileName: file.name
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Contact import failed:", error);
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred during import.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";

import { importContactsFromCsv } from "@/lib/workspace-store";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "A CSV file is required." }, { status: 400 });
  }

  const csvText = await file.text();
  const result = await importContactsFromCsv({
    csvText,
    fileName: file.name
  });

  return NextResponse.json(result);
}

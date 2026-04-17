import { NextResponse } from "next/server";

import { implementationBlueprint } from "@/lib/blueprint";

export async function GET() {
  try {
    return NextResponse.json(implementationBlueprint);
  } catch (error) {
    console.error("Blueprint response failed:", error);
    const message =
      error instanceof Error ? error.message : "Unable to load the implementation blueprint.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

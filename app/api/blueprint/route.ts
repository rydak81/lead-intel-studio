import { NextResponse } from "next/server";

import { implementationBlueprint } from "@/lib/blueprint";

export async function GET() {
  return NextResponse.json(implementationBlueprint);
}

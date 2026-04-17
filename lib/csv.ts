import { randomUUID } from "node:crypto";

import Papa from "papaparse";
import { z } from "zod";

import type { ContactRecord } from "@/lib/types";

const exportCsvRow = z.object({
  "First name": z.string().default(""),
  "Last name": z.string().default(""),
  "LinkedIn email": z.string().optional(),
  "Corporate email": z.string().optional(),
  "Manually added email": z.string().optional(),
  "Phone number": z.string().optional(),
  Title: z.string().default(""),
  Company: z.string().default(""),
  Location: z.string().optional(),
  "Linkedin url": z.string().optional(),
  "Last action": z.string().optional(),
  "Time of last action": z.string().optional(),
  "Company website": z.string().optional(),
  "Linkedin public url": z.string().optional(),
  City: z.string().optional(),
  Country: z.string().optional()
});

const clean = (value?: string) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

export function parseLeadExportCsv(csvText: string): ContactRecord[] {
  const parsed = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true
  });

  if (parsed.errors.length && !parsed.data.length) {
    const message = parsed.errors[0]?.message ?? "Unknown CSV parsing error.";
    throw new Error(`Unable to parse CSV: ${message}`);
  }

  return parsed.data.flatMap((row) => {
    const result = exportCsvRow.safeParse(row);
    if (!result.success) {
      return [];
    }

    const firstName = result.data["First name"].trim();
    const lastName = result.data["Last name"].trim();
    const companyName = result.data.Company.trim();

    if (!firstName && !lastName && !companyName) {
      return [];
    }

    return [
      {
        id: randomUUID(),
        source: "csv",
        firstName,
        lastName,
        fullName: [firstName, lastName].filter(Boolean).join(" ").trim(),
        title: result.data.Title.trim(),
        companyName,
        linkedinUrl: clean(result.data["Linkedin url"]),
        linkedinPublicUrl: clean(result.data["Linkedin public url"]),
        corporateEmail:
          clean(result.data["Corporate email"]) ??
          clean(result.data["Manually added email"]),
        linkedinEmail: clean(result.data["LinkedIn email"]),
        phone: clean(result.data["Phone number"]),
        location: clean(result.data.Location),
        city: clean(result.data.City),
        country: clean(result.data.Country),
        companyWebsite: clean(result.data["Company website"]),
        lastAction: clean(result.data["Last action"]),
        lastActionAt: clean(result.data["Time of last action"])
      }
    ];
  });
}

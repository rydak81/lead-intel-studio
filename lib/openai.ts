const OPENAI_API_URL = "https://api.openai.com/v1/responses";

function getModel() {
  return process.env.OPENAI_MODEL ?? "gpt-4o-mini";
}

export function isOpenAiConfigured() {
  return Boolean(process.env.OPENAI_API_KEY);
}

type ResponsesPayload = {
  output_text?: string;
  output?: Array<{
    content?: Array<{ text?: string; type?: string }>;
  }>;
};

function extractOutputText(payload: ResponsesPayload): string {
  if (payload.output_text && payload.output_text.trim()) {
    return payload.output_text.trim();
  }

  const fragments: string[] = [];
  for (const item of payload.output ?? []) {
    for (const content of item.content ?? []) {
      if (content.text) {
        fragments.push(content.text);
      }
    }
  }
  return fragments.join("\n").trim();
}

export async function createOpenAiText(input: string) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  const body: Record<string, unknown> = {
    model: getModel(),
    input
  };

  if (process.env.OPENAI_ENABLE_WEB_RESEARCH === "true") {
    body.tools = [{ type: "web_search_preview" }];
  }

  let response: Response;
  try {
    response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify(body)
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown network error";
    throw new Error(`OpenAI request failed: ${message}`);
  }

  if (!response.ok) {
    let details = "";
    try {
      details = await response.text();
    } catch {
      details = "";
    }
    const snippet = details.slice(0, 500);
    throw new Error(
      `OpenAI request failed with status ${response.status}${snippet ? `: ${snippet}` : ""}`
    );
  }

  const payload = (await response.json()) as ResponsesPayload;
  return extractOutputText(payload);
}

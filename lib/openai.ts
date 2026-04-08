const OPENAI_API_URL = "https://api.openai.com/v1/responses";

function getModel() {
  return process.env.OPENAI_MODEL ?? "gpt-5-mini";
}

export function isOpenAiConfigured() {
  return Boolean(process.env.OPENAI_API_KEY);
}

export async function createOpenAiText(input: string) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  const tools = process.env.OPENAI_ENABLE_WEB_RESEARCH === "true" ? [{ type: "web_search" }] : [];

  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: getModel(),
      tools,
      input
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI request failed: ${errorText}`);
  }

  const payload = (await response.json()) as { output_text?: string };
  return payload.output_text?.trim() ?? "";
}

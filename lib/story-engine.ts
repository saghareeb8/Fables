// SERVER-ONLY. This module reads the secret OPENROUTER_API_KEY and must never
// be imported into a Client Component. It is used only by the /api route
// handlers, so the key never reaches the browser.
import type { StoryInput, StoryPlan, OpenRouterModel } from "./types";
import { getTheme, pagesForLength } from "./themes";
import { IMAGE_MODEL, FALLBACK_MODELS } from "./constants";

const BASE = "https://openrouter.ai/api/v1";

function getApiKey(): string {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) {
    throw new Error(
      "OpenRouter API key is not configured. Set OPENROUTER_API_KEY in .env.local (local) or in your Vercel project's Environment Variables."
    );
  }
  return key;
}

function headers(): Record<string, string> {
  return {
    Authorization: `Bearer ${getApiKey()}`,
    "Content-Type": "application/json",
    "HTTP-Referer": "https://github.com/saghareeb8/Fables",
    "X-Title": "Fables Bedtime Stories",
  };
}

function truncate(s: string, n = 240): string {
  return s.length > n ? s.slice(0, n) + "…" : s;
}

/** Fetch currently-available free text models (no key required). */
export async function fetchFreeModels(): Promise<OpenRouterModel[]> {
  try {
    const res = await fetch(`${BASE}/models`);
    if (!res.ok) return FALLBACK_MODELS;
    const data = await res.json();
    const models = (data.data ?? []) as Array<{
      id: string;
      name?: string;
      pricing?: { prompt?: string; completion?: string };
      architecture?: { output_modalities?: string[] };
    }>;

    const free = models
      .filter((m) => {
        const isFree =
          m.id.endsWith(":free") ||
          (m.pricing?.prompt === "0" && m.pricing?.completion === "0");
        const outputs = m.architecture?.output_modalities ?? ["text"];
        const textOut = outputs.includes("text");
        const looksUtility = /guard|safety|moderation|embed/i.test(m.id);
        return isFree && textOut && !looksUtility;
      })
      .map((m) => ({ id: m.id, name: cleanModelName(m.name ?? m.id) }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return free.length ? free : FALLBACK_MODELS;
  } catch {
    return FALLBACK_MODELS;
  }
}

function cleanModelName(name: string): string {
  return name.replace(/\s*\(free\)\s*$/i, "").trim() + " (free)";
}

function buildStoryPrompt(input: StoryInput): { system: string; user: string } {
  const theme = getTheme(input.theme);
  const pageCount = pagesForLength(input.length);
  const isArabic = input.language === "ar";

  const langRule = isArabic
    ? 'Write the "title" and every page "text" in Arabic (فصحى — Modern Standard Arabic that is simple and warm for children). Keep "artStyle", "characterDescription", and every "imagePrompt" in ENGLISH (the illustrator only understands English).'
    : "Write everything in English.";

  const system = [
    "You are a beloved children's picture-book author who writes warm, age-appropriate bedtime stories.",
    "You ALWAYS respond with a single valid JSON object and nothing else — no markdown, no code fences, no commentary.",
    "Keep all content gentle, positive, and suitable for young children. Avoid anything genuinely frightening, violent, or sad without comfort.",
  ].join(" ");

  const user = `Write a personalized bedtime picture-book story.

Child's name: ${input.childName}
Child's age: ${input.age}
Theme: ${theme.label} — make it ${theme.tone}.
What happened in the child's day (weave this gently into the story): ${input.daySummary || "a normal happy day"}

Language: ${langRule}

Requirements:
- Make ${input.childName} the hero of the story.
- Write for roughly age ${input.age}: simple, soothing language that winds down toward sleep.
- Exactly ${pageCount} pages. Each page is 2-4 short sentences.
- End calm, cozy, and reassuring (perfect for falling asleep).

Also design a consistent illustration style so every page looks like the same book:
- "artStyle": one sentence (in English) describing a single cohesive children's-book illustration style (medium, colors, mood).
- "characterDescription": a short, vivid visual description (in English) of ${input.childName} (hair, clothing, key features) so the character looks identical on every page.
- For each page, "imagePrompt": a concrete description (in English) of the scene to illustrate (do NOT restate the art style or character description — those are added automatically).

Respond with ONLY this JSON shape:
{
  "title": "string",
  "artStyle": "string",
  "characterDescription": "string",
  "pages": [ { "text": "string", "imagePrompt": "string" } ]
}`;

  return { system, user };
}

function extractJson(raw: string): StoryPlan {
  let text = raw.trim();
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) text = fence[1].trim();
  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");
  if (first !== -1 && last !== -1) text = text.slice(first, last + 1);

  const parsed = JSON.parse(text) as StoryPlan;
  if (!parsed.title || !Array.isArray(parsed.pages) || parsed.pages.length === 0) {
    throw new Error("The model returned an unexpected story format.");
  }
  return parsed;
}

/** Write the story as a structured plan using a free text model. */
export async function generateStoryPlan(input: StoryInput): Promise<StoryPlan> {
  const { system, user } = buildStoryPrompt(input);
  const res = await fetch(`${BASE}/chat/completions`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      model: input.model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.9,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Story generation failed (${res.status}). ${truncate(body)}`);
  }

  const data = await res.json();
  const content: string = data.choices?.[0]?.message?.content ?? "";
  if (!content) throw new Error("The model returned an empty story.");
  return extractJson(content);
}

/** Illustrate a single prompt. Returns a base64 data URL, or undefined on failure. */
export async function generateImage(prompt: string): Promise<string | undefined> {
  const res = await fetch(`${BASE}/chat/completions`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      model: IMAGE_MODEL,
      modalities: ["image", "text"],
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) return undefined;

  const data = await res.json();
  return data.choices?.[0]?.message?.images?.[0]?.image_url?.url as
    | string
    | undefined;
}

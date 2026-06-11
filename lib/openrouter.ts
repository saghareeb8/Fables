import type {
  StoryInput,
  Booklet,
  BookletPage,
  OpenRouterModel,
  ProgressStage,
} from "./types";
import { getTheme, pagesForLength } from "./themes";

const BASE = "https://openrouter.ai/api/v1";

// Cheapest image-capable model on OpenRouter (a fraction of a cent per image).
const IMAGE_MODEL = "google/gemini-2.5-flash-image";

// Used if the live free-model list can't be fetched. These are best-effort
// fallbacks; the app fetches the current list at runtime.
export const FALLBACK_MODELS: OpenRouterModel[] = [
  { id: "google/gemma-4-31b-it:free", name: "Gemma 4 31B (free)" },
  { id: "nvidia/nemotron-3-super-120b-a12b:free", name: "Nemotron 3 Super (free)" },
];

export const DEFAULT_MODEL = FALLBACK_MODELS[0].id;

function getApiKey(): string {
  const key = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
  if (!key) {
    throw new Error(
      "No OpenRouter API key found. Add NEXT_PUBLIC_OPENROUTER_API_KEY to .env.local and restart the dev server."
    );
  }
  return key;
}

function headers(): Record<string, string> {
  const h: Record<string, string> = {
    Authorization: `Bearer ${getApiKey()}`,
    "Content-Type": "application/json",
  };
  if (typeof window !== "undefined") {
    h["HTTP-Referer"] = window.location.origin;
    h["X-Title"] = "Fables Bedtime Stories";
  }
  return h;
}

/** Fetch currently-available free text models for the dropdown. */
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
        // skip pure guardrail / safety / embedding helpers
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

interface StoryPlan {
  title: string;
  artStyle: string;
  characterDescription: string;
  pages: { text: string; imagePrompt: string }[];
}

function buildStoryPrompt(input: StoryInput): { system: string; user: string } {
  const theme = getTheme(input.theme);
  const pageCount = pagesForLength(input.length);
  const isArabic = input.language === "ar";

  const langRule = isArabic
    ? 'Write the "title" and every page "text" in Arabic (فصحى — Modern Standard Arabic that is simple and warm for children). Keep "artStyle", "characterDescription", and every "imagePrompt" in ENGLISH (the illustrator only understands English).'
    : 'Write everything in English.';

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
  // strip ```json ... ``` fences if present
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) text = fence[1].trim();
  // fall back to the outermost braces
  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");
  if (first !== -1 && last !== -1) text = text.slice(first, last + 1);

  const parsed = JSON.parse(text) as StoryPlan;
  if (!parsed.title || !Array.isArray(parsed.pages) || parsed.pages.length === 0) {
    throw new Error("The model returned an unexpected story format.");
  }
  return parsed;
}

async function generateStoryPlan(input: StoryInput): Promise<StoryPlan> {
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

async function generateImage(prompt: string): Promise<string | undefined> {
  const res = await fetch(`${BASE}/chat/completions`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      model: IMAGE_MODEL,
      modalities: ["image", "text"],
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    // Don't fail the whole booklet on one image — fall back to placeholder.
    return undefined;
  }

  const data = await res.json();
  const url: string | undefined =
    data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
  return url;
}

function truncate(s: string, n = 240): string {
  return s.length > n ? s.slice(0, n) + "…" : s;
}

function uuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/**
 * Full pipeline: write the story (free text model), then optionally illustrate
 * each page (cheap image model). Reports progress via onProgress.
 */
export async function generateBooklet(
  input: StoryInput,
  onProgress: (stage: ProgressStage) => void
): Promise<Booklet> {
  onProgress({ kind: "writing" });
  const plan = await generateStoryPlan(input);

  const pages: BookletPage[] = plan.pages.map((p) => ({
    text: p.text,
    imagePrompt: p.imagePrompt,
  }));

  let coverImage: string | undefined;

  if (input.illustrate) {
    const stylePrefix = `${plan.artStyle}. Main character: ${plan.characterDescription}. Children's picture-book illustration, no text or words in the image. Scene: `;

    // +1 for the cover.
    const total = pages.length + 1;
    let completed = 0;
    const tick = () => {
      completed += 1;
      onProgress({ kind: "illustrating", current: completed, total });
    };
    onProgress({ kind: "illustrating", current: 0, total });

    const coverPromise = generateImage(
      `${stylePrefix}a beautiful storybook cover illustration for "${plan.title}", featuring the main character, warm and inviting`
    ).then((img) => {
      coverImage = img;
      tick();
    });

    const pagePromises = pages.map((page) =>
      generateImage(`${stylePrefix}${page.imagePrompt}`).then((img) => {
        page.image = img;
        tick();
      })
    );

    await Promise.all([coverPromise, ...pagePromises]);
  }

  onProgress({ kind: "done" });

  return {
    id: uuid(),
    createdAt: Date.now(),
    title: plan.title,
    childName: input.childName,
    age: input.age,
    theme: input.theme,
    language: input.language,
    artStyle: plan.artStyle,
    characterDescription: plan.characterDescription,
    coverImage,
    pages,
  };
}

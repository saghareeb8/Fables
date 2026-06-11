// CLIENT-SIDE. Talks only to this app's own /api/* routes — never to
// OpenRouter directly — so the API key stays on the server.
import type {
  StoryInput,
  StoryPlan,
  Booklet,
  BookletPage,
  OpenRouterModel,
  ProgressStage,
} from "./types";
import { FALLBACK_MODELS, DEFAULT_MODEL } from "./constants";

export { FALLBACK_MODELS, DEFAULT_MODEL };

/** Fetch currently-available free text models for the dropdown. */
export async function fetchFreeModels(): Promise<OpenRouterModel[]> {
  try {
    const res = await fetch("/api/models");
    if (!res.ok) return FALLBACK_MODELS;
    const data = await res.json();
    return Array.isArray(data.models) && data.models.length
      ? (data.models as OpenRouterModel[])
      : FALLBACK_MODELS;
  } catch {
    return FALLBACK_MODELS;
  }
}

async function requestStoryPlan(input: StoryInput): Promise<StoryPlan> {
  const res = await fetch("/api/story", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      data.error || `Story generation failed (${res.status}).`
    );
  }
  return data.plan as StoryPlan;
}

async function requestImage(prompt: string): Promise<string | undefined> {
  try {
    const res = await fetch("/api/image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    if (!res.ok) return undefined;
    const data = await res.json();
    return (data.url as string | null) ?? undefined;
  } catch {
    return undefined;
  }
}

function uuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/**
 * Full pipeline: write the story (free text model), then optionally illustrate
 * each page (cheap image model). All network calls go through this app's API
 * routes. Reports progress via onProgress.
 */
export async function generateBooklet(
  input: StoryInput,
  onProgress: (stage: ProgressStage) => void
): Promise<Booklet> {
  onProgress({ kind: "writing" });
  const plan = await requestStoryPlan(input);

  const pages: BookletPage[] = plan.pages.map((p) => ({
    text: p.text,
    imagePrompt: p.imagePrompt,
  }));

  let coverImage: string | undefined;

  if (input.illustrate) {
    const stylePrefix = `${plan.artStyle}. Main character: ${plan.characterDescription}. Children's picture-book illustration, no text or words in the image. Scene: `;

    const total = pages.length + 1; // +1 for the cover
    let completed = 0;
    const tick = () => {
      completed += 1;
      onProgress({ kind: "illustrating", current: completed, total });
    };
    onProgress({ kind: "illustrating", current: 0, total });

    const coverPromise = requestImage(
      `${stylePrefix}a beautiful storybook cover illustration for "${plan.title}", featuring the main character, warm and inviting`
    ).then((img) => {
      coverImage = img;
      tick();
    });

    const pagePromises = pages.map((page) =>
      requestImage(`${stylePrefix}${page.imagePrompt}`).then((img) => {
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

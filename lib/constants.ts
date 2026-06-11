import type { OpenRouterModel } from "./types";

// Cheapest image-capable model on OpenRouter (a fraction of a cent per image).
export const IMAGE_MODEL = "google/gemini-2.5-flash-image";

// Used if the live free-model list can't be fetched. These are best-effort
// fallbacks; the app fetches the current list at runtime.
export const FALLBACK_MODELS: OpenRouterModel[] = [
  { id: "google/gemma-4-31b-it:free", name: "Gemma 4 31B (free)" },
  {
    id: "nvidia/nemotron-3-super-120b-a12b:free",
    name: "Nemotron 3 Super (free)",
  },
];

export const DEFAULT_MODEL = FALLBACK_MODELS[0].id;

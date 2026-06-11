export type StoryLength = "short" | "medium" | "long";

export type Language = "en" | "ar";

export interface StoryTheme {
  id: string;
  label: string;
  emoji: string;
  /** Tailwind gradient classes used for placeholder art + accents. */
  gradient: string;
  /** Guidance injected into the prompt to shape tone. */
  tone: string;
}

export interface StoryInput {
  childName: string;
  age: number;
  theme: string; // theme id
  daySummary: string;
  length: StoryLength;
  language: Language;
  model: string; // OpenRouter model id (text)
  illustrate: boolean;
}

export interface BookletPage {
  text: string;
  imagePrompt: string;
  /** base64 data URL when illustrated, undefined for placeholder art. */
  image?: string;
}

export interface Booklet {
  id: string;
  createdAt: number;
  title: string;
  childName: string;
  age: number;
  theme: string; // theme id
  language: Language;
  artStyle: string;
  characterDescription: string;
  coverImage?: string;
  pages: BookletPage[];
}

export interface OpenRouterModel {
  id: string;
  name: string;
}

/** Structured story returned by the text model (server-side). */
export interface StoryPlan {
  title: string;
  artStyle: string;
  characterDescription: string;
  pages: { text: string; imagePrompt: string }[];
}

export type ProgressStage =
  | { kind: "writing" }
  | { kind: "illustrating"; current: number; total: number }
  | { kind: "done" };

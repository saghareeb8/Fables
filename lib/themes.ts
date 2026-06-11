import type { StoryTheme, StoryLength } from "./types";

export const THEMES: StoryTheme[] = [
  {
    id: "comedy",
    label: "Comedy",
    emoji: "😂",
    gradient: "from-amber-400 via-orange-400 to-pink-400",
    tone: "silly, playful and full of giggles, with gentle funny mishaps and a happy ending",
  },
  {
    id: "adventure",
    label: "Adventure",
    emoji: "🗺️",
    gradient: "from-emerald-400 via-teal-400 to-cyan-400",
    tone: "exciting and brave, with a quest, exploration and a satisfying triumph",
  },
  {
    id: "fantasy",
    label: "Fantasy",
    emoji: "🧚",
    gradient: "from-fuchsia-400 via-purple-400 to-indigo-400",
    tone: "magical and whimsical, with friendly creatures, wonder and a touch of sparkle",
  },
  {
    id: "scifi",
    label: "Sci-Fi",
    emoji: "🚀",
    gradient: "from-sky-400 via-blue-400 to-indigo-500",
    tone: "imaginative and futuristic, with friendly robots, stars and clever inventions",
  },
  {
    id: "horror",
    label: "Spooky-Fun",
    emoji: "👻",
    gradient: "from-violet-500 via-purple-600 to-slate-700",
    tone: "gently spooky and silly (never truly scary), with friendly ghosts and a cozy, reassuring ending",
  },
  {
    id: "mystery",
    label: "Mystery",
    emoji: "🔍",
    gradient: "from-indigo-400 via-violet-400 to-purple-500",
    tone: "curious and clever, with a small friendly puzzle to solve and a delightful reveal",
  },
  {
    id: "fairytale",
    label: "Fairy Tale",
    emoji: "🏰",
    gradient: "from-rose-400 via-pink-400 to-amber-300",
    tone: "classic and warm-hearted, with a gentle lesson, kindness and a 'happily ever after'",
  },
];

export function getTheme(id: string): StoryTheme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}

export const LENGTHS: { id: StoryLength; label: string; pages: number; hint: string }[] = [
  { id: "short", label: "Short", pages: 4, hint: "~4 pages · a quick tuck-in" },
  { id: "medium", label: "Medium", pages: 6, hint: "~6 pages · a cozy read" },
  { id: "long", label: "Long", pages: 8, hint: "~8 pages · a grand tale" },
];

export function pagesForLength(length: StoryLength): number {
  return LENGTHS.find((l) => l.id === length)?.pages ?? 6;
}

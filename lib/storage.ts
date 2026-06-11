import type { Booklet } from "./types";

const KEY = "fables.booklets.v1";

export function loadBooklets(): Booklet[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const list = JSON.parse(raw) as Booklet[];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function persist(list: Booklet[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // Most likely the quota was exceeded (illustrated booklets are large).
    // Drop the oldest until it fits.
    const trimmed = [...list];
    while (trimmed.length > 1) {
      trimmed.shift();
      try {
        window.localStorage.setItem(KEY, JSON.stringify(trimmed));
        return;
      } catch {
        /* keep trimming */
      }
    }
  }
}

export function saveBooklet(booklet: Booklet): Booklet[] {
  const list = loadBooklets();
  const next = [booklet, ...list.filter((b) => b.id !== booklet.id)];
  persist(next);
  return next;
}

export function deleteBooklet(id: string): Booklet[] {
  const next = loadBooklets().filter((b) => b.id !== id);
  persist(next);
  return next;
}

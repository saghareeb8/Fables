"use client";

import type { Booklet } from "@/lib/types";
import { getTheme } from "@/lib/themes";

interface Props {
  open: boolean;
  booklets: Booklet[];
  onClose: () => void;
  onOpen: (b: Booklet) => void;
  onDelete: (id: string) => void;
}

export default function HistoryDrawer({
  open,
  booklets,
  onClose,
  onOpen,
  onDelete,
}: Props) {
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-night-950/60 backdrop-blur-sm transition-opacity ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Panel */}
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-[88%] max-w-sm flex-col border-l border-white/10 bg-night-900/95 backdrop-blur-xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/10 p-5">
          <h2 className="font-display text-xl font-bold">📚 Story shelf</h2>
          <button onClick={onClose} className="btn-ghost px-3 py-1.5 text-sm">
            Close
          </button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-5">
          {booklets.length === 0 ? (
            <p className="mt-10 text-center text-sm text-night-300">
              No stories yet. Your created booklets will appear here.
            </p>
          ) : (
            booklets.map((b) => {
              const theme = getTheme(b.theme);
              return (
                <div
                  key={b.id}
                  className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 transition hover:bg-white/10"
                >
                  <button
                    onClick={() => onOpen(b)}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  >
                    <span
                      className={`flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br ${theme.gradient} text-2xl`}
                    >
                      {b.coverImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={b.coverImage}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        theme.emoji
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">
                        {b.title}
                      </span>
                      <span className="block text-xs text-night-300">
                        {b.childName} · {theme.label} ·{" "}
                        {new Date(b.createdAt).toLocaleDateString()}
                      </span>
                    </span>
                  </button>
                  <button
                    onClick={() => onDelete(b.id)}
                    aria-label="Delete story"
                    className="flex-shrink-0 rounded-lg p-2 text-night-300 opacity-60 transition hover:bg-rose-500/20 hover:text-rose-200 group-hover:opacity-100"
                  >
                    🗑
                  </button>
                </div>
              );
            })
          )}
        </div>
      </aside>
    </>
  );
}

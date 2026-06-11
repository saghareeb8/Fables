"use client";

import { useEffect, useState } from "react";
import type { Booklet } from "@/lib/types";
import { getTheme } from "@/lib/themes";

interface Props {
  booklet: Booklet;
  onNewStory: () => void;
}

export default function BookletViewer({ booklet, onNewStory }: Props) {
  // index 0 = cover, 1..n = story pages
  const total = booklet.pages.length + 1;
  const [index, setIndex] = useState(0);
  const theme = getTheme(booklet.theme);

  const go = (dir: number) =>
    setIndex((i) => Math.min(total - 1, Math.max(0, i + dir)));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total]);

  const isCover = index === 0;
  const page = isCover ? null : booklet.pages[index - 1];
  const image = isCover ? booklet.coverImage : page?.image;

  return (
    <div className="animate-fade-up">
      {/* Top bar */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <button onClick={onNewStory} className="btn-ghost text-sm">
          ← New story
        </button>
        <span className="text-sm text-night-300">
          {isCover ? "Cover" : `Page ${index} of ${booklet.pages.length}`}
        </span>
      </div>

      {/* Page card */}
      <div className="glass overflow-hidden">
        <div className="grid md:grid-cols-2">
          {/* Illustration */}
          <div className="relative aspect-square w-full md:aspect-auto md:min-h-[460px]">
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={image}
                alt={isCover ? booklet.title : `Illustration for page ${index}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <PlaceholderArt
                gradient={theme.gradient}
                emoji={theme.emoji}
                label={isCover ? booklet.title : `Page ${index}`}
              />
            )}
          </div>

          {/* Text */}
          <div className="flex flex-col justify-center p-7 sm:p-10">
            {isCover ? (
              <div className="text-center md:text-left">
                <span className="text-4xl">{theme.emoji}</span>
                <h1 className="mt-3 font-display text-3xl font-extrabold leading-tight sm:text-4xl">
                  {booklet.title}
                </h1>
                <p className="mt-4 text-night-200">
                  A {theme.label.toLowerCase()} bedtime story for{" "}
                  <span className="font-semibold text-night-50">
                    {booklet.childName}
                  </span>
                  , age {booklet.age}.
                </p>
                <p className="mt-6 text-sm text-night-300/70">
                  Use the arrows (or ← → keys) to turn the page.
                </p>
              </div>
            ) : (
              <p className="font-display text-xl leading-relaxed text-night-50 sm:text-2xl">
                {page?.text}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Nav */}
      <div className="mt-5 flex items-center justify-between gap-4">
        <button
          onClick={() => go(-1)}
          disabled={index === 0}
          className="btn-ghost disabled:opacity-30"
        >
          ← Back
        </button>

        <div className="flex flex-wrap items-center justify-center gap-1.5">
          {Array.from({ length: total }).map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Go to ${i === 0 ? "cover" : `page ${i}`}`}
              className={`h-2.5 rounded-full transition-all ${
                i === index
                  ? "w-6 bg-fuchsia-400"
                  : "w-2.5 bg-night-600 hover:bg-night-400"
              }`}
            />
          ))}
        </div>

        {index === total - 1 ? (
          <button onClick={onNewStory} className="btn-primary">
            The End ✨
          </button>
        ) : (
          <button onClick={() => go(1)} className="btn-primary">
            Next →
          </button>
        )}
      </div>
    </div>
  );
}

function PlaceholderArt({
  gradient,
  emoji,
  label,
}: {
  gradient: string;
  emoji: string;
  label: string;
}) {
  return (
    <div
      className={`relative flex h-full min-h-[260px] w-full items-center justify-center bg-gradient-to-br ${gradient}`}
    >
      <div className="absolute inset-0 bg-night-950/10" />
      <div className="relative flex flex-col items-center gap-3 p-6 text-center">
        <span className="animate-float text-7xl drop-shadow-lg">{emoji}</span>
        <span className="font-display text-lg font-bold text-night-950/80">
          {label}
        </span>
      </div>
    </div>
  );
}

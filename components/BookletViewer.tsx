"use client";

import { useEffect, useState } from "react";
import type { Booklet, StoryTheme } from "@/lib/types";
import { getTheme } from "@/lib/themes";

interface Props {
  booklet: Booklet;
  onNewStory: () => void;
}

export default function BookletViewer({ booklet, onNewStory }: Props) {
  // index 0 = cover, 1..n = story pages
  const total = booklet.pages.length + 1;
  const isArabic = booklet.language === "ar";
  const theme = getTheme(booklet.theme);

  const [index, setIndex] = useState(0);
  // the page currently turning away (null when settled)
  const [turn, setTurn] = useState<{ from: number; dir: 1 | -1 } | null>(null);

  const goTo = (target: number) => {
    const next = Math.min(total - 1, Math.max(0, target));
    if (next === index) return;
    setTurn({ from: index, dir: next > index ? 1 : -1 });
    setIndex(next);
  };
  const go = (delta: number) => goTo(index + delta);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Match the book's reading direction: in Arabic, forward is to the left.
      const forwardKey = isArabic ? "ArrowLeft" : "ArrowRight";
      const backKey = isArabic ? "ArrowRight" : "ArrowLeft";
      if (e.key === forwardKey) go(1);
      if (e.key === backKey) go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, isArabic, total]);

  // The revealed (underneath) page vs. the turning sheet on top.
  const underneathIdx = turn ? (turn.dir === 1 ? index : turn.from) : index;
  const sheetIdx = turn ? (turn.dir === 1 ? turn.from : index) : null;

  // Arabic books are bound on the right, so the spine — and the turn — flips.
  const spine = isArabic ? "right" : "left";
  // Full literal class names so Tailwind's JIT actually generates them
  // (it can't see dynamically-concatenated class strings).
  const ANIM = {
    "left-next": "animate-page-turn-left-next",
    "left-prev": "animate-page-turn-left-prev",
    "right-next": "animate-page-turn-right-next",
    "right-prev": "animate-page-turn-right-prev",
  } as const;
  const sheetAnim = turn
    ? ANIM[`${spine}-${turn.dir === 1 ? "next" : "prev"}` as keyof typeof ANIM]
    : "";

  const t = {
    cover: isArabic ? "الغلاف" : "Cover",
    page: (n: number) =>
      isArabic
        ? `صفحة ${n} من ${booklet.pages.length}`
        : `Page ${n} of ${booklet.pages.length}`,
    newStory: isArabic ? "قصة جديدة" : "New story",
    back: isArabic ? "السابق" : "Back",
    next: isArabic ? "التالي" : "Next",
    end: isArabic ? "النهاية" : "The End",
  };

  const isCoverShown = index === 0;

  return (
    <div className="animate-fade-up" dir={isArabic ? "rtl" : "ltr"}>
      {/* Top bar */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <button onClick={onNewStory} className="btn-ghost text-sm">
          {isArabic ? "→" : "←"} {t.newStory}
        </button>
        <span className="text-sm text-night-300">
          {isCoverShown ? t.cover : t.page(index)}
        </span>
      </div>

      {/* Flip area */}
      <div className="relative" style={{ perspective: "2200px" }}>
        {/* Revealed page underneath */}
        <div className="glass overflow-hidden">
          <PageFace
            booklet={booklet}
            idx={underneathIdx}
            isArabic={isArabic}
            theme={theme}
          />
        </div>

        {/* Turning sheet (two-faced) */}
        {turn && sheetIdx !== null && (
          <div
            className={`absolute inset-0 ${sheetAnim}`}
            style={{
              transformStyle: "preserve-3d",
              transformOrigin: `${spine} center`,
            }}
            onAnimationEnd={() => setTurn(null)}
          >
            {/* Front: the page itself */}
            <div className="glass absolute inset-0 overflow-hidden [backface-visibility:hidden]">
              <PageFace
                booklet={booklet}
                idx={sheetIdx}
                isArabic={isArabic}
                theme={theme}
              />
            </div>
            {/* Back: the blank reverse of the paper */}
            <div
              className="glass absolute inset-0 overflow-hidden [backface-visibility:hidden]"
              style={{ transform: "rotateY(180deg)" }}
            >
              <div className="h-full w-full bg-gradient-to-br from-night-700 via-night-800 to-night-900">
                <div className="flex h-full items-center justify-center text-5xl opacity-10">
                  {theme.emoji}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <div className="mt-5 flex items-center justify-between gap-4">
        <button
          onClick={() => go(-1)}
          disabled={index === 0}
          className="btn-ghost disabled:opacity-30"
        >
          {isArabic ? "→" : "←"} {t.back}
        </button>

        <div className="flex flex-wrap items-center justify-center gap-1.5">
          {Array.from({ length: total }).map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`${i === 0 ? t.cover : t.page(i)}`}
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
            {t.end} ✨
          </button>
        ) : (
          <button onClick={() => go(1)} className="btn-primary">
            {t.next} {isArabic ? "←" : "→"}
          </button>
        )}
      </div>
    </div>
  );
}

function PageFace({
  booklet,
  idx,
  isArabic,
  theme,
}: {
  booklet: Booklet;
  idx: number;
  isArabic: boolean;
  theme: StoryTheme;
}) {
  const isCover = idx === 0;
  const page = isCover ? null : booklet.pages[idx - 1];
  const image = isCover ? booklet.coverImage : page?.image;
  const fontClass = isArabic ? "font-arabic" : "font-display";

  const subtitle = isArabic
    ? `حكاية ما قبل النوم لـ ${booklet.childName} • ${booklet.age} سنوات`
    : `A ${theme.label.toLowerCase()} bedtime story for ${booklet.childName}, age ${booklet.age}.`;

  const hint = isArabic
    ? "استخدم الأسهم لتقليب الصفحات."
    : "Use the arrows (or ← → keys) to turn the page.";

  return (
    <div className="grid h-full md:grid-cols-2">
      {/* Illustration */}
      <div className="relative aspect-square w-full md:aspect-auto md:min-h-[460px]">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={isCover ? booklet.title : `Illustration for page ${idx}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <PlaceholderArt
            gradient={theme.gradient}
            emoji={theme.emoji}
            label={isCover ? booklet.title : `${idx}`}
          />
        )}
      </div>

      {/* Text */}
      <div
        className={`flex flex-col justify-center p-7 sm:p-10 ${
          isArabic ? "text-right" : ""
        }`}
      >
        {isCover ? (
          <div className={isArabic ? "" : "text-center md:text-left"}>
            <span className="text-4xl">{theme.emoji}</span>
            <h1
              className={`mt-3 text-3xl font-extrabold leading-tight sm:text-4xl ${fontClass}`}
            >
              {booklet.title}
            </h1>
            <p className="mt-4 text-night-200">{subtitle}</p>
            <p className="mt-6 text-sm text-night-300/70">{hint}</p>
          </div>
        ) : (
          <p
            className={`text-xl leading-relaxed text-night-50 sm:text-2xl ${fontClass}`}
          >
            {page?.text}
          </p>
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

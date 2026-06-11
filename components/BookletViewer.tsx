"use client";

import { useEffect, useState } from "react";
import type { Booklet, StoryTheme } from "@/lib/types";
import { getTheme } from "@/lib/themes";

interface Props {
  booklet: Booklet;
  onNewStory: () => void;
}

/**
 * Open-book viewer. Each spread shows two facing pages: an illustration on one
 * page and the story text on the other. Turning to the next/previous spread
 * flips a single leaf over the center spine — its front is the current page and
 * its back is the page of the spread you're turning to, exactly like a real book.
 */
export default function BookletViewer({ booklet, onNewStory }: Props) {
  const total = booklet.pages.length + 1; // index 0 = cover
  const isArabic = booklet.language === "ar";
  const theme = getTheme(booklet.theme);

  const [index, setIndex] = useState(0);
  const [turn, setTurn] = useState<{ from: number } | null>(null);

  const goTo = (target: number) => {
    const next = Math.min(total - 1, Math.max(0, target));
    if (next === index || turn) return;
    setTurn({ from: index });
    setIndex(next);
  };
  const go = (delta: number) => goTo(index + delta);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const forwardKey = isArabic ? "ArrowLeft" : "ArrowRight";
      const backKey = isArabic ? "ArrowRight" : "ArrowLeft";
      if (e.key === forwardKey) go(1);
      if (e.key === backKey) go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, isArabic, total, turn]);

  const cur = turn ? turn.from : index;
  const tgt = index;
  const dir = tgt > cur ? 1 : -1; // 1 = next, -1 = prev

  // Two leaf geometries:
  //  A — leaf sits on the RIGHT, pivots on the left (spine), sweeps left.
  //  B — leaf sits on the LEFT,  pivots on the right (spine), sweeps right.
  // For LTR: next=A, prev=B. Arabic books are bound on the right, so it mirrors.
  const useA = (dir === 1) !== isArabic;

  // Static pages behind the turning leaf.
  const leftIdx = !turn ? index : useA ? cur : tgt;
  const rightIdx = !turn ? index : useA ? tgt : cur;

  // The leaf's two faces.
  const leafSide = useA ? "right" : "left";
  const originSide = useA ? "left" : "right";
  const flipClass = useA ? "animate-leaf-flip-left" : "animate-leaf-flip-right";

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

  return (
    <div className="animate-fade-up" dir={isArabic ? "rtl" : "ltr"}>
      {/* Top bar */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <button onClick={onNewStory} className="btn-ghost text-sm">
          {isArabic ? "→" : "←"} {t.newStory}
        </button>
        <span className="text-sm text-night-300">
          {index === 0 ? t.cover : t.page(index)}
        </span>
      </div>

      {/* Open book — always physical LTR so the spread and the turning leaf
          share the same left/right geometry. The flip direction for Arabic is
          handled by `useA`; only the text inside is rendered RTL. */}
      <div
        dir="ltr"
        className="relative mx-auto h-[60vh] max-h-[560px] min-h-[380px] w-full"
        style={{ perspective: "2600px" }}
      >
        {/* Static spread underneath */}
        <div className="grid h-full grid-cols-2 overflow-hidden rounded-3xl shadow-2xl">
          <BookPage
            booklet={booklet}
            idx={leftIdx}
            side="left"
            kind="image"
            isArabic={isArabic}
            theme={theme}
          />
          <BookPage
            booklet={booklet}
            idx={rightIdx}
            side="right"
            kind="text"
            isArabic={isArabic}
            theme={theme}
          />
        </div>

        {/* Center spine seam */}
        <div className="pointer-events-none absolute inset-y-0 left-1/2 z-10 w-px -translate-x-1/2 bg-black/40" />

        {/* Turning leaf */}
        {turn && (
          <div
            className={`absolute top-0 z-20 h-full w-1/2 ${
              leafSide === "right" ? "right-0" : "left-0"
            } ${flipClass}`}
            style={{
              transformStyle: "preserve-3d",
              transformOrigin: `${originSide} center`,
            }}
            onAnimationEnd={() => setTurn(null)}
          >
            {/* Front face — the page you're leaving */}
            <div className="absolute inset-0 [backface-visibility:hidden]">
              <BookPage
                booklet={booklet}
                idx={cur}
                side={leafSide}
                kind={useA ? "text" : "image"}
                isArabic={isArabic}
                theme={theme}
                shadow
              />
            </div>
            {/* Back face — the page you're turning to */}
            <div
              className="absolute inset-0 [backface-visibility:hidden]"
              style={{ transform: "rotateY(180deg)" }}
            >
              <BookPage
                booklet={booklet}
                idx={tgt}
                side={leafSide === "right" ? "left" : "right"}
                kind={useA ? "image" : "text"}
                isArabic={isArabic}
                theme={theme}
                shadow
              />
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <div className="mt-5 flex items-center justify-between gap-4">
        <button
          onClick={() => go(-1)}
          disabled={index === 0 || !!turn}
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
          <button
            onClick={() => go(1)}
            disabled={!!turn}
            className="btn-primary disabled:opacity-60"
          >
            {t.next} {isArabic ? "←" : "→"}
          </button>
        )}
      </div>
    </div>
  );
}

/** A single book page — either the illustration side or the text side. */
function BookPage({
  booklet,
  idx,
  side,
  kind,
  isArabic,
  theme,
  shadow,
}: {
  booklet: Booklet;
  idx: number;
  side: "left" | "right";
  kind: "image" | "text";
  isArabic: boolean;
  theme: StoryTheme;
  shadow?: boolean;
}) {
  const isCover = idx === 0;
  const page = isCover ? null : booklet.pages[idx - 1];
  const image = isCover ? booklet.coverImage : page?.image;
  const fontClass = isArabic ? "font-arabic" : "font-display";
  const round = side === "left" ? "rounded-l-3xl" : "rounded-r-3xl";

  const subtitle = isArabic
    ? `حكاية ما قبل النوم لـ ${booklet.childName} • ${booklet.age} سنوات`
    : `A ${theme.label.toLowerCase()} bedtime story for ${booklet.childName}, age ${booklet.age}.`;

  return (
    <div
      className={`relative h-full w-full overflow-hidden bg-gradient-to-br from-night-800 to-night-900 ${round} ${
        shadow ? "shadow-2xl" : ""
      }`}
    >
      {kind === "image" ? (
        image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={isCover ? booklet.title : `Illustration for page ${idx}`}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <PlaceholderArt
            gradient={theme.gradient}
            emoji={theme.emoji}
            label={isCover ? booklet.title : `${idx}`}
          />
        )
      ) : (
        <div
          dir={isArabic ? "rtl" : "ltr"}
          className={`flex h-full flex-col justify-center overflow-y-auto p-6 sm:p-9 ${
            isArabic ? "text-right" : ""
          }`}
        >
          {isCover ? (
            <div className={isArabic ? "" : "text-center md:text-left"}>
              <span className="text-4xl">{theme.emoji}</span>
              <h1
                className={`mt-3 text-2xl font-extrabold leading-tight sm:text-3xl ${fontClass}`}
              >
                {booklet.title}
              </h1>
              <p className="mt-3 text-sm text-night-200 sm:text-base">
                {subtitle}
              </p>
            </div>
          ) : (
            <p
              className={`text-lg leading-relaxed text-night-50 sm:text-xl md:text-2xl ${fontClass}`}
            >
              {page?.text}
            </p>
          )}
        </div>
      )}

      {/* Spine shadow (gutter) */}
      <div
        className={`pointer-events-none absolute inset-y-0 w-10 ${
          side === "left"
            ? "right-0 bg-gradient-to-l from-black/35 to-transparent"
            : "left-0 bg-gradient-to-r from-black/35 to-transparent"
        }`}
      />
      {/* Outer-edge sheen for depth */}
      <div
        className={`pointer-events-none absolute inset-y-0 w-6 ${
          side === "left"
            ? "left-0 bg-gradient-to-r from-white/5 to-transparent"
            : "right-0 bg-gradient-to-l from-white/5 to-transparent"
        }`}
      />
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
      className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br ${gradient}`}
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

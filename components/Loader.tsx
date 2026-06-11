"use client";

import type { ProgressStage } from "@/lib/types";

export default function Loader({ stage }: { stage: ProgressStage }) {
  let title = "Dreaming up your story…";
  let detail = "Writing the tale";
  let pct = 15;

  if (stage.kind === "writing") {
    title = "Writing the story…";
    detail = "The author is dipping the quill in stardust";
    pct = 20;
  } else if (stage.kind === "illustrating") {
    title = "Painting the pictures…";
    detail =
      stage.current === 0
        ? "Preparing the paints"
        : `Illustrated ${stage.current} of ${stage.total}`;
    pct = 25 + Math.round((stage.current / stage.total) * 70);
  } else if (stage.kind === "done") {
    title = "Tucking it into the booklet…";
    detail = "Almost ready";
    pct = 100;
  }

  return (
    <div className="glass mx-auto flex max-w-md animate-fade-up flex-col items-center p-10 text-center">
      <div className="relative mb-6 h-24 w-24">
        <div className="absolute inset-0 animate-spin-slow rounded-full border-2 border-dashed border-night-300/40" />
        <div className="absolute inset-0 flex items-center justify-center text-5xl animate-float">
          🌙
        </div>
      </div>

      <h2 className="font-display text-2xl font-bold">{title}</h2>
      <p className="mt-2 text-sm text-night-200">{detail}</p>

      <div className="mt-6 h-2.5 w-full overflow-hidden rounded-full bg-night-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-night-300 to-fuchsia-400 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-night-300/70">{pct}%</p>
    </div>
  );
}

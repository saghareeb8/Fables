"use client";

import { useMemo } from "react";

interface Star {
  top: string;
  left: string;
  size: number;
  delay: string;
  duration: string;
  opacity: number;
}

function makeStars(count: number, seed: number): Star[] {
  // Deterministic pseudo-random so server & client markup match (no hydration mismatch).
  let s = seed;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  return Array.from({ length: count }, () => ({
    top: `${rand() * 100}%`,
    left: `${rand() * 100}%`,
    size: rand() * 2 + 1,
    delay: `${rand() * 4}s`,
    duration: `${rand() * 3 + 2}s`,
    opacity: rand() * 0.6 + 0.3,
  }));
}

export default function StarryBackground() {
  const stars = useMemo(() => makeStars(70, 7), []);
  const bigStars = useMemo(() => makeStars(12, 42), []);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Moon */}
      <div className="absolute right-[8%] top-[10%] animate-float">
        <div className="h-24 w-24 rounded-full bg-gradient-to-br from-moon-glow to-moon-soft shadow-moon sm:h-32 sm:w-32" />
      </div>

      {/* Soft nebula glows */}
      <div className="absolute -left-20 top-1/3 h-72 w-72 rounded-full bg-fuchsia-600/20 blur-[100px]" />
      <div className="absolute right-1/4 top-2/3 h-72 w-72 rounded-full bg-night-400/20 blur-[100px]" />

      {/* Stars */}
      {stars.map((star, i) => (
        <span
          key={`s-${i}`}
          className="absolute rounded-full bg-star animate-twinkle"
          style={{
            top: star.top,
            left: star.left,
            width: star.size,
            height: star.size,
            animationDelay: star.delay,
            animationDuration: star.duration,
            opacity: star.opacity,
          }}
        />
      ))}

      {/* Bigger sparkle stars */}
      {bigStars.map((star, i) => (
        <span
          key={`b-${i}`}
          className="absolute animate-twinkle text-star"
          style={{
            top: star.top,
            left: star.left,
            fontSize: `${star.size * 6}px`,
            animationDelay: star.delay,
            animationDuration: star.duration,
            opacity: star.opacity,
          }}
        >
          ✦
        </span>
      ))}
    </div>
  );
}

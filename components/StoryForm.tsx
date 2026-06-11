"use client";

import { useState } from "react";
import type {
  StoryInput,
  StoryLength,
  Language,
  OpenRouterModel,
} from "@/lib/types";
import { THEMES, LENGTHS } from "@/lib/themes";

interface Props {
  models: OpenRouterModel[];
  modelsLoading: boolean;
  defaultModel: string;
  onSubmit: (input: StoryInput) => void;
}

export default function StoryForm({
  models,
  modelsLoading,
  defaultModel,
  onSubmit,
}: Props) {
  const [childName, setChildName] = useState("");
  const [age, setAge] = useState(5);
  const [theme, setTheme] = useState(THEMES[1].id); // Adventure
  const [daySummary, setDaySummary] = useState("");
  const [length, setLength] = useState<StoryLength>("medium");
  const [language, setLanguage] = useState<Language>("en");
  const [illustrate, setIllustrate] = useState(true);
  const [model, setModel] = useState(defaultModel);
  const [error, setError] = useState("");

  // keep model in sync once the live list resolves
  const effectiveModel = models.some((m) => m.id === model)
    ? model
    : models[0]?.id ?? defaultModel;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!childName.trim()) {
      setError("Please enter your child's name.");
      return;
    }
    setError("");
    onSubmit({
      childName: childName.trim(),
      age,
      theme,
      daySummary: daySummary.trim(),
      length,
      language,
      model: effectiveModel,
      illustrate,
    });
  }

  return (
    <form onSubmit={submit} className="glass animate-fade-up p-6 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        {/* Name */}
        <div>
          <label htmlFor="name" className="field-label">
            Child&apos;s name
          </label>
          <input
            id="name"
            className="field-input"
            placeholder="e.g. Layla"
            value={childName}
            onChange={(e) => setChildName(e.target.value)}
            autoComplete="off"
          />
        </div>

        {/* Age */}
        <div>
          <label htmlFor="age" className="field-label">
            Age: <span className="text-night-300">{age}</span>
          </label>
          <input
            id="age"
            type="range"
            min={1}
            max={12}
            value={age}
            onChange={(e) => setAge(Number(e.target.value))}
            className="mt-3 w-full accent-fuchsia-400"
          />
          <div className="mt-1 flex justify-between text-xs text-night-300/70">
            <span>1</span>
            <span>12</span>
          </div>
        </div>
      </div>

      {/* Theme */}
      <div className="mt-5">
        <span className="field-label">Story theme</span>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {THEMES.map((t) => {
            const active = t.id === theme;
            return (
              <button
                type="button"
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`flex flex-col items-center gap-1 rounded-2xl border px-2 py-3 text-sm font-semibold transition ${
                  active
                    ? "border-transparent bg-gradient-to-br " +
                      t.gradient +
                      " text-night-950 shadow-glow-sm"
                    : "border-white/10 bg-night-900/50 text-night-100 hover:bg-white/10"
                }`}
              >
                <span className="text-xl">{t.emoji}</span>
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Day summary */}
      <div className="mt-5">
        <label htmlFor="day" className="field-label">
          What happened in their day?
        </label>
        <textarea
          id="day"
          className="field-input min-h-[96px] resize-y"
          placeholder="We went to the park, fed the ducks, and she was a little nervous about the big slide…"
          value={daySummary}
          onChange={(e) => setDaySummary(e.target.value)}
        />
        <p className="mt-1 text-xs text-night-300/70">
          The story weaves this in. Leave blank for a surprise.
        </p>
      </div>

      {/* Length */}
      <div className="mt-5">
        <span className="field-label">Length</span>
        <div className="grid grid-cols-3 gap-2">
          {LENGTHS.map((l) => {
            const active = l.id === length;
            return (
              <button
                type="button"
                key={l.id}
                onClick={() => setLength(l.id)}
                className={`rounded-2xl border px-3 py-3 text-center transition ${
                  active
                    ? "border-night-300 bg-night-300/15 text-night-50 shadow-glow-sm"
                    : "border-white/10 bg-night-900/50 text-night-100 hover:bg-white/10"
                }`}
              >
                <div className="font-display font-bold">{l.label}</div>
                <div className="text-[11px] text-night-300/80">{l.hint}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Language */}
      <div className="mt-5">
        <span className="field-label">Language</span>
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              { id: "en", label: "English", sub: "Left-to-right" },
              { id: "ar", label: "العربية", sub: "من اليمين لليسار" },
            ] as const
          ).map((l) => {
            const active = l.id === language;
            return (
              <button
                type="button"
                key={l.id}
                onClick={() => setLanguage(l.id)}
                className={`rounded-2xl border px-3 py-3 text-center transition ${
                  l.id === "ar" ? "font-arabic" : ""
                } ${
                  active
                    ? "border-night-300 bg-night-300/15 text-night-50 shadow-glow-sm"
                    : "border-white/10 bg-night-900/50 text-night-100 hover:bg-white/10"
                }`}
              >
                <div className="font-display text-lg font-bold">{l.label}</div>
                <div className="text-[11px] text-night-300/80">{l.sub}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Model + illustrate */}
      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="model" className="field-label">
            Story model {modelsLoading && <span className="text-night-300">· loading…</span>}
          </label>
          <select
            id="model"
            className="field-input"
            value={effectiveModel}
            onChange={(e) => setModel(e.target.value)}
          >
            {models.map((m) => (
              <option key={m.id} value={m.id} className="bg-night-900">
                {m.name}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-night-300/70">Free models only.</p>
        </div>

        <div>
          <span className="field-label">Illustrations</span>
          <button
            type="button"
            onClick={() => setIllustrate((v) => !v)}
            className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 transition ${
              illustrate
                ? "border-fuchsia-400/50 bg-fuchsia-400/10"
                : "border-white/10 bg-night-900/50"
            }`}
          >
            <span className="text-left">
              <span className="block font-semibold">
                {illustrate ? "AI pictures: On" : "AI pictures: Off"}
              </span>
              <span className="block text-[11px] text-night-300/80">
                {illustrate
                  ? "~1–2¢ per booklet"
                  : "Free placeholder art"}
              </span>
            </span>
            <span
              className={`relative h-7 w-12 rounded-full transition ${
                illustrate ? "bg-fuchsia-400" : "bg-night-700"
              }`}
            >
              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${
                  illustrate ? "left-6" : "left-1"
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-xl bg-rose-500/15 px-4 py-2 text-sm text-rose-200">
          {error}
        </p>
      )}

      <button type="submit" className="btn-primary mt-6 w-full text-lg">
        ✨ Create bedtime story
      </button>
    </form>
  );
}

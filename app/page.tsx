"use client";

import { useEffect, useState } from "react";
import StarryBackground from "@/components/StarryBackground";
import StoryForm from "@/components/StoryForm";
import Loader from "@/components/Loader";
import BookletViewer from "@/components/BookletViewer";
import HistoryDrawer from "@/components/HistoryDrawer";
import {
  fetchFreeModels,
  generateBooklet,
  FALLBACK_MODELS,
  DEFAULT_MODEL,
} from "@/lib/openrouter";
import { loadBooklets, saveBooklet, deleteBooklet } from "@/lib/storage";
import type {
  Booklet,
  StoryInput,
  OpenRouterModel,
  ProgressStage,
} from "@/lib/types";

type View = "home" | "generating" | "booklet";

export default function Home() {
  const [view, setView] = useState<View>("home");
  const [models, setModels] = useState<OpenRouterModel[]>(FALLBACK_MODELS);
  const [modelsLoading, setModelsLoading] = useState(true);
  const [progress, setProgress] = useState<ProgressStage>({ kind: "writing" });
  const [booklet, setBooklet] = useState<Booklet | null>(null);
  const [history, setHistory] = useState<Booklet[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setHistory(loadBooklets());
    fetchFreeModels()
      .then(setModels)
      .finally(() => setModelsLoading(false));
  }, []);

  async function handleGenerate(input: StoryInput) {
    setError("");
    setProgress({ kind: "writing" });
    setView("generating");
    try {
      const result = await generateBooklet(input, setProgress);
      setBooklet(result);
      setHistory(saveBooklet(result));
      setView("booklet");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setView("home");
    }
  }

  function openFromHistory(b: Booklet) {
    setBooklet(b);
    setView("booklet");
    setDrawerOpen(false);
  }

  function removeFromHistory(id: string) {
    setHistory(deleteBooklet(id));
    if (booklet?.id === id) {
      setBooklet(null);
      setView("home");
    }
  }

  return (
    <main className="relative min-h-screen px-4 pb-16 pt-6 sm:px-6">
      <StarryBackground />

      {/* Header */}
      <header className="mx-auto flex max-w-4xl items-center justify-between">
        <button
          onClick={() => setView("home")}
          className="flex items-center gap-2 font-display text-2xl font-extrabold"
        >
          <span className="animate-float">🌙</span>
          <span className="bg-gradient-to-r from-night-100 to-fuchsia-300 bg-clip-text text-transparent">
            Fables
          </span>
        </button>
        <button
          onClick={() => setDrawerOpen(true)}
          className="btn-ghost text-sm"
        >
          📚 My stories
          {history.length > 0 && (
            <span className="ml-1 rounded-full bg-fuchsia-400 px-1.5 text-xs font-bold text-night-950">
              {history.length}
            </span>
          )}
        </button>
      </header>

      {/* Body */}
      <div className="mx-auto mt-8 max-w-3xl sm:mt-12">
        {view === "home" && (
          <>
            <div className="mb-8 text-center animate-fade-up">
              <h1 className="font-display text-4xl font-extrabold leading-tight sm:text-5xl">
                Bedtime stories,
                <br />
                <span className="bg-gradient-to-r from-night-200 via-fuchsia-300 to-amber-200 bg-clip-text text-transparent">
                  spun from their day
                </span>
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-night-200">
                Tell us about your child&apos;s day and pick a theme — we&apos;ll
                write and illustrate a personalized story booklet to read at
                bedtime.
              </p>
            </div>

            {error && (
              <div className="glass mb-5 border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-100 animate-fade-up">
                <strong className="font-semibold">Couldn&apos;t make the story.</strong>{" "}
                {error}
              </div>
            )}

            <StoryForm
              models={models}
              modelsLoading={modelsLoading}
              defaultModel={DEFAULT_MODEL}
              onSubmit={handleGenerate}
            />
          </>
        )}

        {view === "generating" && (
          <div className="mt-10">
            <Loader stage={progress} />
          </div>
        )}

        {view === "booklet" && booklet && (
          <BookletViewer booklet={booklet} onNewStory={() => setView("home")} />
        )}
      </div>

      <HistoryDrawer
        open={drawerOpen}
        booklets={history}
        onClose={() => setDrawerOpen(false)}
        onOpen={openFromHistory}
        onDelete={removeFromHistory}
      />
    </main>
  );
}

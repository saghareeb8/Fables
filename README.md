# 🌙 Fables — AI Bedtime Story Booklets

Tell Fables about your child's day, pick a theme, and it writes **and illustrates**
a personalized bedtime story booklet — all in the browser. Frontend-only Next.js
app powered by [OpenRouter](https://openrouter.ai).

## Features

- 📝 **Personalized stories** from your child's name, age, and what happened in their day
- 🎭 **Themes:** Comedy, Adventure, Fantasy, Sci-Fi, Spooky-Fun, Mystery, Fairy Tale
- 🖼️ **Illustrated booklet** — a cover + a picture for every page (toggleable)
- 📏 **Length control** — short / medium / long
- 📚 **Story shelf** — booklets saved in your browser (localStorage)
- 🌌 **Night-sky theme**, fully responsive
- 🆓 Story text uses **free** OpenRouter models. Illustrations use the cheap
  `google/gemini-2.5-flash-image` model (~1–2¢ per booklet) and can be turned off.

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Add your OpenRouter API key**

   Get a key at <https://openrouter.ai/keys>, then put it in `.env.local`:
   ```
   OPENROUTER_API_KEY=sk-or-...
   ```

3. **Run the app**
   ```bash
   npm run dev
   ```
   Open <http://localhost:3000>.

## 🔒 The API key is server-only

All OpenRouter calls go through this app's own API routes (`app/api/*`), which
run on the server and read `OPENROUTER_API_KEY` there. The key is **never sent to
the browser**, so it's safe to deploy publicly.

**Deploying on Vercel:** add `OPENROUTER_API_KEY` under
**Project Settings → Environment Variables**, then redeploy. (No `NEXT_PUBLIC_`
prefix — that would expose it.)

## How it works

1. The form posts to **`/api/story`**, which (server-side) asks a **free text
   model** for the story as structured JSON: a title, a shared art style, a
   character description (so the kid looks the same on every page), and one entry
   per page (`text` + `imagePrompt`).
2. If illustrations are on, the client calls **`/api/image`** once per page (plus a
   cover); the server sends each prompt (with the shared style + character) to the
   **image model** and returns a base64 image.
3. The booklet is assembled in the browser, shown, and saved to `localStorage`.

The key lives only in the server routes via `lib/story-engine.ts`; the browser
talks exclusively to `/api/*`.

## Tech

Next.js (App Router) · React · TypeScript · Tailwind CSS · OpenRouter API

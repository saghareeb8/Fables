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
   NEXT_PUBLIC_OPENROUTER_API_KEY=sk-or-...
   ```

3. **Run the app**
   ```bash
   npm run dev
   ```
   Open <http://localhost:3000>.

## ⚠️ A note on the API key

This is a **frontend-only** app, so the key (prefixed `NEXT_PUBLIC_`) is bundled
into the browser and is visible to anyone who can load the page. That's fine for
local/personal use. **Do not deploy this publicly with a real key** — if you want
to host it, add a small server/proxy to keep the key secret first.

## How it works

1. The form inputs are turned into a prompt.
2. A **free text model** writes the story as structured JSON: a title, a shared
   art style, a character description (so the kid looks the same on every page),
   and one entry per page (`text` + `imagePrompt`).
3. If illustrations are on, each page's prompt (plus the shared style + character)
   is sent to the **image model**, which returns a base64 image.
4. The booklet is assembled, shown, and saved to `localStorage`.

## Tech

Next.js (App Router) · React · TypeScript · Tailwind CSS · OpenRouter API

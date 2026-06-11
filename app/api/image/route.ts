import { NextResponse } from "next/server";
import { generateImage } from "@/lib/story-engine";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { prompt } = (await req.json()) as { prompt?: string };
    if (!prompt) {
      return NextResponse.json({ error: "Missing prompt." }, { status: 400 });
    }
    const url = await generateImage(prompt);
    return NextResponse.json({ url: url ?? null });
  } catch {
    // Never fail the whole booklet on one image — the client falls back to
    // placeholder art when url is null.
    return NextResponse.json({ url: null });
  }
}

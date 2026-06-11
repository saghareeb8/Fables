import { NextResponse } from "next/server";
import { generateStoryPlan } from "@/lib/story-engine";
import type { StoryInput } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const input = (await req.json()) as StoryInput;
    if (!input?.childName || !input?.model) {
      return NextResponse.json(
        { error: "Missing required story fields." },
        { status: 400 }
      );
    }
    const plan = await generateStoryPlan(input);
    return NextResponse.json({ plan });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Failed to generate the story.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

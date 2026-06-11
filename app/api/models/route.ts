import { NextResponse } from "next/server";
import { fetchFreeModels } from "@/lib/story-engine";

export const runtime = "nodejs";
// Cache the model list briefly so we don't hit OpenRouter on every page load.
export const revalidate = 300;

export async function GET() {
  const models = await fetchFreeModels();
  return NextResponse.json({ models });
}

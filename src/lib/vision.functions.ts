import { createServerFn } from "@tanstack/react-start";

export type VisionItem = {
  name: string;
  emoji: string;
  confidence: number;
  grams: number;
  portion: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  bbox: { x: number; y: number; w: number; h: number };
};

const SYSTEM = `You are a precise food vision and nutrition expert.
Given a single photo of a meal, identify every distinct food item visible.
For each item return:
- name: short common food name (e.g. "Grilled Chicken Breast")
- emoji: one fitting food emoji
- confidence: 0..1 detection confidence
- grams: estimated weight in grams of THAT item on the plate
- portion: human readable portion like "~1 cup / 180g"
- kcal, protein, carbs, fat, fiber, sugar (grams), sodium (mg) — for the estimated grams, NOT per 100g
- bbox: tight bounding box as PERCENTAGES of the image, { x, y, w, h } where x,y is top-left, all 0..100
Use realistic USDA-style nutrition. Be accurate, not generic.
Return ONLY valid JSON: { "items": VisionItem[] }. No prose, no markdown.`;

export const analyzeFoodImage = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => {
    const d = data as { imageDataUrl?: string };
    if (!d?.imageDataUrl || typeof d.imageDataUrl !== "string") throw new Error("imageDataUrl required");
    return { imageDataUrl: d.imageDataUrl };
  })
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY missing");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM },
          {
            role: "user",
            content: [
              { type: "text", text: "Analyze this meal photo and return the JSON described." },
              { type: "image_url", image_url: { url: data.imageDataUrl } },
            ],
          },
        ],
      }),
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`AI gateway ${res.status}: ${txt.slice(0, 300)}`);
    }

    const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const raw = json.choices?.[0]?.message?.content ?? "{}";
    let parsed: { items?: VisionItem[] } = {};
    try {
      parsed = JSON.parse(raw);
    } catch {
      const m = raw.match(/\{[\s\S]*\}/);
      if (m) parsed = JSON.parse(m[0]);
    }
    const items = (parsed.items ?? []).map((it, i) => ({
      name: it.name ?? "Unknown",
      emoji: it.emoji ?? "🍽️",
      confidence: clamp(it.confidence ?? 0.8, 0, 1),
      grams: Math.max(1, Math.round(it.grams ?? 100)),
      portion: it.portion ?? `${Math.round(it.grams ?? 100)}g`,
      kcal: Math.max(0, Math.round(it.kcal ?? 0)),
      protein: round1(it.protein),
      carbs: round1(it.carbs),
      fat: round1(it.fat),
      fiber: round1(it.fiber),
      sugar: round1(it.sugar),
      sodium: Math.max(0, Math.round(it.sodium ?? 0)),
      bbox: normBbox(it.bbox, i),
    })) as VisionItem[];

    return { items };
  });

function clamp(n: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, n)); }
function round1(n: unknown) { const v = typeof n === "number" ? n : 0; return Math.round(v * 10) / 10; }
function normBbox(b: VisionItem["bbox"] | undefined, i: number) {
  const fallback = [
    { x: 10, y: 12, w: 45, h: 40 },
    { x: 55, y: 14, w: 38, h: 36 },
    { x: 14, y: 56, w: 40, h: 36 },
    { x: 56, y: 54, w: 38, h: 38 },
  ][i % 4];
  if (!b) return fallback;
  return {
    x: clamp(b.x ?? fallback.x, 0, 99),
    y: clamp(b.y ?? fallback.y, 0, 99),
    w: clamp(b.w ?? fallback.w, 1, 100),
    h: clamp(b.h ?? fallback.h, 1, 100),
  };
}
import { FOODS, SAMPLE_MEALS } from "@/data/foods";

export type AnalyzedItem = {
  id: string;
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

const BBOXES = [
  { x: 12, y: 20, w: 50, h: 42 },
  { x: 58, y: 14, w: 32, h: 30 },
  { x: 18, y: 60, w: 36, h: 30 },
  { x: 56, y: 52, w: 32, h: 32 },
];

const PORTION_LABELS = ["~1 cup", "~½ plate", "~1 piece", "~1 bowl", "~1 serving"];

export function mockAnalyze(sampleId?: string): AnalyzedItem[] {
  let foodIds: string[] = [];
  if (sampleId) {
    const s = SAMPLE_MEALS.find((m) => m.id === sampleId);
    foodIds = s?.items ?? [];
  }
  if (foodIds.length === 0) {
    const shuffled = [...FOODS].sort(() => Math.random() - 0.5);
    foodIds = shuffled.slice(0, 2 + Math.floor(Math.random() * 2)).map((f) => f.id);
  }
  return foodIds.map((id, i) => {
    const f = FOODS.find((x) => x.id === id)!;
    const grams = 80 + Math.floor(Math.random() * 180);
    const mult = grams / 100;
    return {
      id: f.id,
      name: f.name,
      emoji: f.emoji,
      confidence: 0.82 + Math.random() * 0.16,
      grams,
      portion: `${PORTION_LABELS[i % PORTION_LABELS.length]} / ${grams}g`,
      kcal: Math.round(f.per100g.kcal * mult),
      protein: +(f.per100g.protein * mult).toFixed(1),
      carbs: +(f.per100g.carbs * mult).toFixed(1),
      fat: +(f.per100g.fat * mult).toFixed(1),
      fiber: +(f.per100g.fiber * mult).toFixed(1),
      sugar: +(f.per100g.sugar * mult).toFixed(1),
      sodium: Math.round(f.per100g.sodium * mult),
      bbox: BBOXES[i % BBOXES.length],
    };
  });
}

export function insightFor(items: AnalyzedItem[]): string {
  const totalKcal = items.reduce((s, i) => s + i.kcal, 0);
  const totalCarbs = items.reduce((s, i) => s + i.carbs, 0);
  const totalProtein = items.reduce((s, i) => s + i.protein, 0);
  const totalFat = items.reduce((s, i) => s + i.fat, 0);
  if (totalProtein < 15) return "This meal is low in protein. Consider adding eggs, chicken, or legumes for better satiety.";
  if (totalCarbs / Math.max(1, totalKcal / 4) > 0.6) return "High in refined carbs. Pair with fiber-rich vegetables to slow absorption.";
  if (totalFat > 35) return "Fat-dense meal — great for energy, but watch portion sizes if you're cutting.";
  if (totalKcal < 350) return "A light meal. Add a small snack later to hit your daily target.";
  return "Well-balanced macros. Nice work — keep it up!";
}

import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import { FOODS, type FoodItem } from "@/data/foods";
import { Counter } from "@/lib/counter";

const TAGS = ["Vegetarian", "High Protein", "Low Carb", "Indian", "Fast Food", "Breakfast"] as const;

export const Route = createFileRoute("/explore")({
  head: () => ({ meta: [{ title: "Food database — NutriLens" }, { name: "description", content: "Explore foods, macros, and serving sizes." }] }),
  component: ExplorePage,
});

function ExplorePage() {
  const [q, setQ] = useState("");
  const [active, setActive] = useState<string[]>([]);
  const [selected, setSelected] = useState<FoodItem | null>(null);

  const filtered = useMemo(() => {
    return FOODS.filter((f) => {
      if (q && !f.name.toLowerCase().includes(q.toLowerCase())) return false;
      if (active.length && !active.every((t) => f.tags.includes(t as any))) return false;
      return true;
    });
  }, [q, active]);

  return (
    <div className="max-w-7xl mx-auto px-5 md:px-8 py-10 md:py-14">
      <h1 className="text-3xl md:text-5xl font-bold">Food database</h1>
      <p className="text-muted-foreground mt-2 mb-8">Search nutrition info for thousands of foods.</p>

      <div className="relative mb-5">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search foods…" className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white/[0.04] border border-white/10 focus:border-primary/50 outline-none transition-colors" />
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {TAGS.map((t) => {
          const on = active.includes(t);
          return (
            <button key={t} onClick={() => setActive((cur) => on ? cur.filter((x) => x !== t) : [...cur, t])} className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${on ? "bg-primary text-primary-foreground border-primary" : "border-white/10 text-muted-foreground hover:border-white/30"}`}>
              {t}
            </button>
          );
        })}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((f, i) => (
          <motion.button key={f.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} whileHover={{ scale: 1.015 }} onClick={() => setSelected(f)} className="glass glass-hover p-5 text-left">
            <div className="flex items-start justify-between">
              <span className="text-4xl">{f.emoji}</span>
              <div className="text-right">
                <div className="text-2xl font-bold text-[var(--amber)] tabular leading-none">{f.per100g.kcal}</div>
                <div className="text-[10px] text-muted-foreground">kcal / 100g</div>
              </div>
            </div>
            <div className="mt-3 font-bold">{f.name}</div>
            <div className="mt-2 flex flex-wrap gap-1">
              <span className="px-2 py-0.5 text-[10px] rounded-full bg-[var(--protein)]/15 text-[var(--protein)]">P {f.per100g.protein}g</span>
              <span className="px-2 py-0.5 text-[10px] rounded-full bg-[var(--amber)]/15 text-[var(--amber)]">C {f.per100g.carbs}g</span>
              <span className="px-2 py-0.5 text-[10px] rounded-full bg-[var(--coral)]/15 text-[var(--coral)]">F {f.per100g.fat}g</span>
            </div>
          </motion.button>
        ))}
        {filtered.length === 0 && <div className="col-span-full text-center text-muted-foreground py-16">No foods match your filters.</div>}
      </div>

      <AnimatePresence>
        {selected && <FoodDrawer food={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </div>
  );
}

function FoodDrawer({ food, onClose }: { food: FoodItem; onClose: () => void }) {
  const [grams, setGrams] = useState(100);
  const mult = grams / 100;
  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
      <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 28, stiffness: 280 }} className="fixed top-0 right-0 bottom-0 w-full sm:w-[440px] bg-card border-l border-white/10 z-50 overflow-y-auto">
        <div className="p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <span className="text-5xl">{food.emoji}</span>
            <button onClick={onClose} className="p-2 rounded-full border border-white/10 hover:bg-white/5"><X className="w-4 h-4" /></button>
          </div>
          <h2 className="text-2xl font-bold">{food.name}</h2>
          <div className="mt-1 flex flex-wrap gap-1">
            {food.tags.map((t) => <span key={t} className="text-[10px] px-2 py-0.5 rounded-full border border-white/10 text-muted-foreground">{t}</span>)}
          </div>

          <div className="mt-6 glass p-5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Calories</div>
            <div className="text-5xl font-bold text-[var(--amber)] tabular mt-1"><Counter value={Math.round(food.per100g.kcal * mult)} /></div>
            <div className="text-xs text-muted-foreground mt-1">for {grams}g serving</div>
            <input type="range" min={50} max={500} value={grams} onChange={(e) => setGrams(+e.target.value)} className="w-full mt-4 accent-[var(--primary)]" />
            <div className="flex justify-between text-[10px] text-muted-foreground"><span>50g</span><span>500g</span></div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2">
            {[
              { l: "Protein", v: (food.per100g.protein * mult).toFixed(1), c: "var(--protein)" },
              { l: "Carbs", v: (food.per100g.carbs * mult).toFixed(1), c: "var(--amber)" },
              { l: "Fat", v: (food.per100g.fat * mult).toFixed(1), c: "var(--coral)" },
            ].map((m) => (
              <div key={m.l} className="glass p-3 text-center">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{m.l}</div>
                <div className="text-xl font-bold tabular mt-1" style={{ color: m.c }}>{m.v}g</div>
              </div>
            ))}
          </div>

          <div className="mt-5">
            <h3 className="text-sm font-semibold mb-3 uppercase tracking-wider text-muted-foreground">Micronutrients</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { l: "Fiber", v: `${(food.per100g.fiber * mult).toFixed(1)}g` },
                { l: "Sugar", v: `${(food.per100g.sugar * mult).toFixed(1)}g` },
                { l: "Sodium", v: `${Math.round(food.per100g.sodium * mult)}mg` },
                { l: "Serving", v: `${grams}g` },
              ].map((r) => (
                <div key={r.l} className="p-3 rounded-lg bg-white/[0.03] flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{r.l}</span>
                  <span className="font-semibold tabular text-sm">{r.v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}

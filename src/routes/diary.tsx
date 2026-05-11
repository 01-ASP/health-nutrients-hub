import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Flame, Trash2, Plus, Calendar } from "lucide-react";
import { useDiary } from "@/store/diary";
import { Counter } from "@/lib/counter";

export const Route = createFileRoute("/diary")({
  head: () => ({ meta: [{ title: "Diary — NutriLens" }, { name: "description", content: "Track meals across the week." }] }),
  component: DiaryPage,
});

function fmtDate(d: Date) { return d.toISOString().slice(0, 10); }

function DiaryPage() {
  const meals = useDiary((s) => s.meals);
  const goal = useDiary((s) => s.goal);
  const remove = useDiary((s) => s.remove);
  const today = new Date();
  const [selected, setSelected] = useState(fmtDate(today));

  const week = useMemo(() => {
    const arr: Date[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today); d.setDate(d.getDate() - i); arr.push(d);
    }
    return arr;
  }, []);

  const dayMeals = meals.filter((m) => m.date === selected);
  const totals = dayMeals.reduce((a, m) => ({ kcal: a.kcal + m.kcal, p: a.p + m.protein, c: a.c + m.carbs, f: a.f + m.fat }), { kcal: 0, p: 0, c: 0, f: 0 });
  const streak = useMemo(() => {
    const dates = new Set(meals.map((m) => m.date));
    let n = 0; const d = new Date();
    while (dates.has(fmtDate(d))) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }, [meals]);

  return (
    <div className="max-w-7xl mx-auto px-5 md:px-8 py-10 md:py-14">
      <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-5xl font-bold">Your meal diary</h1>
          <p className="text-muted-foreground mt-2">Log your meals. Spot patterns. Get better.</p>
        </div>
        {streak > 0 && (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--coral)]/30 bg-[var(--coral)]/10">
            <motion.span animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 1.6 }}>
              <Flame className="w-4 h-4 text-[var(--coral)]" />
            </motion.span>
            <span className="text-sm font-semibold">{streak} day streak</span>
          </motion.div>
        )}
      </div>

      <div className="glass p-3 mb-6 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {week.map((d) => {
            const k = fmtDate(d); const active = k === selected;
            const dayKcal = meals.filter((m) => m.date === k).reduce((s, m) => s + m.kcal, 0);
            return (
              <button key={k} onClick={() => setSelected(k)} className={`flex-1 min-w-[68px] flex flex-col items-center gap-1 py-3 px-2 rounded-xl transition-all ${active ? "bg-primary text-primary-foreground" : "hover:bg-white/5"}`}>
                <span className="text-[10px] uppercase tracking-wider opacity-70">{d.toLocaleDateString(undefined, { weekday: "short" })}</span>
                <span className="text-lg font-bold tabular">{d.getDate()}</span>
                <span className="text-[10px] opacity-70 tabular">{dayKcal} kcal</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-3">
          {dayMeals.length === 0 ? (
            <div className="glass p-10 md:p-16 text-center">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                <Calendar className="w-7 h-7 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-2">No meals logged</h3>
              <p className="text-muted-foreground text-sm mb-6">Start by analyzing a photo.</p>
              <Link to="/analyze" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-semibold">
                <Plus className="w-4 h-4" /> Add a meal
              </Link>
            </div>
          ) : dayMeals.map((m, i) => (
            <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="glass p-4 flex items-center gap-4">
              {m.image ? <img src={m.image} alt={m.name} className="w-16 h-16 rounded-xl object-cover" /> : <div className="w-16 h-16 rounded-xl bg-white/5" />}
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{m.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{m.time}</div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <span className="px-2 py-0.5 text-[10px] rounded-full bg-[var(--protein)]/15 text-[var(--protein)]">P {m.protein}g</span>
                  <span className="px-2 py-0.5 text-[10px] rounded-full bg-[var(--amber)]/15 text-[var(--amber)]">C {m.carbs}g</span>
                  <span className="px-2 py-0.5 text-[10px] rounded-full bg-[var(--coral)]/15 text-[var(--coral)]">F {m.fat}g</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-[var(--amber)] tabular leading-none">{m.kcal}</div>
                <div className="text-[10px] text-muted-foreground mt-1">kcal</div>
              </div>
              <button onClick={() => remove(m.id)} className="p-2 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-[var(--coral)]"><Trash2 className="w-4 h-4" /></button>
            </motion.div>
          ))}
        </div>

        <aside className="space-y-4">
          <div className="glass p-5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Day total</div>
            <div className="text-4xl font-bold text-[var(--amber)] tabular mt-1"><Counter value={totals.kcal} /> <span className="text-sm text-muted-foreground font-medium">kcal</span></div>
            <div className="mt-3 text-xs text-muted-foreground">{Math.max(0, goal - totals.kcal)} kcal left of {goal}</div>
            <div className="mt-2 h-2 rounded-full bg-white/5 overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, (totals.kcal / goal) * 100)}%` }} className="h-full bg-primary" />
            </div>
            <div className="mt-5 space-y-3">
              {[
                { l: "Protein", v: totals.p, c: "var(--protein)", max: 120 },
                { l: "Carbs", v: totals.c, c: "var(--amber)", max: 260 },
                { l: "Fat", v: totals.f, c: "var(--coral)", max: 70 },
              ].map((row) => (
                <div key={row.l}>
                  <div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">{row.l}</span><span className="tabular">{row.v.toFixed(0)} / {row.max}g</span></div>
                  <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, (row.v / row.max) * 100)}%` }} style={{ background: row.c }} className="h-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <Link to="/analyze" className="glass glass-hover p-4 flex items-center gap-3 cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center"><Plus className="w-5 h-5" /></div>
            <div><div className="font-semibold">Log a new meal</div><div className="text-xs text-muted-foreground">Snap or upload a photo</div></div>
          </Link>
        </aside>
      </div>
    </div>
  );
}

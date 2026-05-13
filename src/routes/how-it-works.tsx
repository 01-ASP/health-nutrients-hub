import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Upload, ScanLine, Tag, Scale, Database, Sparkles } from "lucide-react";
import { Counter } from "@/lib/counter";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({ meta: [{ title: "How it works — IntelliBite" }, { name: "description", content: "From photo to nutrition in 6 steps." }] }),
  component: HowItWorks,
});

const STEPS = [
  { icon: Upload, title: "Upload photo", body: "JPG, PNG or WEBP. Any meal, any angle." },
  { icon: ScanLine, title: "Vision detection", body: "Google Gemini vision scans the plate and finds every item." },
  { icon: Tag, title: "Food classification", body: "The model labels each item with a confidence score." },
  { icon: Scale, title: "Portion estimation", body: "Visual cues estimate grams without manual input." },
  { icon: Database, title: "Nutrition mapping", body: "Cross-referenced with a curated nutrition database." },
  { icon: Sparkles, title: "Results rendered", body: "Calories, macros, micros — visualized and saveable." },
];

function HowItWorks() {
  return (
    <div className="max-w-7xl mx-auto px-5 md:px-8 py-10 md:py-14">
      <h1 className="text-3xl md:text-5xl font-bold max-w-2xl">From a single photo to <span className="text-primary">complete nutrition</span> — in seconds.</h1>
      <p className="text-muted-foreground mt-3 max-w-2xl">A pipeline of detection, classification, and nutrition mapping makes IntelliBite fast and surprisingly accurate.</p>

      <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {STEPS.map((s, i) => (
          <motion.div key={s.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }} className="glass p-6 relative">
            <div className="absolute top-4 right-4 text-xs font-bold text-muted-foreground tabular">0{i + 1}</div>
            <div className="w-11 h-11 rounded-xl bg-primary/15 text-primary flex items-center justify-center mb-4">
              <s.icon className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold">{s.title}</h3>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{s.body}</p>
          </motion.div>
        ))}
      </div>

      <div className="mt-12 glass p-8 md:p-10">
        <div className="grid md:grid-cols-[1fr_auto] gap-6 items-center">
          <div>
            <div className="text-xs uppercase tracking-wider text-primary mb-2">The tech</div>
            <h3 className="text-2xl md:text-3xl font-bold">Powered by Google Gemini multimodal vision via the Lovable AI Gateway.</h3>
            <p className="text-muted-foreground mt-3 max-w-2xl">No custom model training required — Gemini handles detection, classification, and portion estimation in one pass. Privacy-first: your photos are never stored.</p>
          </div>
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" /> Gemini · Multimodal · Lovable AI
          </span>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-4">
          {[
            { v: 90, suf: "%+", l: "Typical detection accuracy" },
            { v: 100, suf: "+", l: "Foods recognised" },
            { v: 2, suf: "s", l: "Avg inference time", d: 0 },
          ].map((s) => (
            <div key={s.l} className="text-center">
              <div className="text-3xl md:text-4xl font-bold"><Counter value={s.v} suffix={s.suf} decimals={s.d ?? 0} /></div>
              <div className="text-xs text-muted-foreground mt-1">{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

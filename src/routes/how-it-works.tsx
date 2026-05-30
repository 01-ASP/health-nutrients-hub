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

    </div>
  );
}

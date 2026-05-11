import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Camera, Zap, ScanLine } from "lucide-react";
import { Counter } from "@/lib/counter";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  return (
    <div className="relative">
      <div className="absolute inset-0 grain pointer-events-none" />
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[80vw] h-[60vh] rounded-full blur-3xl opacity-30 bg-primary/30 pointer-events-none" />

      <section className="relative max-w-7xl mx-auto px-5 md:px-8 pt-16 md:pt-28 pb-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="text-center max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 text-xs text-muted-foreground mb-6">
            <Sparkles className="w-3 h-3 text-primary" /> AI-powered food intelligence
          </span>
          <h1 className="text-[40px] sm:text-6xl md:text-7xl font-bold leading-[1.05]">
            Know exactly what <br className="hidden md:block" />
            you're <span className="text-primary">eating.</span>
          </h1>
          <p className="mt-6 text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Upload any meal photo. Our AI identifies every food item and breaks down calories, macros, and nutrition — in seconds.
          </p>
          <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/analyze" className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-primary text-primary-foreground font-semibold hover:scale-[1.02] transition-transform shadow-[0_10px_40px_-10px_rgba(34,197,94,0.6)]">
              <Camera className="w-4 h-4" />
              Upload a meal photo
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link to="/how-it-works" className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-white/10 text-foreground hover:border-[var(--amber)] hover:text-[var(--amber)] transition-colors">
              See it in action
            </Link>
          </div>
        </motion.div>

        {/* Demo phone mockup */}
        <DemoMockup />

        {/* Social proof */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Meals analyzed", value: 10472, suffix: "+" },
            { label: "Detection accuracy", value: 95, suffix: "%" },
            { label: "Cuisine types", value: 12, suffix: "" },
          ].map((s) => (
            <div key={s.label} className="glass glass-hover p-6 text-center">
              <div className="text-3xl md:text-4xl font-bold text-foreground">
                <Counter value={s.value} suffix={s.suffix} />
              </div>
              <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-5 md:px-8 pb-24">
        <h2 className="text-3xl md:text-5xl font-bold text-center mb-12">Built for people who care.</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { icon: ScanLine, title: "Computer vision", body: "YOLOv8 detection finds every item in a single photo — even on cluttered plates." },
            { icon: Zap, title: "Instant nutrition", body: "Macros, micros, and calories mapped from a 50,000+ food database in milliseconds." },
            { icon: Sparkles, title: "Smart insights", body: "Personalized nudges that help you eat better — without judgement or guilt." },
          ].map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="glass glass-hover p-6">
              <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center mb-4">
                <f.icon className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.body}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}

function DemoMockup() {
  const boxes = [
    { id: 1, label: "Biryani · 412 kcal", x: 18, y: 28, w: 50, h: 36, color: "var(--amber)" },
    { id: 2, label: "Salad · 88 kcal", x: 60, y: 18, w: 30, h: 28, color: "var(--primary)" },
    { id: 3, label: "Raita · 64 kcal", x: 14, y: 64, w: 30, h: 26, color: "var(--coral)" },
  ];
  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8 }} className="mt-16 relative mx-auto max-w-[680px]">
      <div className="absolute -inset-10 bg-primary/10 blur-3xl rounded-full" />
      <div className="relative glass p-3 md:p-4">
        <div className="relative rounded-xl overflow-hidden aspect-[16/10] bg-[oklch(0.22_0_0)]">
          <img src="https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=1200&q=80" alt="meal" className="w-full h-full object-cover" />
          {/* scanning line */}
          <motion.div
            initial={{ y: "-10%" }}
            animate={{ y: "110%" }}
            transition={{ repeat: Infinity, duration: 2.6, ease: "linear" }}
            className="absolute inset-x-0 h-[2px] bg-primary shadow-[0_0_20px_4px_rgba(34,197,94,0.6)]"
          />
          {boxes.map((b, i) => (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1 + i * 0.4, duration: 0.4 }}
              className="absolute"
              style={{ left: `${b.x}%`, top: `${b.y}%`, width: `${b.w}%`, height: `${b.h}%`, border: `2px solid ${b.color}`, borderRadius: 8 }}
            >
              <span className="absolute -top-7 left-0 px-2 py-1 rounded-md text-[10px] md:text-xs font-semibold whitespace-nowrap" style={{ background: b.color, color: "#0f0f0f" }}>{b.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

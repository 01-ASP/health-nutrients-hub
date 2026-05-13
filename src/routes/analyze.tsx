import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UploadCloud,
  Camera,
  Loader2,
  ChevronDown,
  Save,
  Share2,
  RefreshCw,
  Sparkles,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { mockAnalyze, insightFor, type AnalyzedItem } from "@/lib/analyze";
import { analyzeFoodImage } from "@/lib/vision.functions";
import { SAMPLE_MEALS } from "@/data/foods";
import { useDiary } from "@/store/diary";
import { Counter } from "@/lib/counter";

export const Route = createFileRoute("/analyze")({
  head: () => ({
    meta: [
      { title: "Analyze a meal — IntelliBite" },
      { name: "description", content: "Upload a photo and get an instant nutrition breakdown." },
    ],
  }),
  component: AnalyzePage,
});

type Phase = "idle" | "loading" | "done";
const STEPS = ["Detecting food items…", "Estimating portions…", "Calculating nutrition…"];

const ACCEPTED_MEDIA = /\.(jpe?g|png|webp|heic|heif|mov|mp4|m4v)$/i;

function isLivePhotoVideo(file: File) {
  return /video\/(quicktime|mp4|x-m4v)/i.test(file.type) || /\.(mov|mp4|m4v)$/i.test(file.name);
}

function isHeicPhoto(file: File) {
  return /image\/(heic|heif)/i.test(file.type) || /\.(heic|heif)$/i.test(file.name);
}

function isAcceptedMedia(file: File) {
  return (
    ACCEPTED_MEDIA.test(file.name) ||
    /image\/(jpeg|png|webp|heic|heif)/i.test(file.type) ||
    isLivePhotoVideo(file)
  );
}

async function fileToCompressedDataUrl(file: File, maxDim = 640, quality = 0.65): Promise<string> {
  if (isLivePhotoVideo(file)) return videoFrameToDataUrl(file, maxDim, quality);
  const source = isHeicPhoto(file) ? await heicToJpegBlob(file, quality) : file;
  return blobToCompressedDataUrl(source, maxDim, quality);
}

async function heicToJpegBlob(file: File, quality: number): Promise<Blob> {
  const { default: heic2any } = await import("heic2any");
  const converted = await heic2any({ blob: file, toType: "image/jpeg", quality });
  const blob = Array.isArray(converted) ? converted[0] : converted;
  if (!blob) throw new Error("Could not read the HEIC photo.");
  return blob;
}

async function blobToCompressedDataUrl(
  blob: Blob,
  maxDim: number,
  quality: number,
): Promise<string> {
  const bitmap = await createImageBitmap(blob);
  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close?.();
  return canvas.toDataURL("image/jpeg", quality);
}

async function videoFrameToDataUrl(file: File, maxDim: number, quality: number): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const video = document.createElement("video");
    video.src = url;
    video.muted = true;
    video.playsInline = true;
    video.preload = "metadata";
    await new Promise<void>((resolve, reject) => {
      const timeout = window.setTimeout(
        () => reject(new Error("Live Photo took too long to load.")),
        10000,
      );
      video.onloadedmetadata = () => {
        video.currentTime = Number.isFinite(video.duration)
          ? Math.min(0.25, Math.max(0, video.duration / 2))
          : 0;
      };
      video.onseeked = () => {
        window.clearTimeout(timeout);
        resolve();
      };
      video.onerror = () => {
        window.clearTimeout(timeout);
        reject(new Error("Could not read the Live Photo video."));
      };
      video.load();
    });
    const scale = Math.min(1, maxDim / Math.max(video.videoWidth, video.videoHeight));
    const w = Math.max(1, Math.round(video.videoWidth * scale));
    const h = Math.max(1, Math.round(video.videoHeight * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(video, 0, 0, w, h);
    return canvas.toDataURL("image/jpeg", quality);
  } finally {
    URL.revokeObjectURL(url);
  }
}

function AnalyzePage() {
  const [image, setImage] = useState<{
    url: string;
    name: string;
    size: number;
    sampleId?: string;
    file?: File;
  } | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [step, setStep] = useState(0);
  const [items, setItems] = useState<AnalyzedItem[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const add = useDiary((s) => s.add);
  const goal = useDiary((s) => s.goal);
  const analyzeFn = useServerFn(analyzeFoodImage);

  const handleFile = (f: File) => {
    if (f.size > 10 * 1024 * 1024) {
      toast.error("Image too large", { description: "Max size is 10MB." });
      return;
    }
    if (!isAcceptedMedia(f)) {
      toast.error("Unsupported format", {
        description: "Use JPG, PNG, WEBP, HEIC, or a Live Photo video.",
      });
      return;
    }
    setImage({ url: URL.createObjectURL(f), name: f.name, size: f.size, file: f });
    setPhase("idle");
    setItems([]);
  };

  const pickSample = (id: string) => {
    const s = SAMPLE_MEALS.find((m) => m.id === id)!;
    setImage({ url: s.img, name: `${s.name}.jpg`, size: 1024 * 380, sampleId: id });
    setPhase("idle");
    setItems([]);
  };

  const runAnalysis = async () => {
    if (!image) return;
    setPhase("loading");
    setStep(0);
    const tick = setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 900);
    try {
      let result: AnalyzedItem[];
      if (image.file) {
        const dataUrl = await fileToCompressedDataUrl(image.file);
        const res = await analyzeFn({ data: { imageDataUrl: dataUrl } });
        if (!res.items?.length) throw new Error("No food detected. Try a clearer photo.");
        result = res.items.map((it, i) => ({ id: `${it.name}-${i}`, ...it }));
      } else {
        // sample meals keep the curated mock pipeline
        await new Promise((r) => setTimeout(r, 1800));
        result = mockAnalyze(image.sampleId);
      }
      setItems(result);
      setPhase("done");
      toast.success("Analysis complete", { description: `${result.length} items detected` });
    } catch (e) {
      console.error(e);
      toast.error("Analysis failed", {
        description: e instanceof Error ? e.message : "Please try again.",
      });
      setPhase("idle");
    } finally {
      clearInterval(tick);
    }
  };

  const total = items.reduce(
    (a, b) => ({
      kcal: a.kcal + b.kcal,
      protein: a.protein + b.protein,
      carbs: a.carbs + b.carbs,
      fat: a.fat + b.fat,
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 },
  );

  const saveToDiary = () => {
    if (!image || items.length === 0) return;
    const now = new Date();
    add({
      id: String(Date.now()),
      date: now.toISOString().slice(0, 10),
      time: now.toTimeString().slice(0, 5),
      name: items.map((i) => i.name).join(" + "),
      image: image.url,
      kcal: total.kcal,
      protein: +total.protein.toFixed(1),
      carbs: +total.carbs.toFixed(1),
      fat: +total.fat.toFixed(1),
    });
    toast.success("Meal saved to diary 🌱");
  };

  const reset = () => {
    setImage(null);
    setItems([]);
    setPhase("idle");
  };

  return (
    <div className="max-w-7xl mx-auto px-5 md:px-8 py-10 md:py-14">
      <div className="mb-8 md:mb-12">
        <h1 className="text-3xl md:text-5xl font-bold">Analyze a meal</h1>
        <p className="mt-2 text-muted-foreground">Upload or pick a sample. Results in seconds.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* LEFT */}
        <div className="space-y-6">
          {!image ? (
            <label
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const f = e.dataTransfer.files?.[0];
                if (f) handleFile(f);
              }}
              className="relative block cursor-pointer rounded-2xl border-2 border-dashed border-white/15 hover:border-primary/60 transition-colors p-10 md:p-14 text-center"
            >
              <div className="absolute inset-0 rounded-2xl dashed-anim opacity-30 pointer-events-none" />
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic,image/heif,video/quicktime,video/mp4"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
              <div className="relative">
                <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/15 text-primary flex items-center justify-center mb-4">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <p className="text-lg font-semibold">Drop your meal photo here</p>
                <p className="text-sm text-muted-foreground mt-1">or click to browse · max 10MB</p>
                <div className="mt-5 flex items-center justify-center gap-2">
                  {["JPG", "PNG", "WEBP", "HEIC", "LIVE"].map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 text-[10px] font-semibold tracking-wide rounded-md bg-white/5 text-muted-foreground"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    fileRef.current?.setAttribute("capture", "environment");
                    fileRef.current?.click();
                  }}
                  className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 text-sm hover:border-primary/40"
                >
                  <Camera className="w-4 h-4" /> Use camera
                </button>
              </div>
            </label>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass p-3"
            >
              <div className="relative rounded-xl overflow-hidden aspect-[4/3] bg-black/40">
                {image.file && isLivePhotoVideo(image.file) ? (
                  <video
                    src={image.url}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                    controls={false}
                  />
                ) : (
                  <img src={image.url} alt={image.name} className="w-full h-full object-cover" />
                )}
                {phase === "loading" && (
                  <motion.div
                    initial={{ y: "-10%" }}
                    animate={{ y: "110%" }}
                    transition={{ repeat: Infinity, duration: 1.8, ease: "linear" }}
                    className="absolute inset-x-0 h-[2px] bg-primary shadow-[0_0_20px_4px_rgba(34,197,94,0.6)]"
                  />
                )}
                {phase === "done" &&
                  items.map((it, i) => (
                    <motion.div
                      key={it.id + i}
                      initial={{ opacity: 0, scale: 0.92 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.15 + i * 0.2, duration: 0.35 }}
                      className="absolute"
                      style={{
                        left: `${it.bbox.x}%`,
                        top: `${it.bbox.y}%`,
                        width: `${it.bbox.w}%`,
                        height: `${it.bbox.h}%`,
                        border: `2px solid var(--amber)`,
                        borderRadius: 10,
                      }}
                    >
                      <span className="absolute -top-7 left-0 px-2 py-1 rounded-md text-[10px] md:text-xs font-semibold whitespace-nowrap bg-[var(--amber)] text-black">
                        {it.name} · {it.kcal} kcal
                      </span>
                    </motion.div>
                  ))}
                <button
                  onClick={reset}
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 hover:bg-black/80 border border-white/10"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="px-2 pt-3 pb-1 flex items-center justify-between text-xs text-muted-foreground">
                <span className="truncate">{image.name}</span>
                <span>{(image.size / 1024).toFixed(0)} KB</span>
              </div>
            </motion.div>
          )}

          <button
            disabled={!image || phase === "loading"}
            onClick={runAnalysis}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-primary text-primary-foreground font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.01] transition-transform shadow-[0_10px_40px_-10px_rgba(34,197,94,0.5)]"
          >
            {phase === "loading" ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />{" "}
                {STEPS[Math.min(step, STEPS.length - 1)]}
              </>
            ) : (
              <>Analyze meal</>
            )}
          </button>

          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
              Or try a sample
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {SAMPLE_MEALS.map((s) => (
                <motion.button
                  key={s.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => pickSample(s.id)}
                  className="glass glass-hover group relative overflow-hidden rounded-xl aspect-square"
                >
                  <img
                    src={s.img}
                    alt={s.name}
                    className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute bottom-2 left-2 right-2 text-left">
                    <div className="text-xs font-semibold leading-tight">
                      {s.emoji} {s.name}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="space-y-4">
          {phase === "idle" && (
            <div className="glass p-10 text-center text-muted-foreground">
              <Sparkles className="w-8 h-8 mx-auto mb-3 text-primary/60" />
              <p className="font-medium text-foreground">Results will appear here</p>
              <p className="text-sm mt-1">Upload a photo or pick a sample to begin.</p>
            </div>
          )}

          {phase === "loading" && (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="glass p-5">
                  <div className="h-4 w-1/3 rounded shimmer mb-3" />
                  <div className="h-3 w-1/2 rounded shimmer mb-4" />
                  <div className="h-2 w-full rounded shimmer" />
                </div>
              ))}
            </div>
          )}

          {phase === "done" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <SummaryCard total={total} goal={goal} />
              <InsightChip text={insightFor(items)} />
              <div className="space-y-3">
                {items.map((it, i) => (
                  <FoodCard key={i} item={it} index={i} />
                ))}
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  onClick={saveToDiary}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-primary text-primary-foreground font-semibold text-sm"
                >
                  <Save className="w-4 h-4" /> Save to diary
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(
                      `${total.kcal} kcal · ${items.map((i) => i.name).join(", ")}`,
                    );
                    toast.success("Copied to clipboard");
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-white/10 text-sm hover:border-white/30"
                >
                  <Share2 className="w-4 h-4" /> Share
                </button>
                <button
                  onClick={reset}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-white/10 text-sm hover:border-white/30"
                >
                  <RefreshCw className="w-4 h-4" /> Analyze another
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  total,
  goal,
}: {
  total: { kcal: number; protein: number; carbs: number; fat: number };
  goal: number;
}) {
  const pct = Math.min(100, Math.round((total.kcal / goal) * 100));
  const data = [
    { name: "Protein", value: total.protein * 4, color: "var(--protein)" },
    { name: "Carbs", value: total.carbs * 4, color: "var(--amber)" },
    { name: "Fat", value: total.fat * 9, color: "var(--coral)" },
  ];
  return (
    <div className="glass p-5">
      <div className="flex items-center gap-5">
        <div className="w-28 h-28 relative flex-shrink-0">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                innerRadius={36}
                outerRadius={52}
                paddingAngle={3}
                stroke="none"
              >
                {data.map((d, i) => (
                  <Cell key={i} fill={d.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
            macros
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs text-muted-foreground uppercase tracking-wider">
            Total calories
          </div>
          <div className="text-5xl font-bold text-[var(--amber)] tabular leading-none mt-1">
            <Counter value={total.kcal} />{" "}
            <span className="text-base text-muted-foreground font-medium">kcal</span>
          </div>
          <div className="mt-3 flex gap-3 text-xs">
            <Macro color="var(--protein)" label="P" value={total.protein} />
            <Macro color="var(--amber)" label="C" value={total.carbs} />
            <Macro color="var(--coral)" label="F" value={total.fat} />
          </div>
        </div>
      </div>
      <div className="mt-5">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
          <span>
            {pct}% of {goal} kcal daily goal
          </span>
          <span>{Math.max(0, goal - total.kcal)} kcal left</span>
        </div>
        <div className="h-2 rounded-full bg-white/5 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="h-full bg-primary"
          />
        </div>
      </div>
    </div>
  );
}

function Macro({ color, label, value }: { color: string; label: string; value: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold tabular text-foreground">{value.toFixed(1)}g</span>
    </div>
  );
}

function InsightChip({ text }: { text: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-3 p-4 rounded-2xl border border-[var(--amber)]/30 bg-[var(--amber)]/5"
    >
      <Sparkles className="w-4 h-4 text-[var(--amber)] mt-0.5 flex-shrink-0" />
      <p className="text-sm leading-relaxed">{text}</p>
    </motion.div>
  );
}

function FoodCard({ item, index }: { item: AnalyzedItem; index: number }) {
  const [open, setOpen] = useState(false);
  const totalMacroG = item.protein + item.carbs + item.fat;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="glass overflow-hidden"
    >
      <button onClick={() => setOpen((s) => !s)} className="w-full p-5 text-left">
        <div className="flex items-start gap-3">
          <span className="text-3xl">{item.emoji}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center flex-wrap gap-2">
              <h4 className="font-bold text-lg">{item.name}</h4>
              <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-primary/15 text-primary">
                {Math.round(item.confidence * 100)}% match
              </span>
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">{item.portion}</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-[var(--amber)] tabular leading-none">
              <Counter value={item.kcal} />
            </div>
            <div className="text-[10px] text-muted-foreground mt-1">kcal</div>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
          />
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {[
            { l: "Protein", v: item.protein, c: "var(--protein)" },
            { l: "Carbs", v: item.carbs, c: "var(--amber)" },
            { l: "Fat", v: item.fat, c: "var(--coral)" },
          ].map((m) => (
            <div key={m.l}>
              <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
                <span>{m.l}</span>
                <span className="tabular">{m.v.toFixed(1)}g</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (m.v / Math.max(1, totalMacroG)) * 100)}%` }}
                  transition={{ duration: 0.8, delay: 0.1 + index * 0.08 }}
                  style={{ background: m.c }}
                  className="h-full"
                />
              </div>
            </div>
          ))}
        </div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-white/5"
          >
            <div className="px-5 py-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              {[
                { l: "Fiber", v: `${item.fiber}g` },
                { l: "Sugar", v: `${item.sugar}g` },
                { l: "Sodium", v: `${item.sodium}mg` },
                { l: "Weight", v: `${item.grams}g` },
              ].map((d) => (
                <div key={d.l} className="p-3 rounded-lg bg-white/[0.03]">
                  <div className="text-muted-foreground">{d.l}</div>
                  <div className="font-semibold tabular mt-0.5">{d.v}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

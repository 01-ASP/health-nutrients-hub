# IntelliBite — AI Food Calorie Estimation

IntelliBite is a premium, AI-powered web app that turns a single food photo into a full nutrition breakdown — calories, macros, micros, and per-item bounding boxes — in seconds.

> Think Linear meets MyFitnessPal meets Vercel aesthetic.

## Features

- **Photo → Nutrition** — Upload or capture a meal photo and get per-item kcal, protein, carbs, fat, fiber, sugar and sodium.
- **Real vision AI** — Uses Google Gemini 2.5 Flash (vision) via the Lovable AI Gateway to detect every distinct food item with bounding boxes and confidence scores.
- **Meal Diary** — Weekly calendar, daily totals vs. a 2000 kcal goal, and a streak tracker. Persisted with Zustand + localStorage.
- **Food Explorer** — Searchable database with category filters and a live serving-size slider (50g–500g) that recalculates nutrition in real time.
- **How It Works** — Visual 6-step pipeline explainer (detection → classification → portion → nutrition mapping).
- **Premium UI** — Deep charcoal theme, glassmorphism, grain texture, animated macro donut, staggered bounding boxes, Framer Motion micro-interactions.

## Tech Stack

- **Framework**: TanStack Start v1 (React 19, SSR, file-based routing)
- **Build**: Vite 7
- **Styling**: Tailwind CSS v4 (CSS-variable design tokens in `src/styles.css`)
- **UI**: shadcn/ui, Radix primitives, lucide-react icons
- **Animation**: Framer Motion
- **Charts**: Recharts
- **State**: Zustand (with `persist` middleware)
- **Notifications**: Sonner
- **AI**: Lovable AI Gateway → `google/gemini-2.5-flash`
- **Runtime**: Cloudflare Workers (Edge) via Wrangler
- **Language**: TypeScript (strict)

> **No Python is used in this project.** The whole stack is TypeScript/JavaScript. Vision inference is done by calling the Gemini 2.5 Flash multimodal model through the Lovable AI Gateway from a TanStack `createServerFn` server function (`src/lib/vision.functions.ts`) — there is no Python backend, no local YOLO/PyTorch model, no Python service. The "YOLOv8 + CNN" copy on the How It Works page is a visual explainer of the pipeline concept; the actual detection is performed by Gemini's multimodal vision.

## Project Structure

```
src/
  routes/
    __root.tsx            # Root layout + global SEO
    index.tsx             # Landing
    analyze.tsx           # Upload / camera → AI analysis
    diary.tsx             # Meal diary + streak
    explore.tsx           # Food database explorer
    how-it-works.tsx      # Pipeline explainer
  components/Layout.tsx   # Nav + footer shell
  lib/
    vision.functions.ts   # createServerFn → Gemini vision call
    analyze.ts            # Mock pipeline for sample meals
  data/foods.ts           # Curated 12-food sample database
  store/diary.ts          # Zustand store (persisted)
  styles.css              # Design tokens (oklch), grain, animations
```

## Getting Started

```bash
bun install
bun dev
```

Open http://localhost:5173.

### Environment

The vision server function reads `LOVABLE_API_KEY` at runtime:

```
LOVABLE_API_KEY=...   # provided automatically inside Lovable Cloud
```

If you run outside Lovable, set this in your Worker / hosting environment.

## Scripts

- `bun dev` — start the dev server
- `bun run build` — production build
- `bun run preview` — preview the production build

## How the AI Pipeline Works

1. The user uploads or captures a photo on `/analyze`.
2. The image is compressed client-side to ~1024px JPEG and base64-encoded.
3. `analyzeFoodImage` (a TanStack `createServerFn`) POSTs it to the Lovable AI Gateway with a strict JSON schema prompt.
4. Gemini 2.5 Flash returns each detected item with name, emoji, confidence, grams, portion, full macro/micro nutrition, and a percentage bounding box.
5. The UI animates bounding boxes in with a 200ms stagger and renders an animated macro donut + per-item cards.
6. Results can be saved to the diary (Zustand + localStorage).

## Design System

- **Background**: `#0F0F0F` deep charcoal
- **Text**: `#F5F2EE` warm off-white
- **Primary / healthy / CTA**: `#22C55E` green
- **Calories & carbs**: `#F59E0B` amber
- **Fat & warnings**: `#F97316` coral
- **Protein**: `#60A5FA` blue

All tokens are defined as `oklch` CSS variables in `src/styles.css`. Components consume semantic tokens (`bg-background`, `text-foreground`, `text-primary`, etc.) — never raw hex.

## Deployment

This template targets Cloudflare Workers via `wrangler.jsonc`. Any platform that runs a TanStack Start Worker build works.

## License

MIT

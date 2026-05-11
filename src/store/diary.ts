import { create } from "zustand";
import { persist } from "zustand/middleware";

export type DiaryMeal = {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  name: string;
  image?: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
};

type State = {
  meals: DiaryMeal[];
  goal: number;
  add: (m: DiaryMeal) => void;
  remove: (id: string) => void;
};

export const useDiary = create<State>()(
  persist(
    (set) => ({
      meals: [],
      goal: 2000,
      add: (m) => set((s) => ({ meals: [m, ...s.meals] })),
      remove: (id) => set((s) => ({ meals: s.meals.filter((x) => x.id !== id) })),
    }),
    { name: "nutrilens-diary" }
  )
);

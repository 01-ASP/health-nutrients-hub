export type FoodItem = {
  id: string;
  name: string;
  emoji: string;
  per100g: { kcal: number; protein: number; carbs: number; fat: number; fiber: number; sugar: number; sodium: number };
  tags: ("Vegetarian" | "High Protein" | "Low Carb" | "Indian" | "Fast Food" | "Breakfast")[];
};

export const FOODS: FoodItem[] = [
  { id: "biriyani", name: "Chicken Biriyani", emoji: "🍛", per100g: { kcal: 198, protein: 9, carbs: 26, fat: 7, fiber: 1.2, sugar: 1, sodium: 420 }, tags: ["High Protein", "Indian"] },
  { id: "salad", name: "Garden Salad", emoji: "🥗", per100g: { kcal: 35, protein: 1.5, carbs: 6, fat: 0.4, fiber: 2.1, sugar: 3, sodium: 28 }, tags: ["Vegetarian", "Low Carb"] },
  { id: "pizza", name: "Pepperoni Pizza", emoji: "🍕", per100g: { kcal: 285, protein: 11, carbs: 33, fat: 12, fiber: 2, sugar: 3.6, sodium: 640 }, tags: ["Fast Food"] },
  { id: "pancakes", name: "Pancakes", emoji: "🥞", per100g: { kcal: 227, protein: 6, carbs: 28, fat: 9, fiber: 1, sugar: 6, sodium: 430 }, tags: ["Breakfast", "Vegetarian"] },
  { id: "idli", name: "Idli & Sambar", emoji: "🍲", per100g: { kcal: 132, protein: 4, carbs: 25, fat: 1.2, fiber: 1.5, sugar: 2, sodium: 380 }, tags: ["Vegetarian", "Indian", "Breakfast"] },
  { id: "burger", name: "Cheeseburger", emoji: "🍔", per100g: { kcal: 295, protein: 15, carbs: 24, fat: 14, fiber: 1.4, sugar: 4, sodium: 510 }, tags: ["Fast Food", "High Protein"] },
  { id: "rice", name: "Steamed Rice", emoji: "🍚", per100g: { kcal: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4, sugar: 0.1, sodium: 1 }, tags: ["Vegetarian"] },
  { id: "chicken", name: "Grilled Chicken", emoji: "🍗", per100g: { kcal: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, sugar: 0, sodium: 74 }, tags: ["High Protein", "Low Carb"] },
  { id: "avocado", name: "Avocado Toast", emoji: "🥑", per100g: { kcal: 212, protein: 5, carbs: 18, fat: 14, fiber: 6, sugar: 1, sodium: 280 }, tags: ["Breakfast", "Vegetarian"] },
  { id: "pasta", name: "Pasta Marinara", emoji: "🍝", per100g: { kcal: 158, protein: 5, carbs: 30, fat: 1.5, fiber: 2, sugar: 4, sodium: 350 }, tags: ["Vegetarian"] },
  { id: "dosa", name: "Masala Dosa", emoji: "🫓", per100g: { kcal: 168, protein: 4, carbs: 27, fat: 5, fiber: 2, sugar: 1, sodium: 410 }, tags: ["Indian", "Vegetarian", "Breakfast"] },
  { id: "sushi", name: "Salmon Sushi", emoji: "🍣", per100g: { kcal: 145, protein: 8, carbs: 22, fat: 3.5, fiber: 0.8, sugar: 3, sodium: 320 }, tags: ["High Protein"] },
];

export const SAMPLE_MEALS: { id: string; name: string; img: string; emoji: string; items: string[] }[] = [
  { id: "biriyani", name: "Chicken Biriyani", img: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=600&q=80", emoji: "🍛", items: ["biriyani", "salad"] },
  { id: "salad", name: "Garden Salad", img: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&q=80", emoji: "🥗", items: ["salad"] },
  { id: "pizza", name: "Pepperoni Pizza", img: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80", emoji: "🍕", items: ["pizza"] },
  { id: "pancakes", name: "Pancakes", img: "https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=600&q=80", emoji: "🥞", items: ["pancakes"] },
  { id: "idli", name: "Idli & Sambar", img: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&q=80", emoji: "🍲", items: ["idli"] },
  { id: "burger", name: "Cheeseburger", img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80", emoji: "🍔", items: ["burger"] },
];

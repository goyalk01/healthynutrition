/**
 * Prisma seed script — populates the database with realistic demo data.
 *
 * Usage:
 *   npm run prisma:seed
 *
 * Creates:
 * - 2 demo users with complete profiles and preferences
 * - 12+ meals across all meal types
 * - 5+ habits across all categories
 * - Meal logs and habit logs for the past 14 days
 * - AI-generated recommendations
 *
 * Idempotent: uses upsert to avoid duplicates on re-run.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS ?? 12);

async function main() {
  console.log("🌱 Seeding NutriSense database...\n");

  // ── Demo users ─────────────────────────────────────────────
  const passwordHash = await bcrypt.hash("Password1", BCRYPT_ROUNDS);

  const alice = await prisma.user.upsert({
    where: { email: "alice@nutrisense.demo" },
    update: {},
    create: {
      email: "alice@nutrisense.demo",
      name: "Alice Chen",
      passwordHash,
      age: 28,
      weight: 62,
      height: 168,
      activityLevel: "ACTIVE",
      goal: "MAINTAIN",
      dailyCalorieTarget: 2100,
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: "bob@nutrisense.demo" },
    update: {},
    create: {
      email: "bob@nutrisense.demo",
      name: "Bob Martinez",
      passwordHash,
      age: 34,
      weight: 85,
      height: 182,
      activityLevel: "MODERATE",
      goal: "LOSE_WEIGHT",
      dailyCalorieTarget: 1800,
    },
  });

  console.log(`  ✓ Users: ${alice.name}, ${bob.name}`);

  // ── Reset demo user domain data for idempotent re-seeds ─────
  const demoUserIds = [alice.id, bob.id];
  await prisma.$transaction([
    prisma.refreshToken.deleteMany({ where: { userId: { in: demoUserIds } } }),
    prisma.recommendation.deleteMany({ where: { userId: { in: demoUserIds } } }),
    prisma.mealLog.deleteMany({ where: { userId: { in: demoUserIds } } }),
    prisma.habitLog.deleteMany({ where: { userId: { in: demoUserIds } } }),
    prisma.habit.deleteMany({ where: { userId: { in: demoUserIds } } }),
    prisma.meal.deleteMany({ where: { userId: { in: demoUserIds } } }),
    prisma.userPreference.deleteMany({ where: { userId: { in: demoUserIds } } }),
  ]);

  // ── User preferences ──────────────────────────────────────
  await prisma.userPreference.upsert({
    where: { userId: alice.id },
    update: {},
    create: {
      userId: alice.id,
      dietaryRestrictions: JSON.stringify(["vegetarian"]),
      allergies: JSON.stringify(["peanuts"]),
      cuisinePrefs: JSON.stringify(["Mediterranean", "Japanese", "Indian"]),
      dislikedFoods: JSON.stringify(["liver", "olives"]),
    },
  });

  await prisma.userPreference.upsert({
    where: { userId: bob.id },
    update: {},
    create: {
      userId: bob.id,
      dietaryRestrictions: JSON.stringify([]),
      allergies: JSON.stringify(["shellfish"]),
      cuisinePrefs: JSON.stringify(["Mexican", "Italian", "Korean"]),
      dislikedFoods: JSON.stringify(["beets"]),
    },
  });

  console.log("  ✓ User preferences");

  // ── Meals ──────────────────────────────────────────────────
  const mealData = [
    { name: "Greek Yogurt Parfait", description: "Creamy yogurt with granola and berries", calories: 320, protein: 22, carbs: 42, fat: 8, fiber: 4, sugar: 18, mealType: "BREAKFAST", tags: '["high-protein","quick"]' },
    { name: "Overnight Oats", description: "Rolled oats soaked in almond milk with chia seeds", calories: 380, protein: 14, carbs: 58, fat: 12, fiber: 8, sugar: 12, mealType: "BREAKFAST", tags: '["meal-prep","fiber-rich"]' },
    { name: "Avocado Toast with Eggs", description: "Whole grain toast, smashed avocado, poached eggs", calories: 420, protein: 18, carbs: 35, fat: 24, fiber: 7, sugar: 3, mealType: "BREAKFAST", tags: '["healthy-fats","popular"]' },
    { name: "Grilled Chicken Salad", description: "Mixed greens, grilled chicken, cherry tomatoes, feta", calories: 480, protein: 42, carbs: 18, fat: 26, fiber: 5, sugar: 6, mealType: "LUNCH", tags: '["high-protein","low-carb"]' },
    { name: "Quinoa Buddha Bowl", description: "Quinoa, roasted vegetables, tahini dressing", calories: 520, protein: 18, carbs: 62, fat: 22, fiber: 10, sugar: 8, mealType: "LUNCH", tags: '["vegetarian","meal-prep"]' },
    { name: "Turkey Club Wrap", description: "Whole wheat wrap with turkey, avocado, bacon", calories: 550, protein: 35, carbs: 40, fat: 28, fiber: 6, sugar: 4, mealType: "LUNCH", tags: '["balanced","portable"]' },
    { name: "Salmon Teriyaki", description: "Pan-seared salmon with steamed rice and broccoli", calories: 580, protein: 38, carbs: 52, fat: 22, fiber: 4, sugar: 10, mealType: "DINNER", tags: '["omega-3","japanese"]' },
    { name: "Chicken Stir Fry", description: "Chicken breast with mixed vegetables in soy-ginger sauce", calories: 450, protein: 36, carbs: 38, fat: 16, fiber: 6, sugar: 8, mealType: "DINNER", tags: '["high-protein","quick"]' },
    { name: "Lentil Curry", description: "Red lentils in spiced tomato-coconut sauce", calories: 420, protein: 22, carbs: 56, fat: 12, fiber: 14, sugar: 6, mealType: "DINNER", tags: '["vegetarian","indian","high-fiber"]' },
    { name: "Protein Smoothie", description: "Banana, whey protein, spinach, almond butter", calories: 340, protein: 30, carbs: 36, fat: 10, fiber: 4, sugar: 16, mealType: "SNACK", tags: '["post-workout","quick"]' },
    { name: "Mixed Nuts & Dark Chocolate", description: "Almonds, walnuts, and 85% dark chocolate", calories: 280, protein: 8, carbs: 18, fat: 22, fiber: 4, sugar: 8, mealType: "SNACK", tags: '["healthy-fats","antioxidants"]' },
    { name: "Pre-Workout Energy Bites", description: "Oats, honey, peanut butter energy balls", calories: 220, protein: 8, carbs: 30, fat: 10, fiber: 3, sugar: 14, mealType: "PRE_WORKOUT", tags: '["energy","quick"]' },
    { name: "Recovery Shake", description: "Whey protein, banana, Greek yogurt, honey", calories: 380, protein: 35, carbs: 46, fat: 6, fiber: 2, sugar: 28, mealType: "POST_WORKOUT", tags: '["recovery","high-protein"]' },
  ];

  const aliceMeals = [];
  const bobMeals = [];

  for (const meal of mealData) {
    const aliceMeal = await prisma.meal.create({
      data: { userId: alice.id, ...meal },
    });
    aliceMeals.push(aliceMeal);

    // Give Bob a subset of meals
    if (["BREAKFAST", "LUNCH", "DINNER", "SNACK"].includes(meal.mealType)) {
      const bobMeal = await prisma.meal.create({
        data: { userId: bob.id, ...meal },
      });
      bobMeals.push(bobMeal);
    }
  }

  console.log(`  ✓ Meals: ${aliceMeals.length} for Alice, ${bobMeals.length} for Bob`);

  // ── Habits ─────────────────────────────────────────────────
  const habitData = [
    { name: "Drink Water", description: "Drink 8 glasses of water", category: "HYDRATION", frequency: "DAILY", targetCount: 8, unit: "glasses" },
    { name: "Sleep 8 Hours", description: "Get 8 hours of quality sleep", category: "SLEEP", frequency: "DAILY", targetCount: 1, unit: "night" },
    { name: "Morning Walk", description: "30-minute brisk walk", category: "EXERCISE", frequency: "DAILY", targetCount: 1, unit: "session" },
    { name: "Eat Vegetables", description: "Include vegetables in every meal", category: "NUTRITION", frequency: "DAILY", targetCount: 3, unit: "servings" },
    { name: "Meditate", description: "10-minute mindfulness meditation", category: "MINDFULNESS", frequency: "DAILY", targetCount: 1, unit: "session" },
    { name: "Strength Training", description: "Full body workout at the gym", category: "EXERCISE", frequency: "WEEKLY", targetCount: 3, unit: "sessions" },
  ];

  const aliceHabits = [];
  const bobHabits = [];

  for (const habit of habitData) {
    const aliceHabit = await prisma.habit.create({
      data: { userId: alice.id, ...habit },
    });
    aliceHabits.push(aliceHabit);

    if (["HYDRATION", "EXERCISE", "SLEEP"].includes(habit.category)) {
      const bobHabit = await prisma.habit.create({
        data: { userId: bob.id, ...habit },
      });
      bobHabits.push(bobHabit);
    }
  }

  console.log(`  ✓ Habits: ${aliceHabits.length} for Alice, ${bobHabits.length} for Bob`);

  // ── Meal logs (14 days of history) ─────────────────────────
  const moods = ["GREAT", "GOOD", "NEUTRAL", "GOOD", "GREAT"];
  let mealLogCount = 0;

  for (let daysAgo = 13; daysAgo >= 0; daysAgo--) {
    const logDate = new Date();
    logDate.setDate(logDate.getDate() - daysAgo);
    logDate.setHours(8, 0, 0, 0);

    // Alice logs 2-3 meals per day
    const dailyMeals = aliceMeals.slice(0, 2 + (daysAgo % 2));
    for (let i = 0; i < dailyMeals.length; i++) {
      const meal = dailyMeals[i];
      const mealTime = new Date(logDate);
      mealTime.setHours(8 + i * 5); // 8am, 1pm, 6pm

      await prisma.mealLog.create({
        data: {
          userId: alice.id,
          mealId: meal.id,
          quantity: 1.0,
          mood: moods[daysAgo % moods.length],
          energyLevel: 5 + (daysAgo % 5),
          loggedAt: mealTime,
        },
      });
      mealLogCount++;
    }

    // Bob logs 1-2 meals per day
    if (bobMeals.length > 0) {
      const bobDaily = bobMeals.slice(0, 1 + (daysAgo % 2));
      for (const meal of bobDaily) {
        await prisma.mealLog.create({
          data: {
            userId: bob.id,
            mealId: meal.id,
            quantity: 1.0,
            mood: moods[(daysAgo + 2) % moods.length],
            energyLevel: 4 + (daysAgo % 6),
            loggedAt: logDate,
          },
        });
        mealLogCount++;
      }
    }
  }

  console.log(`  ✓ Meal logs: ${mealLogCount}`);

  // ── Habit logs (14 days of history) ────────────────────────
  let habitLogCount = 0;

  for (let daysAgo = 13; daysAgo >= 0; daysAgo--) {
    const logDate = new Date();
    logDate.setDate(logDate.getDate() - daysAgo);
    logDate.setHours(20, 0, 0, 0);

    for (const habit of aliceHabits) {
      // Simulate realistic completion (skip some days)
      if (daysAgo % 3 !== 0 || habit.frequency === "WEEKLY") {
        const count = habit.frequency === "DAILY"
          ? Math.max(1, habit.targetCount - (daysAgo % 3))
          : habit.targetCount;

        await prisma.habitLog.create({
          data: {
            userId: alice.id,
            habitId: habit.id,
            count,
            loggedAt: logDate,
          },
        });
        habitLogCount++;
      }
    }

    // Bob logs less consistently
    for (const habit of bobHabits) {
      if (daysAgo % 2 === 0) {
        await prisma.habitLog.create({
          data: {
            userId: bob.id,
            habitId: habit.id,
            count: Math.max(1, habit.targetCount - 2),
            loggedAt: logDate,
          },
        });
        habitLogCount++;
      }
    }
  }

  console.log(`  ✓ Habit logs: ${habitLogCount}`);

  // ── Recommendations ────────────────────────────────────────
  const recommendations = [
    {
      userId: alice.id,
      type: "INSIGHT",
      title: "Great meal consistency!",
      description: "You've logged meals consistently for 14 days. Keep it up!",
      score: 0.92,
      data: JSON.stringify({ streakDays: 14 }),
    },
    {
      userId: alice.id,
      type: "MEAL",
      title: "Try more variety",
      description: "Consider adding more diverse protein sources to your meals.",
      score: 0.75,
      data: JSON.stringify({ currentVariety: 8, targetVariety: 14 }),
    },
    {
      userId: bob.id,
      type: "ALERT",
      title: "Calorie target tracking",
      description: "Your average daily intake is slightly above your 1800 kcal target.",
      score: 0.68,
      data: JSON.stringify({ avgCalories: 1950, target: 1800 }),
    },
    {
      userId: bob.id,
      type: "HABIT",
      title: "Improve hydration habit",
      description: "Your water intake habit completion is below 50%. Try setting reminders.",
      score: 0.6,
      data: JSON.stringify({ completionRate: 0.42 }),
    },
  ];

  for (const rec of recommendations) {
    await prisma.recommendation.create({ data: rec });
  }

  console.log(`  ✓ Recommendations: ${recommendations.length}`);

  // ── Summary ────────────────────────────────────────────────
  console.log("\n🌿 Seed complete!\n");
  console.log("  Demo accounts:");
  console.log("  ┌────────────────────────────┬──────────────┐");
  console.log("  │ Email                      │ Password     │");
  console.log("  ├────────────────────────────┼──────────────┤");
  console.log("  │ alice@nutrisense.demo      │ Password1    │");
  console.log("  │ bob@nutrisense.demo        │ Password1    │");
  console.log("  └────────────────────────────┴──────────────┘");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("Seed failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });

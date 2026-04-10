"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

const COLORS = ["#14b8a6", "#0ea5e9", "#f59e0b"];

export function NutritionChart({
  protein,
  carbs,
  fat,
}: {
  protein: number;
  carbs: number;
  fat: number;
}) {
  const data = [
    { name: "Protein", value: protein },
    { name: "Carbs", value: carbs },
    { name: "Fat", value: fat },
  ];

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-sm font-medium">Macro Split</p>
      <div className="mt-2 h-56">
        <ResponsiveContainer>
          <PieChart>
            <Pie data={data} dataKey="value" innerRadius={50} outerRadius={80} paddingAngle={4}>
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

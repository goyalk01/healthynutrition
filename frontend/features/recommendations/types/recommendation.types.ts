export type Recommendation = {
  id: string;
  title: string;
  description: string;
  type: "MEAL" | "HABIT" | "INSIGHT" | "ALERT";
  score: number;
};

"use client";

import QuestionGame from "@/components/skill-games/QuestionGame";

export default function GamePage() {
  return (
    <QuestionGame
      slug="logic-lock"
      name="Logic Lock"
      icon="🧩"
      description="Solve logic challenges under pressure and reach the winning score."
      minScore={17}
      total={20}
      seconds={45}
    />
  );
}

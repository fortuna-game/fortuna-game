"use client";

import QuestionGame from "@/components/skill-games/QuestionGame";

export default function QuickCountPage() {
  return (
    <QuestionGame
      slug="quick-count"
      name="Quick Count"
      icon="👁️"
      description="Count the objects quickly and reach the target score before time runs out."
      seconds={20}
    />
  );
}

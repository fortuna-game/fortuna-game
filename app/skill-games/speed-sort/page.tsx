"use client";

import QuestionGame from "@/components/skill-games/QuestionGame";

export default function SpeedSortPage() {
  return (
    <QuestionGame
      slug="speed-sort"
      name="Speed Sort"
      icon="⚡"
      description="Sort each item into the correct category before time runs out."
      seconds={20}
    />
  );
}

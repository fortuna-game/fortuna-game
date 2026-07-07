"use client";

import QuestionGame from "@/components/skill-games/QuestionGame";

export default function GamePage() {
  return (
    <QuestionGame
      slug="pattern-sequence"
      name="Pattern Sequence"
      icon="🔢"
      description="Identify patterns and complete each sequence before time runs out."
      seconds={45}
    />
  );
}

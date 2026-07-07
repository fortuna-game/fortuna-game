"use client";

import QuestionGame from "@/components/skill-games/QuestionGame";

export default function GamePage() {
  return (
    <QuestionGame
      slug="code-breaker"
      name="Code Breaker"
      icon="🔐"
      description="Study the clues, break the codes and reach the winning score."
      seconds={30}
    />
  );
}

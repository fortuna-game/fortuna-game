"use client";

import QuestionGame from "@/components/skill-games/QuestionGame";

export default function ArrowTargetPage() {
  return (
    <QuestionGame
      slug="target-challenge"
      name="Arrow Target"
      icon="🏹"
      description="Choose the correct moving target and reach the required score."
      seconds={20}
    />
  );
}

"use client";

import QuestionGame from "@/components/skill-games/QuestionGame";

export default function StackBalancePage() {
  return (
    <QuestionGame
      slug="stack-balance"
      name="Stack Balance"
      icon="📦"
      description="Answer timing and balance challenges before time runs out."
      seconds={20}
    />
  );
}

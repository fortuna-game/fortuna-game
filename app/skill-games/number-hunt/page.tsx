"use client";

import QuestionGame from "@/components/skill-games/QuestionGame";

export default function GamePage() {
  return (
    <QuestionGame
      slug="number-hunt"
      name="Number Hunt"
      icon="🔎"
      description="Find the correct numbers quickly and reach the winning target."
      seconds={30}
    />
  );
}

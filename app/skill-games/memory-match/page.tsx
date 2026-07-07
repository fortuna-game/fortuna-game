"use client";

import QuestionGame from "@/components/skill-games/QuestionGame";

export default function GamePage() {
  return (
    <QuestionGame
      slug="memory-match"
      name="Memory Match"
      icon="🧠"
      description="Test memory patterns and answer quickly before time runs out."
      seconds={25}
    />
  );
}

"use client";

import QuestionGame from "@/components/skill-games/QuestionGame";

export default function GamePage() {
  return (
    <QuestionGame
      slug="maze-escape"
      name="Maze Escape"
      icon="🧭"
      description="Use navigation logic and escape the maze before time runs out."
      seconds={25}
    />
  );
}

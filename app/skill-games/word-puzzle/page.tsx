"use client";

import QuestionGame from "@/components/skill-games/QuestionGame";

export default function GamePage() {
  return (
    <QuestionGame
      slug="word-puzzle"
      name="Word Puzzle"
      icon="🔤"
      description="Unscramble words quickly and reach the target score before time runs out."
      minScore={17}
      total={20}
      seconds={45}
    />
  );
}

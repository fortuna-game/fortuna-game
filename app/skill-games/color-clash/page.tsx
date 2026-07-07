"use client";

import QuestionGame from "@/components/skill-games/QuestionGame";

export default function GamePage() {
  return (
    <QuestionGame
      slug="color-clash"
      name="Color Clash"
      icon="🎨"
      description="Stay focused, identify the correct colors and beat the clock."
      seconds={45}
    />
  );
}

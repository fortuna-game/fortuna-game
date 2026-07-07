"use client";

import QuestionGame from "@/components/skill-games/QuestionGame";

export default function ReactionRushPage() {
  return (
    <QuestionGame
      slug="reaction-tap"
      name="Reaction Rush"
      icon="⚡"
      description="Test your speed, focus, and fast decision-making before time runs out."
      seconds={15}
    />
  );
}

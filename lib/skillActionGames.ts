export const ACTION_GAMES: Record<
  string,
  {
    name: string;
    minScore: number;
    maxScore: number;
  }
> = {
  "memory-match": { name: "Memory Match", minScore: 1, maxScore: 1 },
  "speed-sort": { name: "Speed Sort", minScore: 7, maxScore: 8 },
  "maze-escape": { name: "Maze Escape", minScore: 1, maxScore: 1 },
  "quick-count": { name: "Quick Count", minScore: 5, maxScore: 6 },
  "stack-balance": { name: "Stack Balance", minScore: 6, maxScore: 6 },
  "reaction-tap": { name: "Reaction Rush", minScore: 1, maxScore: 1 },
  "target-challenge": { name: "Arrow Target", minScore: 1, maxScore: 1 },
};

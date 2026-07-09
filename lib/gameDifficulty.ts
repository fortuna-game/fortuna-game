export const GAME_DIFFICULTY = {
  targetNaturalWinRate: 0.15,

  questionGames: {
    total: 20,
    minScore: 17,
    seconds: 60,
  },

  mathRush: {
    total: 20,
    minScore: 17,
    seconds: 60,
    minNumber: 12,
    maxNumber: 99,
  },

  trivia: {
    total: 20,
    minScore: 17,
    seconds: 60,
  },

  memoryMatch: {
    pairs: 10,
    maxMoves: 28,
    seconds: 75,
  },

  mazeEscape: {
    size: 6,
    maxMoves: 14,
  },

  reactionTap: {
    minValidReactionMs: 90,
    targetMs: 420,
  },

  targetChallenge: {
    zones: 7,
    targetZonesToWin: 1,
  },

  stackBalance: {
    targetBlocks: 10,
    tolerance: 12,
    timeLimit: 60,
    speed: 8,
  },
};

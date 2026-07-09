type Question = {
  id: string;
  question: string;
  options: string[];
  answer: string;
};

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

function makeOptions(answer: string, wrong: string[]) {
  return shuffle([answer, ...wrong.slice(0, 3)]);
}

const words = [
  "GHANA","MONEY","FOCUS","BRAIN","LOGIC","QUICK","VAULT","SKILL","POWER","SMART",
  "LEVEL","PRIZE","TARGET","MEMORY","NUMBER","PUZZLE","WINNER","PLAYER","ACTION","RESULT",
  "VISION","MASTER","HUSTLE","BRIGHT","STRONG","CHANCE","ENERGY","CREATE","SYSTEM","FORTUNA",
  "REWARD","BALANCE","ACTIVE","WINNING","GROWTH","MOBILE","SCREEN","SECURE","ANSWER","CHALLENGE",
  "INSIGHT","VICTORY","SUCCESS","COURAGE","CONTROL","PATTERN","REACTION","COUNTING","SEQUENCE","ACCURACY",
  "TIMING","COMPETE","PERFORM","SHARP","THINK","SOLVE","BATTLE","GIFT","PHONE","CASH",
  "BONUS","SPEED","SORT","COLOR","CLASH","CODE","LOCK","FIND","HUNT","FAST",
  "GAME","PLAY","POINT","TASK","RULE","ROUND","ENTRY","FEE","DOUBLE","PAYOUT",
  "MIND","FOCUSING","QUESTION","OPTION","CORRECT","WRONG","FAIR","TRUST","USER","WALLET",
  "DEPOSIT","WITHDRAW","MARKET","VALUE","SMARTER","RANDOM","FRESH","WINRATE","SESSION","FORTUNE"
];

function scramble(word: string) {
  return word.split("").sort(() => Math.random() - 0.5).join("");
}

const wordPuzzle: Question[] = words.map((word, i) => ({
  id: `w${i + 1}`,
  question: `Unscramble: ${scramble(word)}`,
  options: makeOptions(word, [scramble(word), scramble(word), scramble(word)]),
  answer: word,
}));

const patternSequence: Question[] = Array.from({ length: 100 }, (_, i) => {
  const start = 2 + (i % 9);
  const step = 2 + (i % 7);
  const answer = start + step * 5;
  const seq = [start, start + step, start + step * 2, start + step * 3, start + step * 4];
  return {
    id: `p${i + 1}`,
    question: `${seq.join(", ")}, ?`,
    options: makeOptions(String(answer), [String(answer + step), String(answer - step), String(answer + 2)]),
    answer: String(answer),
  };
});

const codeBreaker: Question[] = Array.from({ length: 100 }, (_, i) => {
  const code = String(100 + ((i * 37 + 247) % 899));
  const a = code[0], b = code[1], c = code[2];
  return {
    id: `c${i + 1}`,
    question: `Clues: ${code} is correct. ${b}${c}${a} has the same digits but wrong order. Choose the code.`,
    options: shuffle([code, `${b}${c}${a}`, `${c}${a}${b}`, `${a}${c}${b}`]),
    answer: code,
  };
});

const colors = ["RED", "BLUE", "GREEN", "YELLOW", "PURPLE", "ORANGE", "PINK", "BLACK"];
const colorClash: Question[] = Array.from({ length: 100 }, (_, i) => {
  const word = colors[i % colors.length];
  const display = colors[(i * 3 + 1) % colors.length];
  return {
    id: `cc${i + 1}`,
    question: `The word ${word} is displayed in ${display}. Choose the display color.`,
    options: shuffle([display, word, colors[(i + 2) % colors.length], colors[(i + 4) % colors.length]]),
    answer: display,
  };
});

const numberHunt: Question[] = Array.from({ length: 100 }, (_, i) => {
  const answer = String(10 + ((i * 17 + 27) % 89));
  const reversed = answer.split("").reverse().join("");
  return {
    id: `n${i + 1}`,
    question: `Find number ${answer}`,
    options: shuffle([answer, reversed, String(Number(answer) + 1), String(Number(answer) - 1)]),
    answer,
  };
});

const logicLock: Question[] = [
  ...Array.from({ length: 50 }, (_, i) => {
    const a = 2 + i;
    return {
      id: `l${i + 1}`,
      question: `${a}, ${a + 3}, ${a + 6}, ${a + 9}, ?`,
      options: makeOptions(String(a + 12), [String(a + 10), String(a + 11), String(a + 15)]),
      answer: String(a + 12),
    };
  }),
  ...Array.from({ length: 50 }, (_, i) => {
    const names = ["Ama", "Kojo", "Yaw", "Esi"];
    return {
      id: `l${i + 51}`,
      question: `${names[0]} is older than ${names[1]}. ${names[1]} is older than ${names[2]}. Who is youngest?`,
      options: names,
      answer: names[2],
    };
  }),
];

const categories = [
  ["🍎", "Fruit"], ["🍌", "Fruit"], ["🍇", "Fruit"], ["🍉", "Fruit"],
  ["🐶", "Animal"], ["🐘", "Animal"], ["🦁", "Animal"], ["🐱", "Animal"],
  ["🚗", "Vehicle"], ["✈️", "Vehicle"], ["🚲", "Vehicle"], ["🚕", "Vehicle"],
  ["🍕", "Food"], ["🍔", "Food"], ["🍟", "Food"], ["🥪", "Food"],
];

const speedSort: Question[] = Array.from({ length: 100 }, (_, i) => {
  const [item, answer] = categories[i % categories.length];
  return {
    id: `ss${i + 1}`,
    question: `${item} belongs to which group?`,
    options: shuffle([answer, "Animal", "Fruit", "Vehicle", "Food"].filter((v, idx, arr) => arr.indexOf(v) === idx).slice(0, 4)),
    answer,
  };
});

const symbols = ["⭐", "🔵", "🍎", "💎", "🔥", "⚽", "🟢", "🟡", "🔴", "🧩"];
const quickCount: Question[] = Array.from({ length: 100 }, (_, i) => {
  const count = 6 + (i % 15);
  const symbol = symbols[i % symbols.length];
  return {
    id: `qc${i + 1}`,
    question: `Count quickly: ${Array(count).fill(symbol).join(" ")}`,
    options: makeOptions(String(count), [String(count - 1), String(count + 1), String(count + 2)]),
    answer: String(count),
  };
});

export const QUESTION_GAMES = {
  "word-puzzle": { name: "Word Puzzle", minScore: 17, total: 20, questions: wordPuzzle },
  "pattern-sequence": { name: "Pattern Sequence", minScore: 17, total: 20, questions: patternSequence },
  "code-breaker": { name: "Code Breaker", minScore: 17, total: 20, questions: codeBreaker },
  "color-clash": { name: "Color Clash", minScore: 17, total: 20, questions: colorClash },
  "number-hunt": { name: "Number Hunt", minScore: 17, total: 20, questions: numberHunt },
  "logic-lock": { name: "Logic Lock", minScore: 17, total: 20, questions: logicLock },
  "speed-sort": { name: "Speed Sort", minScore: 17, total: 20, questions: speedSort },
  "quick-count": { name: "Quick Count", minScore: 17, total: 20, questions: quickCount },
};

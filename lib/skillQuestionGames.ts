export type QuestionGameItem = {
  id: string;
  question: string;
  options: string[];
  answer: string;
};

export const QUESTION_GAMES: Record<
  string,
  {
    name: string;
    minScore: number;
    total: number;
    questions: QuestionGameItem[];
  }
> = {
  "word-puzzle": {
    name: "Word Puzzle",
    minScore: 8,
    total: 10,
    questions: [
      { id: "w1", question: "Unscramble: HNAGA", options: ["GHANA", "HANG", "AGHAN", "NAGHA"], answer: "GHANA" },
      { id: "w2", question: "Unscramble: ONMEY", options: ["MONEY", "YEMON", "ENMOY", "NOMEY"], answer: "MONEY" },
      { id: "w3", question: "Unscramble: EAMG", options: ["MEGA", "GAME", "MAGE", "GEMA"], answer: "GAME" },
      { id: "w4", question: "Unscramble: LILKS", options: ["SKILL", "KILLS", "SILKL", "LIKLS"], answer: "SKILL" },
      { id: "w5", question: "Unscramble: NIW", options: ["WIN", "WON", "NOW", "OWN"], answer: "WIN" },
      { id: "w6", question: "Unscramble: AMLER", options: ["REALM", "LEARM", "ALMER", "LAMER"], answer: "REALM" },
      { id: "w7", question: "Unscramble: CUSFO", options: ["FOCUS", "COFUS", "SCOFU", "CUFOS"], answer: "FOCUS" },
      { id: "w8", question: "Unscramble: RBAIN", options: ["BRAIN", "BRIAN", "RABIN", "BAIRN"], answer: "BRAIN" },
      { id: "w9", question: "Unscramble: OLIGC", options: ["LOGIC", "GLOIC", "COLIG", "LOCIG"], answer: "LOGIC" },
      { id: "w10", question: "Unscramble: TSEFA", options: ["FEAST", "FAST", "FATES", "SAFET"], answer: "FEAST" },
      { id: "w11", question: "Unscramble: UQCIK", options: ["QUICK", "QUICKY", "KIQUC", "QCIUK"], answer: "QUICK" },
      { id: "w12", question: "Unscramble: VUATL", options: ["VAULT", "VALUET", "VUALT", "TULAV"], answer: "VAULT" },
    ],
  },

  "pattern-sequence": {
    name: "Pattern Sequence",
    minScore: 8,
    total: 10,
    questions: [
      { id: "p1", question: "2, 4, 6, 8, ?", options: ["9", "10", "11", "12"], answer: "10" },
      { id: "p2", question: "3, 6, 12, 24, ?", options: ["30", "36", "48", "50"], answer: "48" },
      { id: "p3", question: "1, 4, 9, 16, ?", options: ["20", "24", "25", "30"], answer: "25" },
      { id: "p4", question: "5, 10, 20, 40, ?", options: ["50", "60", "70", "80"], answer: "80" },
      { id: "p5", question: "🔴 🔵 🔴 🔵 🔴 ?", options: ["🔴", "🔵", "🟢", "🟡"], answer: "🔵" },
      { id: "p6", question: "▲ ● ▲ ● ▲ ?", options: ["▲", "●", "■", "◆"], answer: "●" },
      { id: "p7", question: "10, 20, 30, 40, ?", options: ["45", "50", "55", "60"], answer: "50" },
      { id: "p8", question: "100, 90, 80, 70, ?", options: ["50", "55", "60", "65"], answer: "60" },
      { id: "p9", question: "2, 3, 5, 8, 13, ?", options: ["18", "20", "21", "24"], answer: "21" },
      { id: "p10", question: "4, 8, 16, 32, ?", options: ["48", "56", "64", "72"], answer: "64" },
      { id: "p11", question: "A, C, E, G, ?", options: ["H", "I", "J", "K"], answer: "I" },
      { id: "p12", question: "1, 2, 4, 7, 11, ?", options: ["14", "15", "16", "17"], answer: "16" },
    ],
  },

  "code-breaker": {
    name: "Code Breaker",
    minScore: 4,
    total: 5,
    questions: [
      { id: "c1", question: "Clues: 427 is correct. 472 has same numbers but wrong order. Choose the code.", options: ["427", "472", "247", "724"], answer: "427" },
      { id: "c2", question: "Clues: 618 is correct. 681 has two misplaced. Choose the code.", options: ["618", "681", "168", "816"], answer: "618" },
      { id: "c3", question: "Clues: 395 is correct. 359 has two misplaced. Choose the code.", options: ["395", "359", "935", "593"], answer: "395" },
      { id: "c4", question: "Clues: 741 is correct. 714 has two misplaced. Choose the code.", options: ["741", "714", "471", "147"], answer: "741" },
      { id: "c5", question: "Clues: 836 is correct. 863 has two misplaced. Choose the code.", options: ["836", "863", "638", "386"], answer: "836" },
      { id: "c6", question: "Clues: 529 is correct. 592 has two misplaced. Choose the code.", options: ["529", "592", "295", "925"], answer: "529" },
    ],
  },

  "color-clash": {
    name: "Color Clash",
    minScore: 8,
    total: 10,
    questions: [
      { id: "cc1", question: "The word RED is displayed in BLUE. Choose the display color.", options: ["RED", "BLUE", "GREEN", "YELLOW"], answer: "BLUE" },
      { id: "cc2", question: "The word GREEN is displayed in RED. Choose the display color.", options: ["RED", "BLUE", "GREEN", "YELLOW"], answer: "RED" },
      { id: "cc3", question: "The word BLUE is displayed in YELLOW. Choose the display color.", options: ["RED", "BLUE", "GREEN", "YELLOW"], answer: "YELLOW" },
      { id: "cc4", question: "The word YELLOW is displayed in GREEN. Choose the display color.", options: ["RED", "BLUE", "GREEN", "YELLOW"], answer: "GREEN" },
      { id: "cc5", question: "The word PURPLE is displayed in RED. Choose the display color.", options: ["RED", "PURPLE", "GREEN", "YELLOW"], answer: "RED" },
      { id: "cc6", question: "The word RED is displayed in YELLOW. Choose the display color.", options: ["RED", "BLUE", "GREEN", "YELLOW"], answer: "YELLOW" },
      { id: "cc7", question: "The word GREEN is displayed in BLUE. Choose the display color.", options: ["RED", "BLUE", "GREEN", "YELLOW"], answer: "BLUE" },
      { id: "cc8", question: "The word BLUE is displayed in GREEN. Choose the display color.", options: ["RED", "BLUE", "GREEN", "YELLOW"], answer: "GREEN" },
      { id: "cc9", question: "The word YELLOW is displayed in RED. Choose the display color.", options: ["RED", "BLUE", "GREEN", "YELLOW"], answer: "RED" },
      { id: "cc10", question: "The word RED is displayed in GREEN. Choose the display color.", options: ["RED", "BLUE", "GREEN", "YELLOW"], answer: "GREEN" },
      { id: "cc11", question: "The word GREEN is displayed in YELLOW. Choose the display color.", options: ["RED", "BLUE", "GREEN", "YELLOW"], answer: "YELLOW" },
      { id: "cc12", question: "The word BLUE is displayed in RED. Choose the display color.", options: ["RED", "BLUE", "GREEN", "YELLOW"], answer: "RED" },
    ],
  },

  "number-hunt": {
    name: "Number Hunt",
    minScore: 8,
    total: 10,
    questions: [
      { id: "n1", question: "Find number 37", options: ["17", "73", "37", "47"], answer: "37" },
      { id: "n2", question: "Find number 64", options: ["46", "66", "64", "84"], answer: "64" },
      { id: "n3", question: "Find number 82", options: ["28", "82", "72", "92"], answer: "82" },
      { id: "n4", question: "Find number 19", options: ["91", "18", "19", "29"], answer: "19" },
      { id: "n5", question: "Find number 55", options: ["50", "55", "65", "45"], answer: "55" },
      { id: "n6", question: "Find number 71", options: ["17", "71", "77", "81"], answer: "71" },
      { id: "n7", question: "Find number 43", options: ["34", "42", "43", "53"], answer: "43" },
      { id: "n8", question: "Find number 96", options: ["69", "86", "96", "99"], answer: "96" },
      { id: "n9", question: "Find number 24", options: ["42", "34", "24", "20"], answer: "24" },
      { id: "n10", question: "Find number 88", options: ["80", "83", "88", "98"], answer: "88" },
      { id: "n11", question: "Find number 12", options: ["21", "12", "22", "10"], answer: "12" },
      { id: "n12", question: "Find number 59", options: ["95", "49", "59", "69"], answer: "59" },
    ],
  },

  "logic-lock": {
    name: "Logic Lock",
    minScore: 8,
    total: 10,
    questions: [
      { id: "l1", question: "All Zips are Lops. All Lops are Meks. Is every Zip a Mek?", options: ["Yes", "No", "Cannot Know", "Sometimes"], answer: "Yes" },
      { id: "l2", question: "Ama is older than Kojo. Kojo is older than Yaw. Who is youngest?", options: ["Ama", "Kojo", "Yaw", "Cannot Know"], answer: "Yaw" },
      { id: "l3", question: "A farmer has 17 sheep. All but 9 run away. How many remain?", options: ["8", "9", "17", "26"], answer: "9" },
      { id: "l4", question: "2, 6, 12, 20, 30, ?", options: ["36", "40", "42", "44"], answer: "42" },
      { id: "l5", question: "Kofi faces north. He turns right, then right again. Which direction?", options: ["North", "South", "East", "West"], answer: "South" },
      { id: "l6", question: "If 2 cats catch 2 mice in 2 minutes, how many cats catch 6 mice in 2 minutes?", options: ["2", "3", "6", "12"], answer: "6" },
      { id: "l7", question: "Which is the odd one out: Apple, Banana, Mango, Car", options: ["Apple", "Banana", "Mango", "Car"], answer: "Car" },
      { id: "l8", question: "If today is Monday, what day is 3 days after tomorrow?", options: ["Tuesday", "Wednesday", "Thursday", "Friday"], answer: "Friday" },
      { id: "l9", question: "Which number is missing: 4, 8, 12, ?, 20", options: ["14", "15", "16", "18"], answer: "16" },
      { id: "l10", question: "A is taller than B. B is taller than C. Who is shortest?", options: ["A", "B", "C", "Cannot Know"], answer: "C" },
      { id: "l11", question: "If all birds can fly is false, what does that mean?", options: ["No birds fly", "Some birds may not fly", "All birds swim", "Birds are fish"], answer: "Some birds may not fly" },
      { id: "l12", question: "Complete: 1, 1, 2, 3, 5, ?", options: ["6", "7", "8", "9"], answer: "8" },
    ],
  },
};

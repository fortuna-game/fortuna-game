import fs from "fs";

const text = fs.readFileSync("lib/skillQuestionGames.tsx", "utf8");

const checks = [
  ["word-puzzle", /const words = \[/, /const wordPuzzle/],
  ["pattern-sequence", /const patternSequence/, /length:\s*100/],
  ["code-breaker", /const codeBreaker/, /length:\s*100/],
  ["color-clash", /const colorClash/, /length:\s*100/],
  ["number-hunt", /const numberHunt/, /length:\s*100/],
  ["logic-lock", /const logicLock/, /length:\s*50/],
  ["speed-sort", /const speedSort/, /length:\s*100/],
  ["quick-count", /const quickCount/, /length:\s*100/],
];

console.log("🔍 Fortuna 800 Challenge Bank Audit\n");

let passed = true;

for (const [name, bankCheck, sizeCheck] of checks) {
  const bankExists = bankCheck.test(text);
  const sizeExists = sizeCheck.test(text);

  if (bankExists && sizeExists) {
    console.log(`✅ ${name}`);
  } else {
    console.log(`❌ ${name}`);
    passed = false;
  }
}

console.log("\n🎯 Session Rules");

const has17 = text.includes("minScore: 17");
const has20 = text.includes("total: 20");

console.log(has17 ? "✅ Winning score: 17/20" : "❌ Winning score incorrect");
console.log(has20 ? "✅ 20 challenges per session" : "❌ Session total incorrect");

if (!has17 || !has20) passed = false;

console.log("\n📊 FINAL RESULT");

if (passed) {
  console.log("✅ Question bank structure passed.");
} else {
  console.log("❌ Question bank needs corrections.");
  process.exit(1);
}

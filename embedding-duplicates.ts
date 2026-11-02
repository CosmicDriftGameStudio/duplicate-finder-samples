import { findEmbeddingPairs } from "./lib/embedding.ts";
import { collectFunctions } from "./lib/functions.ts";

// bun embedding-duplicates.ts <dir> [--threshold 0.9]
const args = process.argv.slice(2);
const dir = args[0] ?? "samples";
const thresholdIndex = args.indexOf("--threshold");
const threshold = thresholdIndex >= 0 ? Number(args[thresholdIndex + 1]) : 0.9;

const pairs = await findEmbeddingPairs(collectFunctions(dir), threshold);
for (const p of pairs) console.log(`${p.score.toFixed(4)}  ${p.a.id} + ${p.b.id}`);
console.log(`${pairs.length} pair(s) at or above ${threshold}`);

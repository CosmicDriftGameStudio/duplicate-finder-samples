import { findAstGroups } from "./lib/ast.ts";
import { findEmbeddingPairs } from "./lib/embedding.ts";
import { collectFunctions, type FunctionInfo } from "./lib/functions.ts";

// bun combine.ts <dir> [--fuzzy 0.8] [--threshold 0.8]
const args = process.argv.slice(2);
const dir = args[0] ?? "samples";
const option = (name: string, fallback: number) => {
	const index = args.indexOf(name);
	return index >= 0 ? Number(args[index + 1]) : fallback;
};

type Verdict = "both" | "ast-only" | "embedding-only";
const NEXT_STEP: Record<Verdict, string> = {
	both: "extract one helper",
	"ast-only": "same shape: check that both mean the same thing",
	"embedding-only": "same intent: run both on the same inputs before merging",
};

interface Row {
	ids: [string, string];
	ast?: number;
	embedding?: number;
}

const pairKey = (a: FunctionInfo, b: FunctionInfo) => [a.id, b.id].sort().join(" + ");
const rows = new Map<string, Row>();
const rowFor = (a: FunctionInfo, b: FunctionInfo): Row => {
	const key = pairKey(a, b);
	const existing = rows.get(key);
	if (existing) return existing;
	const ids = [a.id, b.id].sort() as [string, string];
	const row: Row = { ids };
	rows.set(key, row);
	return row;
};

const functions = collectFunctions(dir);
for (const group of findAstGroups(functions, { fuzzyThreshold: option("--fuzzy", 0.8) })) {
	for (let i = 0; i < group.members.length; i++) {
		for (let j = i + 1; j < group.members.length; j++) {
			const a = group.members[i];
			const b = group.members[j];
			if (a && b) rowFor(a, b).ast = group.score;
		}
	}
}
for (const pair of await findEmbeddingPairs(functions, option("--threshold", 0.8))) {
	rowFor(pair.a, pair.b).embedding = pair.score;
}

const verdictOf = (row: Row): Verdict =>
	row.ast !== undefined && row.embedding !== undefined
		? "both"
		: row.ast !== undefined
			? "ast-only"
			: "embedding-only";

const order: Verdict[] = ["both", "ast-only", "embedding-only"];
const sorted = [...rows.values()].sort(
	(x, y) => order.indexOf(verdictOf(x)) - order.indexOf(verdictOf(y)),
);
for (const row of sorted) {
	const verdict = verdictOf(row);
	const ast = row.ast?.toFixed(2) ?? "  - ";
	const embedding = row.embedding?.toFixed(2) ?? "  - ";
	console.log(`${verdict.padEnd(14)} ast ${ast}  emb ${embedding}  ${row.ids.join(" + ")}`);
	console.log(`${"".padEnd(14)} -> ${NEXT_STEP[verdict]}`);
}

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { type AstGroup, findAstGroups } from "./lib/ast.ts";
import { collectFunctions } from "./lib/functions.ts";

// bun ast-duplicates.ts <dir> [--fuzzy 0.8] [--baseline file] [--write-baseline]
const args = process.argv.slice(2);
const dir = args[0] ?? "samples";
const fuzzyIndex = args.indexOf("--fuzzy");
const fuzzyThreshold = fuzzyIndex >= 0 ? Number(args[fuzzyIndex + 1]) : undefined;
const baselineIndex = args.indexOf("--baseline");
const baselineFile = baselineIndex >= 0 ? args[baselineIndex + 1] : undefined;

const groups = findAstGroups(collectFunctions(dir), { fuzzyThreshold });
const keyOf = (g: AstGroup) => g.members.map((m) => m.id).sort().join(" + ");

for (const g of groups) {
	console.log(`${g.kind.padEnd(7)} ${g.score.toFixed(2)}  ${keyOf(g)}`);
}
console.log(`${groups.length} group(s)`);

if (baselineFile && args.includes("--write-baseline")) {
	writeFileSync(baselineFile, `${JSON.stringify(groups.map(keyOf).sort(), null, 2)}\n`);
	console.log(`baseline written: ${baselineFile}`);
} else if (baselineFile) {
	// Known groups pass; only a group that is not in the baseline fails the run.
	const known = new Set<string>(
		existsSync(baselineFile) ? JSON.parse(readFileSync(baselineFile, "utf8")) : [],
	);
	const fresh = groups.filter((g) => !known.has(keyOf(g)));
	for (const g of fresh) console.log(`NEW     ${keyOf(g)}`);
	if (fresh.length > 0) process.exit(1);
}

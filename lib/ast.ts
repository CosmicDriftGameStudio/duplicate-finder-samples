import type { FunctionInfo } from "./functions.ts";

export interface AstGroup {
	kind: "exact" | "similar";
	score: number;
	members: FunctionInfo[];
}

const KEYWORDS = new Set(
	(
		"as async await break case catch class const continue default delete do " +
		"else export extends finally for from function if import in instanceof " +
		"let new of return switch this throw try typeof var void while yield"
	).split(" "),
);

// Every identifier becomes `_` and every literal becomes `#`, so two functions
// share a fingerprint when only names, strings and numbers differ.
export function normalizeBody(text: string): string {
	let s = text.replace(/\s+/g, " ").trim();
	s = s.replace(/"[^"]*"/g, "#");
	s = s.replace(/'[^']*'/g, "#");
	s = s.replace(/`[^`]*`/g, "#");
	s = s.replace(/\b\d+(\.\d+)?n?\b/g, "#");
	s = s.replace(/\b(true|false|null|undefined)\b/g, "#");
	s = s.replace(/\b[a-zA-Z_$][\w$]*\b/g, (m) => (KEYWORDS.has(m) ? m : "_"));
	s = s.replace(/\s*([{}();,:+\-*/%&|^!~<>=?.[\]])\s*/g, "$1");
	return s;
}

function identifiers(text: string): Set<string> {
	const found = text.match(/\b[a-zA-Z_$][\w$]*\b/g) ?? [];
	return new Set(found.filter((word) => !KEYWORDS.has(word)));
}

function jaccard(a: Set<string>, b: Set<string>): number {
	let shared = 0;
	for (const x of a) if (b.has(x)) shared++;
	const union = a.size + b.size - shared;
	return union === 0 ? 1 : shared / union;
}

function editDistance(a: string, b: string): number {
	let previous = Array.from({ length: b.length + 1 }, (_, j) => j);
	for (let i = 1; i <= a.length; i++) {
		const current = [i];
		for (let j = 1; j <= b.length; j++) {
			const cost = a[i - 1] === b[j - 1] ? 0 : 1;
			current[j] = Math.min(
				(previous[j] ?? 0) + 1,
				(current[j - 1] ?? 0) + 1,
				(previous[j - 1] ?? 0) + cost,
			);
		}
		previous = current;
	}
	return previous[b.length] ?? 0;
}

function shapeSimilarity(a: string, b: string): number {
	const longer = a.length >= b.length ? a : b;
	const shorter = a.length >= b.length ? b : a;
	if (longer.length === 0) return 1;
	return (longer.length - editDistance(longer, shorter)) / longer.length;
}

export function similarity(a: FunctionInfo, b: FunctionInfo): number {
	const names = jaccard(identifiers(a.bodyText), identifiers(b.bodyText));
	const shape = shapeSimilarity(normalizeBody(a.bodyText), normalizeBody(b.bodyText));
	return names * 0.3 + shape * 0.7;
}

export function findAstGroups(
	functions: FunctionInfo[],
	options: { fuzzyThreshold?: number } = {},
): AstGroup[] {
	const groups: AstGroup[] = [];
	const byFingerprint = new Map<string, FunctionInfo[]>();
	for (const fn of functions) {
		const key = `${normalizeBody(fn.bodyText)}|params:${fn.paramCount}`;
		byFingerprint.set(key, [...(byFingerprint.get(key) ?? []), fn]);
	}
	const grouped = new Set<FunctionInfo>();
	for (const members of byFingerprint.values()) {
		if (members.length < 2) continue;
		for (const fn of members) grouped.add(fn);
		groups.push({ kind: "exact", score: 1, members });
	}

	const threshold = options.fuzzyThreshold;
	if (threshold === undefined) return groups;
	const rest = functions.filter((fn) => !grouped.has(fn));
	for (let i = 0; i < rest.length; i++) {
		for (let j = i + 1; j < rest.length; j++) {
			const a = rest[i];
			const b = rest[j];
			if (!a || !b) continue;
			const score = similarity(a, b);
			if (score >= threshold) groups.push({ kind: "similar", score, members: [a, b] });
		}
	}
	return groups;
}

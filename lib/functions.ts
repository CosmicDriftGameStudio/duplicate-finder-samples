import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import ts from "typescript";

export interface FunctionInfo {
	id: string;
	file: string;
	line: number;
	name: string;
	paramCount: number;
	bodyText: string;
}

// Short bodies (getters, one-line wrappers) match each other all the time and
// are never worth extracting.
const MIN_BODY_CHARS = 120;

export function listSourceFiles(dir: string): string[] {
	const out: string[] = [];
	for (const entry of readdirSync(dir)) {
		const full = path.join(dir, entry);
		if (statSync(full).isDirectory()) out.push(...listSourceFiles(full));
		else if (/\.tsx?$/.test(entry) && !entry.endsWith(".d.ts")) out.push(full);
	}
	return out.sort();
}

function nameOf(node: ts.FunctionLikeDeclaration): string {
	if (node.name && ts.isIdentifier(node.name)) return node.name.text;
	const parent = node.parent;
	if (ts.isVariableDeclaration(parent) && ts.isIdentifier(parent.name)) {
		return parent.name.text;
	}
	if (ts.isPropertyAssignment(parent) && ts.isIdentifier(parent.name)) {
		return parent.name.text;
	}
	return "<anonymous>";
}

export function collectFunctions(rootDir: string): FunctionInfo[] {
	const out: FunctionInfo[] = [];
	for (const file of listSourceFiles(rootDir)) {
		const text = readFileSync(file, "utf8");
		const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
		const relative = path.relative(rootDir, file);
		const visit = (node: ts.Node) => {
			if (
				(ts.isFunctionDeclaration(node) ||
					ts.isMethodDeclaration(node) ||
					ts.isArrowFunction(node) ||
					ts.isFunctionExpression(node)) &&
				node.body
			) {
				const bodyText = node.body.getText(sf);
				if (bodyText.length >= MIN_BODY_CHARS) {
					const name = nameOf(node);
					const line =
						sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1;
					out.push({
						id: `${relative}:${name}`,
						file: relative,
						line,
						name,
						paramCount: node.parameters.length,
						bodyText,
					});
				}
			}
			ts.forEachChild(node, visit);
		};
		visit(sf);
	}
	return out;
}

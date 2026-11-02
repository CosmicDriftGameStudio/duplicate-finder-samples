import type { FunctionInfo } from "./functions.ts";

export interface EmbeddingPair {
	a: FunctionInfo;
	b: FunctionInfo;
	score: number;
}

const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://localhost:11434/api/embed";
const MODEL = process.env.EMBED_MODEL ?? "nomic-embed-text";

function textForEmbedding(body: string): string {
	return body
		.replace(/\/\/.*$/gm, "")
		.replace(/\/\*[\s\S]*?\*\//g, "")
		.replace(/\s+/g, " ")
		.trim()
		.slice(0, 2000);
}

async function embed(text: string): Promise<number[]> {
	const res = await fetch(OLLAMA_URL, {
		method: "POST",
		headers: { "content-type": "application/json" },
		// nomic-embed-text expects a task prefix; without it scores drift.
		body: JSON.stringify({ model: MODEL, input: `search_document: ${text}` }),
	});
	if (!res.ok) throw new Error(`Ollama ${res.status}: ${await res.text()}`);
	const data: unknown = await res.json();
	const vector =
		typeof data === "object" &&
		data !== null &&
		"embeddings" in data &&
		Array.isArray(data.embeddings)
			? data.embeddings[0]
			: undefined;
	if (!Array.isArray(vector)) throw new Error("Ollama answered without an embedding");
	return vector.map(Number);
}

function cosine(a: number[], b: number[]): number {
	let dot = 0;
	let normA = 0;
	let normB = 0;
	for (let i = 0; i < a.length; i++) {
		const x = a[i] ?? 0;
		const y = b[i] ?? 0;
		dot += x * y;
		normA += x * x;
		normB += y * y;
	}
	return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function findEmbeddingPairs(
	functions: FunctionInfo[],
	threshold: number,
): Promise<EmbeddingPair[]> {
	const vectors: number[][] = [];
	for (const fn of functions) vectors.push(await embed(textForEmbedding(fn.bodyText)));
	const pairs: EmbeddingPair[] = [];
	for (let i = 0; i < functions.length; i++) {
		for (let j = i + 1; j < functions.length; j++) {
			const a = functions[i];
			const b = functions[j];
			const va = vectors[i];
			const vb = vectors[j];
			if (!a || !b || !va || !vb) continue;
			const score = cosine(va, vb);
			if (score >= threshold) pairs.push({ a, b, score });
		}
	}
	return pairs.sort((x, y) => y.score - x.score);
}

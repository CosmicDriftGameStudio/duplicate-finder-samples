export function correlation(a: number[], b: number[]): number {
	const n = a.length;
	const meanA = a.reduce((sum, v) => sum + v, 0) / n;
	const meanB = b.reduce((sum, v) => sum + v, 0) / n;
	let cov = 0;
	let varA = 0;
	let varB = 0;
	for (let i = 0; i < n; i++) {
		const da = (a[i] ?? 0) - meanA;
		const db = (b[i] ?? 0) - meanB;
		cov += da * db;
		varA += da * da;
		varB += db * db;
	}
	return cov / Math.sqrt(varA * varB);
}

export function pearsonCorrelation(xs: number[], ys: number[]): number {
	const n = xs.length;
	const meanX = xs.reduce((a, b) => a + b, 0) / n;
	const meanY = ys.reduce((a, b) => a + b, 0) / n;
	let cov = 0;
	let varX = 0;
	let varY = 0;
	for (let i = 0; i < n; i++) {
		const dx = (xs[i] ?? 0) - meanX;
		const dy = (ys[i] ?? 0) - meanY;
		cov += dx * dy;
		varX += dx * dx;
		varY += dy * dy;
	}
	if (varX === 0 || varY === 0) return 0;
	return cov / Math.sqrt(varX * varY);
}

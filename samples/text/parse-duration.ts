const UNIT_MS: Record<string, number> = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };

export function parseDuration(text: string): number {
	const match = /^(\d+)\s*([smhd])$/.exec(text.trim());
	if (!match) throw new Error(`not a duration: ${text}`);
	const [, amount, unit] = match;
	const factor = UNIT_MS[unit ?? ""];
	if (factor === undefined) throw new Error(`unknown unit in ${text}`);
	return Number(amount) * factor;
}

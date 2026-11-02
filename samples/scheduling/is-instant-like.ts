export interface InstantLike {
	epochMilliseconds: number;
	timeZone: string;
}

export function isInstantLike(value: unknown): value is InstantLike {
	return (
		typeof value === "object" &&
		value !== null &&
		"epochMilliseconds" in value &&
		typeof value.epochMilliseconds === "number" &&
		"timeZone" in value &&
		typeof value.timeZone === "string"
	);
}

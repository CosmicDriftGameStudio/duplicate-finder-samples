import postgres from "postgres";

export function createDbConnection(env: Record<string, string | undefined>) {
	const url = env.DATABASE_URL;
	if (!url) throw new Error("DATABASE_URL is not set");
	const max = Number(env.DATABASE_POOL_SIZE ?? "10");
	const db = postgres(url, { max, idle_timeout: 20, prepare: false });
	const listener = postgres(url, { max: 1 });
	return { db, listener };
}

interface Account {
	id: string;
	enabled: boolean;
}

export declare const db: {
	accounts: {
		find(id: string): Promise<Account | undefined>;
		update(id: string, patch: Partial<Account>): Promise<Account>;
	};
	audit: {
		insert(entry: { accountId: string; actorId: string; action: string }): Promise<void>;
	};
};

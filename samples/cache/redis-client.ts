import { createClient } from "redis";

export function createCacheClient(env: Record<string, string | undefined>) {
	const url = env.REDIS_URL;
	if (!url) throw new Error("REDIS_URL is not set");
	const database = Number(env.REDIS_DATABASE ?? "0");
	const client = createClient({ url, database, socket: { keepAlive: true } });
	client.on("error", (error) => console.error("redis", error));
	return client;
}

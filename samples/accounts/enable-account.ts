import { db } from "../db/client.ts";

export async function enableAccount(accountId: string, actorId: string) {
	const account = await db.accounts.find(accountId);
	if (!account) throw new Error(`account ${accountId} not found`);
	if (account.enabled === true) return account;
	const updated = await db.accounts.update(accountId, { enabled: true });
	await db.audit.insert({ accountId, actorId, action: "account.enabled" });
	return updated;
}

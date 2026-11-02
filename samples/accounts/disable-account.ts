import { db } from "../db/client.ts";

export async function disableAccount(accountId: string, actorId: string) {
	const account = await db.accounts.find(accountId);
	if (!account) throw new Error(`account ${accountId} not found`);
	if (account.enabled === false) return account;
	const updated = await db.accounts.update(accountId, { enabled: false });
	await db.audit.insert({ accountId, actorId, action: "account.disabled" });
	return updated;
}

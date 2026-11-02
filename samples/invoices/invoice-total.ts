export interface InvoiceItem {
	price: number;
	count: number;
	rebate?: number;
}

export const invoiceTotal = (items: InvoiceItem[]): number => {
	const sum = items.reduce(
		(acc, item) => acc + item.price * item.count * (1 - (item.rebate ?? 0) / 100),
		0,
	);
	return Math.round(sum * 100) / 100;
};

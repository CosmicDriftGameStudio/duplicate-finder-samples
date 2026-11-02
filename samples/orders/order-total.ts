export interface OrderLine {
	unitPrice: number;
	quantity: number;
	discountPercent?: number;
}

export function orderTotal(lines: OrderLine[]): number {
	let total = 0;
	for (const line of lines) {
		const gross = line.unitPrice * line.quantity;
		const discount = line.discountPercent ? (gross * line.discountPercent) / 100 : 0;
		total += gross - discount;
	}
	return Math.round(total * 100) / 100;
}

import { correlation } from "./samples/reports/correlation.ts";
import { pearsonCorrelation } from "./samples/stats/correlation.ts";
import { invoiceTotal } from "./samples/invoices/invoice-total.ts";
import { orderTotal } from "./samples/orders/order-total.ts";

// Same inputs into both members of an embedding-only pair, before anyone merges them.
const series: Array<[number[], number[]]> = [
	[[1, 2, 3, 4], [2, 4, 6, 8]],
	[[1, 2, 3, 4], [4, 3, 2, 1]],
	[[5, 5, 5, 5], [1, 2, 3, 4]],
];
for (const [xs, ys] of series) {
	console.log(
		`correlation ${JSON.stringify(xs)} ${JSON.stringify(ys)}: ` +
			`stats ${pearsonCorrelation(xs, ys)}, reports ${correlation(xs, ys)}`,
	);
}

const carts = [
	[{ price: 19.99, count: 3 }],
	[{ price: 19.99, count: 3, rebate: 15 }, { price: 4.5, count: 3 }],
	[],
];
for (const cart of carts) {
	const lines = cart.map((i) => ({
		unitPrice: i.price,
		quantity: i.count,
		discountPercent: "rebate" in i ? i.rebate : undefined,
	}));
	console.log(`total ${JSON.stringify(cart)}: orders ${orderTotal(lines)}, invoices ${invoiceTotal(cart)}`);
}

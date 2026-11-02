export interface FieldRow {
	fieldName: string;
	fieldType: string;
}

export function isFieldRow(row: unknown): row is FieldRow {
	return (
		typeof row === "object" &&
		row !== null &&
		"fieldName" in row &&
		typeof row.fieldName === "string" &&
		"fieldType" in row &&
		typeof row.fieldType === "string"
	);
}

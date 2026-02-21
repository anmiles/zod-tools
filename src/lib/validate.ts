import type { Schema } from '../types';

export function validate<T>(data: unknown, schema: Schema<T>): T {
	const parsed = schema.safeParse(data);

	if (!parsed.success) {
		const errorLines = [
			'Validation failed:',
			...parsed.error.issues.map((i) => `${i.path.join('.')} (${i.message})`),
		];

		throw new Error(errorLines.join('\n\t'));
	}

	return parsed.data;
}

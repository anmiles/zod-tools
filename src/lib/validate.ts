import type { z } from 'zod';

export function validate<T>(data: unknown, schema: z.ZodType<T, any, any>): T {
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

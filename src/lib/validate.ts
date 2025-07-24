import type { z } from 'zod';
import type { $ZodTypeInternals } from 'zod/v4/core';

export function validate<T>(data: unknown, schema: z.ZodType<T, any, $ZodTypeInternals<T, unknown>>): T {
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

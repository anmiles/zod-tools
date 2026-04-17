import type { z } from 'zod';

import type { Schema } from '../types';

function extractNestedIssues(issue: z.ZodIssue, parentPath: string[] = []): z.ZodIssue[] {
	const path         = [ ...parentPath, ...issue.path.map(String) ];
	const defaultValue = [ { ...issue, path } ];

	switch (issue.code) {
		case 'invalid_type':
			return defaultValue;
		case 'invalid_union':
			return issue.errors.flat().map((error) => extractNestedIssues(error, path)).flat();
		case 'invalid_format':
			return defaultValue;
		case 'invalid_value':
			return defaultValue;
		case 'invalid_key':
			return defaultValue;
		case 'invalid_element':
			return defaultValue;
		case 'not_multiple_of':
			return defaultValue;
		case 'too_big':
			return defaultValue;
		case 'too_small':
			return defaultValue;
		case 'unrecognized_keys':
			return defaultValue;
		case 'custom':
			return defaultValue;
	}
}

function sortIssues({ path: path1 }: z.ZodIssue, { path: path2 }: z.ZodIssue): number {
	for (let i = 0; i < Math.max(path1.length, path2.length); i++) {
		if (!path1[i]) { return -1; }

		const diff = String(path1[i]).localeCompare(String(path2[i]));

		if (diff !== 0) {
			return diff;
		}
	}

	return 0;
}

function formatIssue(issue: z.ZodIssue): string {
	const fullPath = issue.path.length === 0
		? '[root]'
		: issue.path.join('.');

	return `\t${fullPath} (${issue.message})`;
}

function formatError(error: z.ZodError): string[] {
	return [
		'Validation failed:',
		...error.issues
			.map((issue) => extractNestedIssues(issue))
			.flat()
			.sort(sortIssues)
			.map(formatIssue),
	];
}

export function validate<T>(data: unknown, schema: Schema<T>): T {
	const parsed = schema.safeParse(data);

	if (!parsed.success) {
		const errorLines = formatError(parsed.error);

		throw new Error(errorLines.join('\n'));
	}

	return parsed.data;
}

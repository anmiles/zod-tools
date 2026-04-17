import z from 'zod';

import { validate } from '../validate';

describe('src/lib/validate', () => {
	describe('validate', () => {
		it('should return data if validation passed', () => {
			const schema = z.object({
				key: z.string(),
			});

			const data = {
				key: 'value',
			};

			const result = validate(data, schema);

			expect(result).toEqual(data);
		});

		it('should handle invalid_type errors', () => {
			const schema = z.object({
				id: z.number(),
				a : z.object({
					text: z.string(),
					b   : z.object({
						text: z.string(),
					}),
					c: z.object({
						text: z.string(),
					}),
					d: z.string().array(),
					e: z.string().array(),
				}),
			});

			const data = {
				id: 'a',
				a : {
					text: 1,
					c   : {
						text: 1,
					},
					d: 1,
					e: [ 'a', 1 ],
				},
			};

			expect(() => validate(data, schema)).toThrow(`Validation failed:
	a.b (Invalid input: expected object, received undefined)
	a.c.text (Invalid input: expected string, received number)
	a.d (Invalid input: expected array, received number)
	a.e.1 (Invalid input: expected string, received number)
	a.text (Invalid input: expected string, received number)
	id (Invalid input: expected number, received string)`);
		});

		it('should handle invalid_value errors', () => {
			const schema = z.object({
				key: z.enum([ 'value1', 'value2' ]),
			});

			const data = {
				key: 'value3',
			};

			expect(() => validate(data, schema)).toThrow(`Validation failed:
	key (Invalid option: expected one of "value1"|"value2")`,
			);
		});

		it('should handle invalid_format errors', () => {
			const schema = z.object({
				email: z.email(),
			});

			const data = {
				email: 'a',
			};

			expect(() => validate(data, schema)).toThrow(`Validation failed:
	email (Invalid email address)`,
			);
		});

		it('should handle invalid_union errors', () => {
			const data = {
				id: 'value',
				a : {
					textOrId1: true,
				},
			};

			const schema = z.object({
				id: z.number(),
			}).or(z.object({
				a: z.object({
					textOrId1: z.string().or(z.number()),
					textOrId2: z.union([ z.string(), z.number() ]),
				}),
			}));

			expect(() => validate(data, schema)).toThrow(`Validation failed:
	a.textOrId1 (Invalid input: expected string, received boolean)
	a.textOrId1 (Invalid input: expected number, received boolean)
	a.textOrId2 (Invalid input: expected string, received undefined)
	a.textOrId2 (Invalid input: expected number, received undefined)
	id (Invalid input: expected number, received string)`);
		});

		it('should handle invalid_key errors', () => {
			const schema = z.object({
				map1: z.map(z.number(), z.number()),
			});

			const data = {
				map1: new Map([ [ true, 1 ] ]),
			};

			expect(() => validate(data, schema)).toThrow(`Validation failed:
	map1 (Invalid key in map)`,
			);
		});

		it('should handle invalid_element errors', () => {
			const schema = z.object({
				map1: z.map(z.number(), z.number()),
			});

			const data = {
				map1: new Map([ [ true, true ] ]),
			};

			expect(() => validate(data, schema)).toThrow(`Validation failed:
	map1 (Invalid key in map)
	map1 (Invalid value in map)`,
			);
		});

		it('should handle not_multiple_of errors', () => {
			const schema = z.object({
				price: z.number().multipleOf(1000),
			});

			const data = {
				price: 999,
			};

			expect(() => validate(data, schema)).toThrow(`Validation failed:
	price (Invalid number: must be a multiple of 1000)`);
		});

		it('should handle too_big errors', () => {
			const schema = z.object({
				id: z.number().min(10).max(19),
			});

			const data = {
				id: 20,
			};

			expect(() => validate(data, schema)).toThrow(`Validation failed:
	id (Too big: expected number to be <=19)`);
		});

		it('should handle too_small errors', () => {
			const schema = z.object({
				id: z.number().min(10).max(19),
			});

			const data = {
				id: 5,
			};

			expect(() => validate(data, schema)).toThrow(`Validation failed:
	id (Too small: expected number to be >=10)`);
		});

		it('should handle unrecognized_keys errors', () => {
			const data = {
				id      : 1,
				unknown1: true,
				a       : {
					text    : 'value',
					unknown2: false,
				},
			};

			const schema = z.object({
				id: z.number(),
				a : z.object({
					text: z.string(),
				}).strict(),
			}).strict();

			expect(() => validate(data, schema)).toThrow(`Validation failed:
	[root] (Unrecognized key: "unknown1")
	a (Unrecognized key: "unknown2")`);
		});

		it('should handle custom errors', () => {
			const schema = z.object({
				text: z.string().refine((v) => v.startsWith('a'), {
					message: 'Must start with a',
				}),
			});

			const data = {
				text: 'b',
			};

			expect(() => validate(data, schema)).toThrow(`Validation failed:
	text (Must start with a)`,
			);
		});
	});
});

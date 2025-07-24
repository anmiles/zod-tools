# @anmiles/zod-tools

Collection of utility functions for zod library

----

## Installation

`npm install @anmiles/zod-tools`

## Usage

```ts
import { validate } from '@anmiles/zod-tools';

const customSchema = z.object({
	prop: z.object({
		num: z.number(),
		str: z.string(),
	}),
});

const correctJSON = JSON.parse('{"prop":{"num":5,"str":"value"}}');

const obj = validate(correctJSON, customSchema);
// ^? const obj: { prop: { num: string, str: string } } = { prop: { num: 5, str: 'value' }}

const incorrectJSON = JSON.parse('{"prop":{"num":"wrong"}}');

/*
Validation failed:
	prop.num (Invalid input: expected number, received string)
	prop.str (Invalid input: expected string, received undefined)
*/
validate(incorrectJSON, customSchema);

```

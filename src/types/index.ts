import type { z } from 'zod';
import type { $ZodTypeInternals } from 'zod/v4/core';

export type Schema<T> = z.ZodType<T, any, $ZodTypeInternals<T, unknown>>;

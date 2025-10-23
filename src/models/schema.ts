import { z } from 'zod';

export const progressionParamsSchema = z.object({
  incrementCoefficient: z.number(),
});

export const exerciseSchema = z.object({
  name: z.string(),
  type: z.enum(['bodyweight', 'weight']),
  reps: z.number(),
  sets: z.number(),
  startCoefficient: z.number(),
  progressionModel: z.enum(['linear', 'percentage', 'wave', 'block']),
  progressionParams: progressionParamsSchema,
});

export const recipePlanSchema = z.object({
  planName: z.string(),
  durationWeeks: z.number().positive(),
  bodyWeightKg: z.number(),
  exercises: z.array(exerciseSchema),
});

import { z } from 'zod';
import { PROGRESSION_MODELS } from '../progressions/index.js';

export const progressionParamsSchema = z.object({}).passthrough();

export const warmupStepSchema = z.union([
  z.object({
    exercise: z.string(),
    duration: z.string().optional(),
    sets: z.number().optional(),
    reps: z.number().optional(),
  }),
  z.object({
    weightKg: z.number(),
    reps: z.number(),
  }),
]);

export const exerciseSchema = z.object({
  name: z.string(),
  type: z.enum(['bodyweight', 'weight']),
  reps: z.number().positive(),
  sets: z.number().positive(),
  startCoefficient: z.number(),
  progressionModel: z.enum(PROGRESSION_MODELS),
  progressionParams: progressionParamsSchema,
  warmup: z.array(warmupStepSchema),
});

export const recipePlanSchema = z.object({
  planName: z.string().min(1),
  durationWeeks: z.number().positive().int(),
  bodyWeightKg: z.number().positive(),
  exercises: z.array(exerciseSchema).min(1),
});

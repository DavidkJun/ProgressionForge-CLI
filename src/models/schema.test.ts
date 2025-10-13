import { recipePlanSchema } from './schema.js';

describe('recipePlanSchema', () => {
  it('should return true if data model is valid', () => {
    const validData = {
      planName: 'Test Plan',
      durationWeeks: 8,
      bodyWeightKg: 90,
      exercises: [
        {
          name: 'Test Pull ups',
          type: 'bodyweight',
          reps: 5,
          sets: 3,
          startCoefficient: 1.0,
          progressionModel: 'linear',
          progressionParams: {
            incrementCoefficient: 0.028,
          },
        },
      ],
    };

    const result = recipePlanSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });
  it('should return false if data model is invalid', () => {
    const invalidData = {
      planName: 394875,
      durationWeeks: 8,
      bodyWeightKg: 90,
      exercises: [
        {
          name: 'Test Pull ups',
          type: 'nia',
          reps: 5,
          sets: 3,
          startCoefficient: 1.0,
          progressionModel: 'linear',
          progressionParams: {
            incrementCoefficient: 0.028,
          },
        },
      ],
    };

    const result = recipePlanSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});

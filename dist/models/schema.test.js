import { recipePlanSchema } from './schema.js';
describe('recipePlanSchema', () => {
    it('повинен повертати true, якщо дані валідні (з linear)', () => {
        const validLinearData = {
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
                    warmup: [{ exercise: 'Scapular Pulls', reps: 10 }],
                },
            ],
        };
        const result = recipePlanSchema.safeParse(validLinearData);
        expect(result.success).toBe(true);
    });
    it('повинен повертати true, якщо дані валідні (з wave)', () => {
        const validWaveData = {
            planName: 'Wave Plan',
            durationWeeks: 4,
            bodyWeightKg: 80,
            exercises: [
                {
                    name: 'Test Squat',
                    type: 'weight',
                    reps: 5,
                    sets: 3,
                    startCoefficient: 1.0,
                    progressionModel: 'wave',
                    progressionParams: {
                        weeksUp: 2,
                        upCoefficient: 0.01,
                        downCoefficient: 0.01,
                    },
                    warmup: [{ weightKg: 50, reps: 5 }],
                },
            ],
        };
        const result = recipePlanSchema.safeParse(validWaveData);
        expect(result.success).toBe(true);
    });
    it('повинен повертати false, якщо дані невалідні (неправильний тип)', () => {
        const invalidData = {
            planName: 12345,
            durationWeeks: 8,
            bodyWeightKg: 90,
            exercises: [],
        };
        const result = recipePlanSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
    });
    it('повинен повертати false, якщо у вправі відсутній warmup', () => {
        const missingWarmupData = {
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
        const result = recipePlanSchema.safeParse(missingWarmupData);
        expect(result.success).toBe(false);
    });
});
//# sourceMappingURL=schema.test.js.map
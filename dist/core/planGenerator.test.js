import { generatePlan } from './planGenerator.js';
describe('planGenerator (Повний Інтеграційний Тест)', () => {
    const comprehensiveRecipe = {
        planName: 'Comprehensive Test Plan',
        durationWeeks: 4,
        bodyWeightKg: 100,
        exercises: [
            {
                name: 'Bench Press (Linear)',
                type: 'weight',
                sets: 3,
                reps: 5,
                startCoefficient: 80,
                progressionModel: 'linear',
                progressionParams: {
                    incrementCoefficient: 0.025,
                },
                warmup: [{ weightKg: 40, reps: 5 }],
            },
            {
                name: 'Squat (Percentage)',
                type: 'weight',
                sets: 3,
                reps: 8,
                startCoefficient: 100,
                progressionModel: 'percentage',
                progressionParams: {
                    startPercent: 70,
                    incrementPercent: 5,
                },
                warmup: [{ weightKg: 50, reps: 5 }],
            },
            {
                name: 'Overhead Press (Wave)',
                type: 'weight',
                sets: 4,
                reps: 6,
                startCoefficient: 50,
                progressionModel: 'wave',
                progressionParams: {
                    weeksUp: 2,
                    upCoefficient: 0.02,
                    downCoefficient: 0.01,
                },
                warmup: [],
            },
            {
                name: 'Pull Ups (Bodyweight)',
                type: 'bodyweight',
                sets: 3,
                reps: 8,
                startCoefficient: 1.0,
                progressionModel: 'linear',
                progressionParams: {
                    incrementCoefficient: 0.02,
                },
                warmup: [],
            },
        ],
    };
    const plan = generatePlan(comprehensiveRecipe);
    it('повинен генерувати правильну структуру плану', () => {
        expect(plan.planName).toBe('Comprehensive Test Plan');
        expect(plan.durationWeeks).toBe(4);
        expect(plan.weeklyBreakdown).toHaveLength(4);
    });
    describe('Перевірка розрахунків для Bench Press (Linear)', () => {
        const exerciseIndex = 0;
        it('Тиждень 1', () => {
            expect(plan.weeklyBreakdown[0].exercises[exerciseIndex].workingSets.weightKg).toBeCloseTo(80);
        });
        it('Тиждень 2', () => {
            expect(plan.weeklyBreakdown[1].exercises[exerciseIndex].workingSets.weightKg).toBeCloseTo(82.5);
        });
        it('Тиждень 3', () => {
            expect(plan.weeklyBreakdown[2].exercises[exerciseIndex].workingSets.weightKg).toBeCloseTo(85);
        });
        it('Тиждень 4', () => {
            expect(plan.weeklyBreakdown[3].exercises[exerciseIndex].workingSets.weightKg).toBeCloseTo(85);
        });
    });
    describe('Перевірка розрахунків для Squat (Percentage)', () => {
        const exerciseIndex = 1;
        it('Тиждень 1', () => {
            expect(plan.weeklyBreakdown[0].exercises[exerciseIndex].workingSets.weightKg).toBeCloseTo(70);
        });
        it('Тиждень 2', () => {
            expect(plan.weeklyBreakdown[1].exercises[exerciseIndex].workingSets.weightKg).toBeCloseTo(75);
        });
        it('Тиждень 4', () => {
            expect(plan.weeklyBreakdown[3].exercises[exerciseIndex].workingSets.weightKg).toBeCloseTo(85);
        });
    });
    describe('Перевірка розрахунків для Pull Ups (Bodyweight)', () => {
        const exerciseIndex = 3;
        it('Тиждень 1 (Вага тіла)', () => {
            expect(plan.weeklyBreakdown[0].exercises[exerciseIndex].workingSets.weightKg).toBeCloseTo(100);
        });
        it('Тиждень 2 (Прогресія)', () => {
            expect(plan.weeklyBreakdown[1].exercises[exerciseIndex].workingSets.weightKg).toBeCloseTo(102.5);
        });
    });
    describe('Граничні випадки (Edge Cases)', () => {
        it('повинен правильно працювати з планом на 1 тиждень', () => {
            const oneWeekRecipe = {
                planName: 'One Week Plan',
                durationWeeks: 1,
                bodyWeightKg: 100,
                exercises: [
                    {
                        ...comprehensiveRecipe.exercises[0],
                        startCoefficient: 80,
                    },
                ],
            };
            const oneWeekPlan = generatePlan(oneWeekRecipe);
            expect(oneWeekPlan.durationWeeks).toBe(1);
            expect(oneWeekPlan.weeklyBreakdown).toHaveLength(1);
            expect(oneWeekPlan.weeklyBreakdown[0].exercises).toHaveLength(1);
            expect(oneWeekPlan.weeklyBreakdown[0].exercises[0].workingSets.weightKg).toBeCloseTo(80);
        });
        it('повинен розраховувати ваги як 0, якщо startCoefficient: 0', () => {
            const zeroCoeffRecipe = {
                ...comprehensiveRecipe,
                durationWeeks: 1,
                exercises: [
                    {
                        ...comprehensiveRecipe.exercises[0],
                        startCoefficient: 0,
                    },
                ],
            };
            const plan = generatePlan(zeroCoeffRecipe);
            expect(plan.weeklyBreakdown[0].exercises[0].workingSets.weightKg).toBeCloseTo(0);
        });
    });
});
//# sourceMappingURL=planGenerator.test.js.map
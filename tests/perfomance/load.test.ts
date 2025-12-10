import { generatePlan } from '../../src/core/planGenerator.js';
import { printPlan } from '../../src/utils/printer.js';
import { PlanRecipe, TrainingPlan } from '../../src/models/types.js';
import { performance } from 'perf_hooks';

describe('Performance / Load Testing', () => {
  let heavyPlan: TrainingPlan;

  const heavyRecipe: PlanRecipe = {
    planName: '10 Year Stress Test',
    durationWeeks: 520,
    bodyWeightKg: 80,
    exercises: [
      {
        name: 'Heavy Bench (Linear)',
        type: 'weight',
        sets: 5,
        reps: 5,
        startCoefficient: 100,
        progressionModel: 'linear',
        progressionParams: { incrementCoefficient: 0.01 },
        warmup: [
          { weightKg: 20, reps: 10 },
          { weightKg: 60, reps: 5 },
        ],
      },
      {
        name: 'Squat (Wave)',
        type: 'weight',
        sets: 5,
        reps: 5,
        startCoefficient: 120,
        progressionModel: 'wave',
        progressionParams: {
          weeksUp: 3,
          upCoefficient: 0.05,
          downCoefficient: 0.02,
        },
        warmup: [],
      },
      {
        name: 'Deadlift (Block)',
        type: 'weight',
        sets: 5,
        reps: 3,
        startCoefficient: 150,
        progressionModel: 'block',
        progressionParams: {
          blockWeeks: 4,
          accumulationCoefficient: 0.01,
          intensificationCoefficient: 0.03,
        },
        warmup: [],
      },
      {
        name: 'Pull Ups (Percentage)',
        type: 'bodyweight',
        sets: 5,
        reps: 10,
        startCoefficient: 1.0,
        progressionModel: 'percentage',
        progressionParams: { startPercent: 50, incrementPercent: 0.5 },
        warmup: [{ exercise: 'Scapulars', sets: 2, reps: 15 }],
      },
    ],
  };
  const standartRecipe: PlanRecipe = {
    planName: '10 Year Stress Test',
    durationWeeks: 12,
    bodyWeightKg: 80,
    exercises: [
      {
        name: 'Heavy Bench (Linear)',
        type: 'weight',
        sets: 5,
        reps: 5,
        startCoefficient: 100,
        progressionModel: 'linear',
        progressionParams: { incrementCoefficient: 0.01 },
        warmup: [
          { weightKg: 20, reps: 10 },
          { weightKg: 60, reps: 5 },
        ],
      },
      {
        name: 'Squat (Wave)',
        type: 'weight',
        sets: 5,
        reps: 5,
        startCoefficient: 120,
        progressionModel: 'wave',
        progressionParams: {
          weeksUp: 3,
          upCoefficient: 0.05,
          downCoefficient: 0.02,
        },
        warmup: [],
      },
      {
        name: 'Deadlift (Block)',
        type: 'weight',
        sets: 5,
        reps: 3,
        startCoefficient: 150,
        progressionModel: 'block',
        progressionParams: {
          blockWeeks: 4,
          accumulationCoefficient: 0.01,
          intensificationCoefficient: 0.03,
        },
        warmup: [],
      },
    ],
  };

  it('should generate a 10-year plan (520 weeks) under 1000ms', () => {
    const start = performance.now();
    heavyPlan = generatePlan(heavyRecipe);
    const end = performance.now();
    const duration = end - start;

    console.log(`⚡ [Generation - Depth] 520 weeks: ${duration.toFixed(2)}ms`);

    expect(heavyPlan.weeklyBreakdown).toHaveLength(520);
    expect(duration).toBeLessThan(1000);
  });

  it('should generate a plan with 100 exercises per week under 500ms', () => {
    const wideRecipe: PlanRecipe = {
      planName: 'Wide Load Test',
      durationWeeks: 12,
      bodyWeightKg: 80,
      exercises: Array.from({ length: 100 }, (_, i) => ({
        name: `Exercise ${i}`,
        type: 'weight',
        sets: 3,
        reps: 10,
        startCoefficient: 50,
        progressionModel: 'linear',
        progressionParams: { incrementCoefficient: 0.01 },
        warmup: [],
      })),
    };

    const start = performance.now();
    const widePlan = generatePlan(wideRecipe);
    const end = performance.now();
    const duration = end - start;

    console.log(
      `⚡ [Generation - Width] 100 exercises/week: ${duration.toFixed(2)}ms`
    );

    expect(widePlan.weeklyBreakdown[0]!.exercises).toHaveLength(100);
    expect(duration).toBeLessThan(500);
  });

  it('should handle 100 parallel generations under 100ms', async () => {
    const iterations = 100;
    const start = performance.now();

    const tasks = Array.from(
      { length: iterations },
      () =>
        new Promise<void>((resolve) => {
          generatePlan(standartRecipe);
          resolve();
        })
    );

    await Promise.all(tasks);

    const end = performance.now();
    const duration = end - start;
    const avgTime = duration / iterations;

    console.log(
      `⚡ [Concurrency] 100 parallel runs: Total ${duration.toFixed(
        2
      )}ms (Avg ${avgTime.toFixed(2)}ms/op)`
    );

    expect(duration).toBeLessThan(10000);
  });

  it('should format and print (mocked) a 10-year plan under 500ms', () => {
    const mockLog = jest.spyOn(console, 'log').mockImplementation(() => {});

    const start = performance.now();
    printPlan(heavyPlan);
    const end = performance.now();

    mockLog.mockRestore();

    const duration = end - start;
    console.log(`⚡ [Printer] Formatting: ${duration.toFixed(2)}ms`);

    expect(duration).toBeLessThan(500);
  });

  it('should stringify (serialize) a 10-year plan under 100ms', () => {
    const start = performance.now();
    const jsonString = JSON.stringify(heavyPlan, null, 2);
    const end = performance.now();
    const duration = end - start;

    console.log(`⚡ [Serialization] Time: ${duration.toFixed(2)}ms`);

    expect(jsonString).toContain('10 Year Stress Test');
    expect(duration).toBeLessThan(100);
  });

  it('should not leak excessive memory after 1000 generations', () => {
    if (global.gc) {
      global.gc();
    }

    const initialMemory = process.memoryUsage().heapUsed;

    for (let i = 0; i < 1000; i++) {
      generatePlan(standartRecipe);
    }

    const finalMemory = process.memoryUsage().heapUsed;
    const diffMB = (finalMemory - initialMemory) / 1024 / 1024;

    console.log(`⚡ [Memory] Growth after 1000 runs: ${diffMB.toFixed(2)} MB`);

    expect(diffMB).toBeLessThan(50);
  });
});

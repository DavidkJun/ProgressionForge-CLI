import { printPlan } from './printer.js';
import { TrainingPlan, WarmupStep } from '../models/types.js';

describe('printPlan (Comprehensive Test)', () => {
  let consoleOutput: string[] = [];
  const consoleSpy = jest
    .spyOn(console, 'log')
    .mockImplementation((output: string) => {
      consoleOutput.push(output);
    });

  beforeEach(() => {
    consoleOutput = [];
    consoleSpy.mockClear();
  });

  afterAll(() => {
    consoleSpy.mockRestore();
  });

  const basePlan: TrainingPlan = {
    planName: 'Comprehensive Test Plan',
    durationWeeks: 2,
    weeklyBreakdown: [],
  };

  it('should print a full plan with multiple weeks, exercises, and warmup types', () => {
    const fullPlan: TrainingPlan = {
      ...basePlan,
      weeklyBreakdown: [
        {
          week: 1,
          exercises: [
            {
              name: 'Bench Press',
              type: 'weight',
              workingSets: { sets: 3, reps: 5, weightKg: 100 },
              warmup: [
                { weightKg: 50, reps: 5 },
                { exercise: 'Rotator Cuffs' },
              ],
            },
          ],
        },
        {
          week: 2,
          exercises: [
            {
              name: 'Squat',
              type: 'weight',
              workingSets: { sets: 5, reps: 5, weightKg: 120 },
              warmup: [{ exercise: 'Goblet Squat', sets: 2, reps: 8 }],
            },
            {
              name: 'Pull Ups',
              type: 'bodyweight',
              workingSets: { sets: 4, reps: 8, weightKg: 90 },
              warmup: [{ exercise: 'Scapular Pulls', reps: 10 }],
            },
          ],
        },
      ],
    };

    printPlan(fullPlan);

    const expectedOutput = [
      '========================================',
      'PLAN: Comprehensive Test Plan',
      'Duration: 2 weeks',
      '========================================',
      '\n--- Week 1 ---',
      '  **Bench Press (3 x 5 @ 100 kg)**',
      '    Warmup: 50 kg x 5 reps',
      '    Warmup: Rotator Cuffs ',
      '\n--- Week 2 ---',
      '  **Squat (5 x 5 @ 120 kg)**',
      '    Warmup: Goblet Squat 2 sets x 8 reps',
      '  **Pull Ups (4 x 8 @ 90 kg)**',
      '    Warmup: Scapular Pulls x 10 reps',
    ];

    expect(consoleOutput).toEqual(expectedOutput);
  });

  it('should correctly print an exercise with no warmup steps', () => {
    const noWarmupPlan: TrainingPlan = {
      ...basePlan,
      durationWeeks: 1,
      weeklyBreakdown: [
        {
          week: 1,
          exercises: [
            {
              name: 'Deadlift',
              type: 'weight',
              workingSets: { sets: 1, reps: 5, weightKg: 150 },
              warmup: [],
            },
          ],
        },
      ],
    };

    printPlan(noWarmupPlan);

    const expectedOutput = [
      '========================================',
      'PLAN: Comprehensive Test Plan',
      'Duration: 1 weeks',
      '========================================',
      '\n--- Week 1 ---',
      '  **Deadlift (1 x 5 @ 150 kg)**',
    ];

    expect(consoleOutput).toEqual(expectedOutput);
  });

  it('should print only the header for an empty plan (0 weeks)', () => {
    const emptyPlan: TrainingPlan = {
      ...basePlan,
      durationWeeks: 0,
      weeklyBreakdown: [],
    };

    printPlan(emptyPlan);

    const expectedOutput = [
      '========================================',
      'PLAN: Comprehensive Test Plan',
      'Duration: 0 weeks',
      '========================================',
    ];

    expect(consoleOutput).toEqual(expectedOutput);
  });

  it('should print week headers even if a week has no exercises', () => {
    const emptyWeekPlan: TrainingPlan = {
      ...basePlan,
      durationWeeks: 1,
      weeklyBreakdown: [
        {
          week: 1,
          exercises: [],
        },
      ],
    };

    printPlan(emptyWeekPlan);

    const expectedOutput = [
      '========================================',
      'PLAN: Comprehensive Test Plan',
      'Duration: 1 weeks',
      '========================================',
      '\n--- Week 1 ---',
    ];

    expect(consoleOutput).toEqual(expectedOutput);
  });

  it('should correctly format a warmup step with only sets and reps', () => {
    const complexWarmupStep: WarmupStep = {
      exercise: 'Box Jumps',
      sets: 3,
      reps: 5,
    };

    const plan: TrainingPlan = {
      ...basePlan,
      durationWeeks: 1,
      weeklyBreakdown: [
        {
          week: 1,
          exercises: [
            {
              name: 'Squat',
              type: 'weight',
              workingSets: { sets: 3, reps: 5, weightKg: 100 },
              warmup: [complexWarmupStep],
            },
          ],
        },
      ],
    };

    printPlan(plan);
    expect(consoleOutput[6]).toBe('    Warmup: Box Jumps 3 sets x 5 reps');
  });
});

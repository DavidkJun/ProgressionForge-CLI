import inquirer from 'inquirer';
import { handleNew } from './new.js';
import * as storageManager from '../storage/storageManager.js';

jest.mock('inquirer');
jest.mock('../storage/storageManager');

describe('Command: new (Integration)', () => {
  const mockConsoleLog = jest
    .spyOn(console, 'log')
    .mockImplementation(() => {});
  const mockConsoleError = jest
    .spyOn(console, 'error')
    .mockImplementation(() => {});

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
  });

  it('should successfully collect inputs and save a complete plan (Weight + Linear)', async () => {
    const planName = 'SimpleWeightPlan';

    (storageManager.planExists as jest.Mock).mockResolvedValue(false);

    (inquirer.prompt as unknown as jest.Mock)
      .mockResolvedValueOnce({
        durationWeeks: 4,
        bodyWeightKg: 80,
      })
      .mockResolvedValueOnce({
        name: 'Bench Press',
        type: 'weight',
        sets: 3,
        reps: 8,
        progressionModel: 'linear',
      })
      .mockResolvedValueOnce({
        startWeight: 100,
      })
      .mockResolvedValueOnce({
        incrementCoefficient: 2.5,
      })
      .mockResolvedValueOnce({
        warmupType: 'standard',
      })
      .mockResolvedValueOnce({
        addMore: false,
      });

    await handleNew(planName);

    expect(storageManager.planExists).toHaveBeenCalledWith(planName);
    expect(storageManager.savePlan).toHaveBeenCalledWith(
      planName,
      expect.objectContaining({
        planName,
        exercises: expect.arrayContaining([
          expect.objectContaining({
            name: 'Bench Press',
            type: 'weight',
            startCoefficient: 100,
            progressionModel: 'linear',
          }),
        ]),
      })
    );
    expect(mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining('Success!')
    );
  });

  it('should handle Bodyweight exercise with Percentage model and Preset warmup', async () => {
    const planName = 'CalisthenicsPlan';

    (storageManager.planExists as jest.Mock).mockResolvedValue(false);

    (inquirer.prompt as unknown as jest.Mock)
      .mockResolvedValueOnce({
        durationWeeks: 8,
        bodyWeightKg: 75,
      })
      .mockResolvedValueOnce({
        name: 'Pull Ups',
        type: 'bodyweight',
        sets: 4,
        reps: 10,
        progressionModel: 'percentage',
      })
      .mockResolvedValueOnce({
        coeff: 0.9,
      })
      .mockResolvedValueOnce({
        startPercent: 70,
        incrementPercent: 2.5,
      })
      .mockResolvedValueOnce({
        movementType: 'upper-body',
      })
      .mockResolvedValueOnce({
        warmupType: 'preset',
      })
      .mockResolvedValueOnce({
        addMore: false,
      });

    await handleNew(planName);

    expect(storageManager.savePlan).toHaveBeenCalledWith(
      planName,
      expect.objectContaining({
        bodyWeightKg: 75,
        exercises: expect.arrayContaining([
          expect.objectContaining({
            name: 'Pull Ups',
            type: 'bodyweight',
            startCoefficient: 0.9,
            progressionModel: 'percentage',
            progressionParams: expect.objectContaining({
              startPercent: 70,
              incrementPercent: 2.5,
            }),
            warmup: expect.any(Array),
          }),
        ]),
      })
    );
  });

  it('should handle Multiple Exercises, Wave progression and Custom Warmup loop', async () => {
    const planName = 'ComplexPlan';

    (storageManager.planExists as jest.Mock).mockResolvedValue(false);

    (inquirer.prompt as unknown as jest.Mock)
      .mockResolvedValueOnce({
        durationWeeks: 12,
        bodyWeightKg: 90,
      })
      .mockResolvedValueOnce({
        name: 'Squat',
        type: 'weight',
        sets: 5,
        reps: 5,
        progressionModel: 'wave',
      })
      .mockResolvedValueOnce({
        startWeight: 140,
      })
      .mockResolvedValueOnce({
        weeksUp: 3,
        upCoefficient: 0.02,
        downCoefficient: 0.01,
      })
      .mockResolvedValueOnce({
        warmupType: 'custom',
      })
      .mockResolvedValueOnce({
        stepType: 'Weight-based (e.g., 40kg x 5)',
      })
      .mockResolvedValueOnce({
        weightKg: 60,
        reps: 10,
      })
      .mockResolvedValueOnce({
        addMore: true,
      })
      .mockResolvedValueOnce({
        stepType: 'Exercise-based (e.g., Pull-ups)',
      })
      .mockResolvedValueOnce({
        exercise: 'Jumps',
        sets: 2,
        reps: 5,
      })
      .mockResolvedValueOnce({
        addMore: false,
      })
      .mockResolvedValueOnce({
        addMore: true,
      })
      .mockResolvedValueOnce({
        name: 'Deadlift',
        type: 'weight',
        sets: 3,
        reps: 5,
        progressionModel: 'linear',
      })
      .mockResolvedValueOnce({
        startWeight: 180,
      })
      .mockResolvedValueOnce({
        incrementCoefficient: 2.5,
      })
      .mockResolvedValueOnce({
        warmupType: 'standard',
      })
      .mockResolvedValueOnce({
        addMore: false,
      });

    await handleNew(planName);

    expect(storageManager.savePlan).toHaveBeenCalledWith(
      planName,
      expect.objectContaining({
        exercises: expect.arrayContaining([
          expect.objectContaining({
            name: 'Squat',
            progressionModel: 'wave',
            warmup: expect.arrayContaining([
              expect.objectContaining({ weightKg: 60 }),
              expect.objectContaining({ exercise: 'Jumps' }),
            ]),
          }),
          expect.objectContaining({
            name: 'Deadlift',
            progressionModel: 'linear',
          }),
        ]),
      })
    );
  });

  it('should show error and exit if plan already exists', async () => {
    const planName = 'ExistingPlan';

    (storageManager.planExists as jest.Mock).mockResolvedValue(true);

    await handleNew(planName);

    expect(storageManager.planExists).toHaveBeenCalledWith(planName);

    expect(mockConsoleError).toHaveBeenCalledWith(
      expect.stringContaining(`Plan with name "${planName}" already exists`)
    );

    expect(inquirer.prompt).not.toHaveBeenCalled();

    expect(storageManager.savePlan).not.toHaveBeenCalled();
  });
});

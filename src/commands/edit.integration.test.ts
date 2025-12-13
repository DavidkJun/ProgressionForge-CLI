// @ts-nocheck
import { jest } from '@jest/globals';

import inquirer from 'inquirer';
import { handleEdit } from './edit.js';
import * as storageManager from '../storage/storageManager.js';
import * as newCommand from './new.js';

jest.mock('inquirer');
jest.mock('../storage/storageManager');
jest.mock('./new.js');

describe('Command: edit (Integration)', () => {
  const mockConsoleLog = jest
    .spyOn(console, 'log')
    .mockImplementation(() => {});
  const mockConsoleError = jest
    .spyOn(console, 'error')
    .mockImplementation(() => {});

  const mockPlan = {
    planName: 'TestPlan',
    durationWeeks: 4,
    bodyWeightKg: 80,
    exercises: [
      {
        name: 'Bench Press',
        type: 'weight',
        sets: 3,
        reps: 8,
        startCoefficient: 100,
        progressionModel: 'linear',
        progressionParams: { incrementCoefficient: 2.5 },
        warmup: [],
      },
      {
        name: 'Pull Ups',
        type: 'bodyweight',
        sets: 3,
        reps: 10,
        startCoefficient: 1.0,
        progressionModel: 'linear',
        progressionParams: { incrementCoefficient: 0.05 },
        warmup: [],
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
  });

  it('should show error if plan does not exist', async () => {
    const planName = 'NonExistentPlan';
    (storageManager.planExists as jest.Mock).mockResolvedValue(false);

    await handleEdit(planName);

    expect(mockConsoleError).toHaveBeenCalledWith(
      expect.stringContaining(`Error: Plan "${planName}" does not exist`)
    );
    expect(storageManager.loadPlan).not.toHaveBeenCalled();
  });

  it('should update plan duration and bodyweight', async () => {
    (storageManager.planExists as jest.Mock).mockResolvedValue(true);
    (storageManager.loadPlan as jest.Mock).mockResolvedValue({ ...mockPlan });

    (inquirer.prompt as unknown as jest.Mock)
      .mockResolvedValueOnce({
        mainAction: 'Edit Plan Details (Duration, Bodyweight)',
      })
      .mockResolvedValueOnce({
        durationWeeks: 8,
        bodyWeightKg: 85,
      })
      .mockResolvedValueOnce({
        mainAction: 'Save & Exit',
      });

    await handleEdit('TestPlan');

    expect(storageManager.savePlan).toHaveBeenCalledWith(
      'TestPlan',
      expect.objectContaining({
        durationWeeks: 8,
        bodyWeightKg: 85,
      })
    );
  });

  it('should edit an existing exercise (Sets, Reps, Coefficient)', async () => {
    (storageManager.planExists as jest.Mock).mockResolvedValue(true);
    (storageManager.loadPlan as jest.Mock).mockResolvedValue(
      JSON.parse(JSON.stringify(mockPlan))
    );

    (inquirer.prompt as unknown as jest.Mock)
      .mockResolvedValueOnce({
        mainAction: 'Manage Exercises',
      })
      .mockResolvedValueOnce({
        action: 'Edit: Bench Press',
      })
      .mockResolvedValueOnce({
        action: 'Edit Sets & Reps',
      })
      .mockResolvedValueOnce({
        newSets: 5,
        newReps: 5,
      })
      .mockResolvedValueOnce({
        action: 'Edit Start Coefficient',
      })
      .mockResolvedValueOnce({
        newCoeff: 110,
      })
      .mockResolvedValueOnce({
        action: 'Back to Exercises List',
      })
      .mockResolvedValueOnce({
        action: 'Back to Main Menu',
      })
      .mockResolvedValueOnce({
        mainAction: 'Save & Exit',
      });

    await handleEdit('TestPlan');

    expect(storageManager.savePlan).toHaveBeenCalledWith(
      'TestPlan',
      expect.objectContaining({
        exercises: expect.arrayContaining([
          expect.objectContaining({
            name: 'Bench Press',
            sets: 5,
            reps: 5,
            startCoefficient: 110,
          }),
        ]),
      })
    );
  });

  it('should add a new exercise using newCommand.promptForExercise', async () => {
    (storageManager.planExists as jest.Mock).mockResolvedValue(true);
    (storageManager.loadPlan as jest.Mock).mockResolvedValue(
      JSON.parse(JSON.stringify(mockPlan))
    );

    const newExerciseMock = {
      name: 'Deadlift',
      type: 'weight',
      sets: 1,
      reps: 1,
      startCoefficient: 150,
      progressionModel: 'linear',
      warmup: [],
    };

    (newCommand.promptForExercise as jest.Mock).mockResolvedValue(
      newExerciseMock
    );

    (inquirer.prompt as unknown as jest.Mock)
      .mockResolvedValueOnce({
        mainAction: 'Manage Exercises',
      })
      .mockResolvedValueOnce({
        action: 'Add a new exercise',
      })
      .mockResolvedValueOnce({
        action: 'Back to Main Menu',
      })
      .mockResolvedValueOnce({
        mainAction: 'Save & Exit',
      });

    await handleEdit('TestPlan');

    expect(newCommand.promptForExercise).toHaveBeenCalled();
    expect(storageManager.savePlan).toHaveBeenCalledWith(
      'TestPlan',
      expect.objectContaining({
        exercises: expect.arrayContaining([
          expect.objectContaining({ name: 'Bench Press' }),
          expect.objectContaining({ name: 'Deadlift' }),
        ]),
      })
    );
  });

  it('should delete an exercise', async () => {
    (storageManager.planExists as jest.Mock).mockResolvedValue(true);
    (storageManager.loadPlan as jest.Mock).mockResolvedValue(
      JSON.parse(JSON.stringify(mockPlan))
    );

    (inquirer.prompt as unknown as jest.Mock)
      .mockResolvedValueOnce({
        mainAction: 'Manage Exercises',
      })
      .mockResolvedValueOnce({
        action: 'Delete: Pull Ups',
      })
      .mockResolvedValueOnce({
        confirm: true,
      })
      .mockResolvedValueOnce({
        action: 'Back to Main Menu',
      })
      .mockResolvedValueOnce({
        mainAction: 'Save & Exit',
      });

    await handleEdit('TestPlan');

    expect(storageManager.savePlan).toHaveBeenCalledWith(
      'TestPlan',
      expect.objectContaining({
        exercises: expect.not.arrayContaining([
          expect.objectContaining({ name: 'Pull Ups' }),
        ]),
      })
    );
    expect(storageManager.savePlan).toHaveBeenCalledWith(
      'TestPlan',
      expect.objectContaining({
        exercises: expect.arrayContaining([
          expect.objectContaining({ name: 'Bench Press' }),
        ]),
      })
    );
  });

  it('should exit without saving if confirmed', async () => {
    (storageManager.planExists as jest.Mock).mockResolvedValue(true);
    (storageManager.loadPlan as jest.Mock).mockResolvedValue({ ...mockPlan });

    (inquirer.prompt as unknown as jest.Mock)
      .mockResolvedValueOnce({
        mainAction: 'Edit Plan Details (Duration, Bodyweight)',
      })
      .mockResolvedValueOnce({
        durationWeeks: 10,
        bodyWeightKg: 90,
      })
      .mockResolvedValueOnce({
        mainAction: 'Exit without Saving',
      })
      .mockResolvedValueOnce({
        confirmExit: true,
      });

    await handleEdit('TestPlan');

    expect(storageManager.savePlan).not.toHaveBeenCalled();
  });
});

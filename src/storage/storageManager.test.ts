import mock from 'mock-fs';
import * as storageManager from './storageManager.js';
import { PlanRecipe } from '../models/types.js';
import path from 'path';
import os from 'os';

const MOCK_PLAN_NAME = 'MyTestPlan';
const MOCK_PLAN_DATA: PlanRecipe = {
  planName: MOCK_PLAN_NAME,
  durationWeeks: 4,
  bodyWeightKg: 80,
  exercises: [
    {
      name: 'Push ups',
      type: 'bodyweight',
      reps: 10,
      sets: 3,
      startCoefficient: 1.0,
      progressionModel: 'linear',
      progressionParams: {
        incrementCoefficient: 0.1,
      },
    },
  ],
};

describe('storageManager', () => {
  afterEach(() => {
    mock.restore();
  });

  it('should save and then load a plan correctly', async () => {
    mock({});
    await storageManager.savePlan(MOCK_PLAN_NAME, MOCK_PLAN_DATA);

    const loadedPlan = await storageManager.loadPlan(MOCK_PLAN_NAME);

    expect(loadedPlan).toEqual(MOCK_PLAN_DATA);
  });
  it('should return error that file doesnt exist', async () => {
    mock({});
    await expect(storageManager.loadPlan('non_existent_plan')).rejects.toThrow(
      `Plan with name "non_existent_plan" does not exist.`
    );
  });
  it('should return error that file is corrupted', async () => {
    const corruptedPlanPath = path.join(
      os.homedir(),
      '.progression-forge',
      'plans'
    );
    const corruptedPlanName = 'corrupted_plan';
    const invalidJson = '{"planName": "test", "durationWeeks": 4,}';

    mock({
      [corruptedPlanPath]: {
        [`${corruptedPlanName}.json`]: invalidJson,
      },
      node_modules: mock.load(path.resolve(process.cwd(), 'node_modules')),
    });
    await expect(storageManager.loadPlan(corruptedPlanName)).rejects.toThrow(
      `Failed to load or parse plan "${corruptedPlanName}".`
    );
  });
  it('should throw a validation error for a plan with invalid data structure', async () => {
    const invalidPlanPath = path.join(
      os.homedir(),
      '.progression-forge',
      'plans'
    );
    const invalidPlanName = 'invalid_structure_plan';

    const planWithInvalidData = {
      planName: invalidPlanName,
      durationWeeks: 'a string instead of a number',
      bodyWeightKg: 80,
      exercises: [],
    };

    const validJsonString = JSON.stringify(planWithInvalidData);

    mock({
      [invalidPlanPath]: {
        [`${invalidPlanName}.json`]: validJsonString,
      },
      node_modules: mock.load(path.resolve(process.cwd(), 'node_modules')),
    });

    await expect(storageManager.loadPlan(invalidPlanName)).rejects.toThrow(
      `Plan file "${invalidPlanName}.json" is corrupted or has invalid format.`
    );
  });
  it('should list plans, delete one, and reflect the change', async () => {
    const planPath = path.join(os.homedir(), '.progression-forge', 'plans');
    mock({
      [planPath]: {
        'plan-A.json': '{}',
        'plan-B.json': '{}',
        'plan-C.json': '{}',
      },
      node_modules: mock.load(path.resolve(process.cwd(), 'node_modules')),
    });

    const initialList = await storageManager.listPlans();
    expect(initialList).toEqual(['plan-A', 'plan-B', 'plan-C']);

    await storageManager.deletePlan('plan-B');

    const finalList = await storageManager.listPlans();
    expect(finalList).toEqual(['plan-A', 'plan-C']);
  });

  it('should correctly check if a plan exists', async () => {
    mock({});

    const existsBeforeSaving = await storageManager.planExists('my-new-plan');
    expect(existsBeforeSaving).toBe(false);

    await storageManager.savePlan('my-new-plan', MOCK_PLAN_DATA);

    const existsAfterSaving = await storageManager.planExists('my-new-plan');
    expect(existsAfterSaving).toBe(true);
  });
});

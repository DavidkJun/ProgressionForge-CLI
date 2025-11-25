import mock from 'mock-fs';
import * as storageManager from './storageManager.js';
import { PlanRecipe } from '../models/types.js';
import path from 'path';

const CWD = process.cwd();
const PLANS_DIR = path.join(CWD, 'plans');

const MOCK_PLAN_NAME = 'TestPlan';
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
      warmup: [{ exercise: 'Arm Circles', reps: 10 }],
    },
  ],
};

describe('storageManager (Integration Tests)', () => {
  beforeEach(() => {
    mock({
      node_modules: mock.load(path.resolve(CWD, 'node_modules')),
      [PLANS_DIR]: {},
    });
  });

  afterEach(() => {
    mock.restore();
  });

  describe('savePlan & loadPlan', () => {
    it('should save a plan to the correct directory and load it back', async () => {
      await storageManager.savePlan(MOCK_PLAN_NAME, MOCK_PLAN_DATA);

      const loadedPlan = await storageManager.loadPlan(MOCK_PLAN_NAME);
      expect(loadedPlan).toEqual(MOCK_PLAN_DATA);
    });

    it('should throw an error if the plan does not exist', async () => {
      await expect(storageManager.loadPlan('non-existent')).rejects.toThrow(
        'does not exist'
      );
    });

    it('should throw an error if the file is corrupted (invalid JSON)', async () => {
      mock({
        node_modules: mock.load(path.resolve(CWD, 'node_modules')),
        [PLANS_DIR]: {
          'bad-json.json': '{ "name": "Incomplete JSON"',
        },
      });

      await expect(storageManager.loadPlan('bad-json')).rejects.toThrow(
        'Failed to load or parse plan'
      );
    });

    it('should throw a validation error if the data structure is invalid', async () => {
      const invalidData = {
        planName: 'Invalid',
        bodyWeightKg: 'wrong type',
      };

      mock({
        node_modules: mock.load(path.resolve(CWD, 'node_modules')),
        [PLANS_DIR]: {
          'invalid-schema.json': JSON.stringify(invalidData),
        },
      });

      await expect(storageManager.loadPlan('invalid-schema')).rejects.toThrow(
        'is corrupted or has invalid format'
      );
    });
  });

  describe('listPlans', () => {
    it('should return a list of plan names', async () => {
      mock({
        node_modules: mock.load(path.resolve(CWD, 'node_modules')),
        [PLANS_DIR]: {
          'PlanA.json': '{}',
          'PlanB.json': '{}',
        },
      });

      const list = await storageManager.listPlans();
      expect(list).toHaveLength(2);
      expect(list).toContain('PlanA');
      expect(list).toContain('PlanB');
    });

    it('should ignore non-json files', async () => {
      mock({
        node_modules: mock.load(path.resolve(CWD, 'node_modules')),
        [PLANS_DIR]: {
          'PlanA.json': '{}',
          'image.png': 'binary data',
          '.DS_Store': 'system file',
          'notes.txt': 'text',
        },
      });

      const list = await storageManager.listPlans();
      expect(list).toEqual(['PlanA']);
    });

    it('should return an empty array if the plans directory does not exist', async () => {
      mock({
        node_modules: mock.load(path.resolve(CWD, 'node_modules')),
      });

      const list = await storageManager.listPlans();
      expect(list).toEqual([]);
    });
  });

  describe('deletePlan', () => {
    it('should successfully delete a plan', async () => {
      mock({
        node_modules: mock.load(path.resolve(CWD, 'node_modules')),
        [PLANS_DIR]: {
          'ToDelete.json': '{}',
        },
      });

      await storageManager.deletePlan('ToDelete');
      const list = await storageManager.listPlans();
      expect(list).not.toContain('ToDelete');
    });

    it('should throw an error when trying to delete a non-existent plan', async () => {
      await expect(storageManager.deletePlan('Ghost')).rejects.toThrow(
        'does not exist'
      );
    });
  });

  describe('planExists', () => {
    it('should return true if the plan exists', async () => {
      mock({
        node_modules: mock.load(path.resolve(CWD, 'node_modules')),
        [PLANS_DIR]: {
          'Exists.json': '{}',
        },
      });
      const result = await storageManager.planExists('Exists');
      expect(result).toBe(true);
    });

    it('should return false if the plan does not exist', async () => {
      const result = await storageManager.planExists('Nope');
      expect(result).toBe(false);
    });
  });
});

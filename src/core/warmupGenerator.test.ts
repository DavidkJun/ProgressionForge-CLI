import {
  getStandardWarmup,
  getUpperBodyPreset,
  getLowerBodyPreset,
  WARMUP_CALCULATORS,
  WARMUP_PRESETS,
} from './warmupGenerator.js';
import { WarmupStep } from '../models/types.js';

describe('Warmup Generators', () => {
  describe('getStandardWarmup (Calculator)', () => {
    it('should return the correct 3-step ramp for 100kg', () => {
      const workingWeight = 100;
      const expectedWarmup: WarmupStep[] = [
        { weightKg: 60, reps: 8 },
        { weightKg: 70, reps: 6 },
        { weightKg: 80, reps: 4 },
      ];

      const result = getStandardWarmup(workingWeight);
      expect(result).toEqual(expectedWarmup);
    });

    it('should correctly calculate and round weights for 83kg', () => {
      const workingWeight = 83;
      const expectedWarmup: WarmupStep[] = [
        { weightKg: 50, reps: 8 },
        { weightKg: 57.5, reps: 6 },
        { weightKg: 65, reps: 4 },
      ];

      const result = getStandardWarmup(workingWeight);
      expect(result).toEqual(expectedWarmup);
    });

    it('should return low weights for 20kg', () => {
      const workingWeight = 20;
      const expectedWarmup: WarmupStep[] = [
        { weightKg: 12.5, reps: 8 },
        { weightKg: 15, reps: 6 },
        { weightKg: 15, reps: 4 },
      ];

      const result = getStandardWarmup(workingWeight);
      expect(result).toEqual(expectedWarmup);
    });
  });

  describe('getUpperBodyPreset (Preset)', () => {
    it('should return the exact upper body preset array', () => {
      const expectedPreset: WarmupStep[] = [
        {
          exercise: 'Scapular Pulls / Scapular Push-ups',
          sets: 2,
          reps: 10,
        },
        {
          exercise: 'Band Pull-Aparts',
          sets: 2,
          reps: 15,
        },
      ];

      const result = getUpperBodyPreset();
      expect(result).toEqual(expectedPreset);
    });
  });

  describe('getLowerBodyPreset (Preset)', () => {
    it('should return the exact lower body preset array', () => {
      const expectedPreset: WarmupStep[] = [
        {
          exercise: 'Bodyweight Squats (partial reps)',
          sets: 2,
          reps: 15,
        },
        {
          exercise: 'Knees circular swings',
          sets: 2,
          reps: 10,
        },
      ];

      const result = getLowerBodyPreset();
      expect(result).toEqual(expectedPreset);
    });
  });

  describe('Registries', () => {
    it('WARMUP_CALCULATORS should map "standard" to the correct function', () => {
      expect(WARMUP_CALCULATORS.standard).toBe(getStandardWarmup);
      expect(WARMUP_CALCULATORS.standard(100)).toEqual(getStandardWarmup(100));
    });

    it('WARMUP_PRESETS should map "upper-body" to the correct function', () => {
      expect(WARMUP_PRESETS['upper-body']).toBe(getUpperBodyPreset);
      expect(WARMUP_PRESETS['upper-body']()).toEqual(getUpperBodyPreset());
    });

    it('WARMUP_PRESETS should map "lower-body" to the correct function', () => {
      expect(WARMUP_PRESETS['lower-body']).toBe(getLowerBodyPreset);
      expect(WARMUP_PRESETS['lower-body']()).toEqual(getLowerBodyPreset());
    });
  });
});

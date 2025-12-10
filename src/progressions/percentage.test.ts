import { percentageProgression, PercentageParams } from './percentage.js';
import { roundToNearest } from '../utils/math.js';

describe('percentageProgression', () => {
  it('should return correctly calculated and rounded weights for a standard case', () => {
    const data: PercentageParams = {
      initialWeight: 100,
      durationWeeks: 4,
      progressionParams: {
        startPercent: 70,
        incrementPercent: 2.5,
      },
    };
    const expectedResult = [70, 72.5, 75, 77.5];
    expect(percentageProgression(data)).toEqual(expectedResult);
  });

  it('should correctly round values to the nearest 2.5 step', () => {
    const data: PercentageParams = {
      initialWeight: 100,
      durationWeeks: 3,
      progressionParams: {
        startPercent: 71,
        incrementPercent: 1.1,
      },
    };
    const expectedResult = [70, 72.5, 72.5];
    expect(percentageProgression(data)).toEqual(expectedResult);
  });

  it('should return an array of identical weights if incrementPercent is zero', () => {
    const data: PercentageParams = {
      initialWeight: 100,
      durationWeeks: 3,
      progressionParams: {
        startPercent: 80,
        incrementPercent: 0,
      },
    };
    const expectedResult = [80, 80, 80];
    expect(percentageProgression(data)).toEqual(expectedResult);
  });

  it('should correctly handle a single week duration', () => {
    const data: PercentageParams = {
      initialWeight: 100,
      durationWeeks: 1,
      progressionParams: {
        startPercent: 90,
        incrementPercent: 5,
      },
    };
    const expectedResult = [90];
    expect(percentageProgression(data)).toEqual(expectedResult);
  });

  it('should correctly calculate a descending progression with a negative increment', () => {
    const data: PercentageParams = {
      initialWeight: 100,
      durationWeeks: 3,
      progressionParams: {
        startPercent: 80,
        incrementPercent: -5,
      },
    };
    const expectedResult = [80, 75, 70];
    expect(percentageProgression(data)).toEqual(expectedResult);
  });

  it('should correctly calculate percentages over 100%', () => {
    const data: PercentageParams = {
      initialWeight: 100,
      durationWeeks: 3,
      progressionParams: {
        startPercent: 97.5,
        incrementPercent: 2.5,
      },
    };
    const expectedResult = [97.5, 100, 102.5];
    expect(percentageProgression(data)).toEqual(expectedResult);
  });

  it('should return all zeros if initialWeight is zero', () => {
    const data: PercentageParams = {
      initialWeight: 0,
      durationWeeks: 3,
      progressionParams: {
        startPercent: 70,
        incrementPercent: 5,
      },
    };
    const expectedResult = [0, 0, 0];
    expect(percentageProgression(data)).toEqual(expectedResult);
  });
});

describe('Randomized / Property Tests', () => {
  it('should match the percentage formula with rounding for random inputs', () => {
    for (let i = 0; i < 100; i++) {
      const initialWeight = Math.random() * 300 + 20;
      const durationWeeks = Math.floor(Math.random() * 20) + 1;
      const startPercent = Math.random() * 50 + 50;
      const incrementPercent = Math.random() * 5;

      const result = percentageProgression({
        initialWeight,
        durationWeeks,
        progressionParams: { startPercent, incrementPercent },
      });

      expect(result).toHaveLength(durationWeeks);

      const randomWeekIndex = Math.floor(Math.random() * durationWeeks);

      const currentPercent = startPercent + randomWeekIndex * incrementPercent;
      const rawWeight = initialWeight * (currentPercent / 100);
      const expectedWeight = roundToNearest(rawWeight, 2.5);

      expect(result[randomWeekIndex]).toBeCloseTo(expectedWeight, 4);
    }
  });
});

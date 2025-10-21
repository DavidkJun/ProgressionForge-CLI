import { percentageProgression, PercentageParams } from './percentage.js';

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

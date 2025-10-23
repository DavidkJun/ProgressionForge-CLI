import { blockProgression, blockParams } from './block.js';

describe('blockProgression', () => {
  it('should correctly calculate progression over multiple blocks', () => {
    const data: blockParams = {
      initialWeight: 100,
      durationWeeks: 8,
      progressionParams: {
        blockWeeks: 3,
        accumulationCoefficient: 0.025,
        intensificationCoefficient: 0.075,
      },
    };
    const expectedResult = [100, 102.5, 105, 107.5, 115, 122.5, 130, 132.5];
    expect(blockProgression(data)).toEqual(expectedResult);
  });

  it('should correctly truncate the progression mid-block', () => {
    const data: blockParams = {
      initialWeight: 100,
      durationWeeks: 5,
      progressionParams: {
        blockWeeks: 3,
        accumulationCoefficient: 0.025,
        intensificationCoefficient: 0.075,
      },
    };
    const expectedResult = [100, 102.5, 105, 107.5, 115];
    expect(blockProgression(data)).toEqual(expectedResult);
  });

  it('should correctly truncate if duration is less than blockWeeks', () => {
    const data: blockParams = {
      initialWeight: 100,
      durationWeeks: 2,
      progressionParams: {
        blockWeeks: 3,
        accumulationCoefficient: 0.025,
        intensificationCoefficient: 0.075,
      },
    };
    const expectedResult = [100, 102.5];
    expect(blockProgression(data)).toEqual(expectedResult);
  });

  it('should handle exactly one full block', () => {
    const data: blockParams = {
      initialWeight: 100,
      durationWeeks: 3,
      progressionParams: {
        blockWeeks: 3,
        accumulationCoefficient: 0.025,
        intensificationCoefficient: 0.075,
      },
    };
    const expectedResult = [100, 102.5, 105];
    expect(blockProgression(data)).toEqual(expectedResult);
  });

  it('should handle exactly two full blocks', () => {
    const data: blockParams = {
      initialWeight: 100,
      durationWeeks: 6,
      progressionParams: {
        blockWeeks: 3,
        accumulationCoefficient: 0.025,
        intensificationCoefficient: 0.075,
      },
    };
    const expectedResult = [100, 102.5, 105, 107.5, 115, 122.5];
    expect(blockProgression(data)).toEqual(expectedResult);
  });

  it('should handle a 1-week block (alternating)', () => {
    const data: blockParams = {
      initialWeight: 100,
      durationWeeks: 5,
      progressionParams: {
        blockWeeks: 1,
        accumulationCoefficient: 0.01,
        intensificationCoefficient: 0.05,
      },
    };
    const expectedResult = [100, 100, 105, 107.5, 112.5];
    expect(blockProgression(data)).toEqual(expectedResult);
  });

  it('should handle zero coefficients', () => {
    const data: blockParams = {
      initialWeight: 100,
      durationWeeks: 5,
      progressionParams: {
        blockWeeks: 2,
        accumulationCoefficient: 0,
        intensificationCoefficient: 0,
      },
    };
    const expectedResult = [100, 100, 100, 100, 100];
    expect(blockProgression(data)).toEqual(expectedResult);
  });

  it('should handle zero accumulation coefficient', () => {
    const data: blockParams = {
      initialWeight: 100,
      durationWeeks: 5,
      progressionParams: {
        blockWeeks: 2,
        accumulationCoefficient: 0,
        intensificationCoefficient: 0.05,
      },
    };
    const expectedResult = [100, 100, 100, 105, 110];
    expect(blockProgression(data)).toEqual(expectedResult);
  });

  it('should handle zero intensification coefficient', () => {
    const data: blockParams = {
      initialWeight: 100,
      durationWeeks: 5,
      progressionParams: {
        blockWeeks: 2,
        accumulationCoefficient: 0.05,
        intensificationCoefficient: 0,
      },
    };
    const expectedResult = [100, 105, 110, 110, 110];
    expect(blockProgression(data)).toEqual(expectedResult);
  });

  it('should correctly round all values to the nearest 2.5', () => {
    const data: blockParams = {
      initialWeight: 101,
      durationWeeks: 4,
      progressionParams: {
        blockWeeks: 2,
        accumulationCoefficient: 0.011,
        intensificationCoefficient: 0.03,
      },
    };
    const expectedResult = [100, 102.5, 102.5, 107.5];
    expect(blockProgression(data)).toEqual(expectedResult);
  });

  it('should return all zeros if initialWeight is zero', () => {
    const data: blockParams = {
      initialWeight: 0,
      durationWeeks: 4,
      progressionParams: {
        blockWeeks: 2,
        accumulationCoefficient: 0.05,
        intensificationCoefficient: 0.1,
      },
    };
    const expectedResult = [0, 0, 0, 0];
    expect(blockProgression(data)).toEqual(expectedResult);
  });
});

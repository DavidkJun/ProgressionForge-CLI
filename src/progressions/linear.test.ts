import { linearProgression, LinearParams } from './linear.js';

describe('linearProgression', () => {
  it('should return an array with linearly incremented weights for a standard case', () => {
    const data: LinearParams = {
      initialWeight: 100,
      durationWeeks: 4,
      progressionParams: {
        incrementCoefficient: 0.025,
      },
    };
    const expectedResult = [100, 102.5, 105, 107.5];
    expect(linearProgression(data)).toEqual(expectedResult);
  });

  it('should return an array of identical weights if increment coefficient is zero', () => {
    const data: LinearParams = {
      initialWeight: 100,
      durationWeeks: 4,
      progressionParams: {
        incrementCoefficient: 0,
      },
    };
    const expectedResult = [100, 100, 100, 100];
    expect(linearProgression(data)).toEqual(expectedResult);
  });

  it('should correctly handle a single week duration', () => {
    const data: LinearParams = {
      initialWeight: 120,
      durationWeeks: 1,
      progressionParams: {
        incrementCoefficient: 0.05,
      },
    };
    const expectedResult = [120];
    expect(linearProgression(data)).toEqual(expectedResult);
  });

  it('should correctly calculate a descending progression with a negative increment', () => {
    const data: LinearParams = {
      initialWeight: 100,
      durationWeeks: 3,
      progressionParams: {
        incrementCoefficient: -0.05,
      },
    };
    const expectedResult = [100, 95, 90];
    expect(linearProgression(data)).toEqual(expectedResult);
  });
});

import { linearProgression, LinearParams } from './linear.js';

describe('linearProgression', () => {
  it('should return an array with linearly incremented weights for a standard case', () => {
    const data: LinearParams = {
      initialWeight: 100,
      durationWeeks: 4,
      incrementKg: 2.5,
    };
    const expectedResult = [100, 102.5, 105, 107.5];
    expect(linearProgression(data)).toEqual(expectedResult);
  });

  it('should return an array of identical weights if increment is zero', () => {
    const data: LinearParams = {
      initialWeight: 100,
      durationWeeks: 4,
      incrementKg: 0,
    };
    const expectedResult = [100, 100, 100, 100];
    expect(linearProgression(data)).toEqual(expectedResult);
  });

  it('should correctly handle a single week duration', () => {
    const data: LinearParams = {
      initialWeight: 120,
      durationWeeks: 1,
      incrementKg: 5,
    };
    const expectedResult = [120];
    expect(linearProgression(data)).toEqual(expectedResult);
  });

  it('should correctly calculate a descending progression with a negative increment', () => {
    const data: LinearParams = {
      initialWeight: 100,
      durationWeeks: 3,
      incrementKg: -5,
    };
    const expectedResult = [100, 95, 90];
    expect(linearProgression(data)).toEqual(expectedResult);
  });
});

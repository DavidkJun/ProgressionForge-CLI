import { waveProgression, WaveParams } from './wave.js';

describe('waveProgression', () => {
  it('should correctly calculate multiple full "3-up-1-down" cycles (8 weeks)', () => {
    const data: WaveParams = {
      initialWeight: 100,
      durationWeeks: 8,
      progressionParams: {
        weeksUp: 3,
        upCoefficient: 0.05,
        downCoefficient: 0.1,
      },
    };
    const expectedResult = [100, 105, 110, 115, 105, 110, 115, 120];
    expect(waveProgression(data)).toEqual(expectedResult);
  });

  it('should correctly deload on the exact week (duration = weeksUp + 1)', () => {
    const data: WaveParams = {
      initialWeight: 100,
      durationWeeks: 4,
      progressionParams: {
        weeksUp: 3,
        upCoefficient: 0.05,
        downCoefficient: 0.1,
      },
    };
    const expectedResult = [100, 105, 110, 115];
    expect(waveProgression(data)).toEqual(expectedResult);
  });

  it('should correctly truncate a partial second wave', () => {
    const data: WaveParams = {
      initialWeight: 100,
      durationWeeks: 5,
      progressionParams: {
        weeksUp: 3,
        upCoefficient: 0.05,
        downCoefficient: 0.1,
      },
    };
    const expectedResult = [100, 105, 110, 115, 105];
    expect(waveProgression(data)).toEqual(expectedResult);
  });

  it('should truncate correctly if duration is shorter than "weeksUp"', () => {
    const data: WaveParams = {
      initialWeight: 100,
      durationWeeks: 2,
      progressionParams: {
        weeksUp: 3,
        upCoefficient: 0.05,
        downCoefficient: 0.1,
      },
    };
    const expectedResult = [100, 105];
    expect(waveProgression(data)).toEqual(expectedResult);
  });

  it('should handle a "1-up-1-down" cycle', () => {
    const data: WaveParams = {
      initialWeight: 100,
      durationWeeks: 4,
      progressionParams: {
        weeksUp: 1,
        upCoefficient: 0.05,
        downCoefficient: 0.1,
      },
    };
    const expectedResult = [100, 105, 95, 100];
    expect(waveProgression(data)).toEqual(expectedResult);
  });

  it('should handle a "0-up-1-down" cycle (permanent deload)', () => {
    const data: WaveParams = {
      initialWeight: 100,
      durationWeeks: 3,
      progressionParams: {
        weeksUp: 0,
        upCoefficient: 0.05,
        downCoefficient: 0.1,
      },
    };
    const expectedResult = [100, 90, 80];
    expect(waveProgression(data)).toEqual(expectedResult);
  });

  it('should handle a zero upCoefficient (plateau and deload)', () => {
    const data: WaveParams = {
      initialWeight: 100,
      durationWeeks: 5,
      progressionParams: {
        weeksUp: 3,
        upCoefficient: 0,
        downCoefficient: 0.1,
      },
    };
    const expectedResult = [100, 100, 100, 100, 90];
    expect(waveProgression(data)).toEqual(expectedResult);
  });

  it('should handle a zero downCoefficient (climb and plateau)', () => {
    const data: WaveParams = {
      initialWeight: 100,
      durationWeeks: 5,
      progressionParams: {
        weeksUp: 3,
        upCoefficient: 0.05,
        downCoefficient: 0,
      },
    };
    const expectedResult = [100, 105, 110, 115, 115];
    expect(waveProgression(data)).toEqual(expectedResult);
  });

  it('should return all zeros if initialWeight is zero', () => {
    const data: WaveParams = {
      initialWeight: 0,
      durationWeeks: 4,
      progressionParams: {
        weeksUp: 3,
        upCoefficient: 0.05,
        downCoefficient: 0.1,
      },
    };
    const expectedResult = [0, 0, 0, 0];
    expect(waveProgression(data)).toEqual(expectedResult);
  });

  it('should correctly round all values to the nearest 2.5', () => {
    const data: WaveParams = {
      initialWeight: 101,
      durationWeeks: 4,
      progressionParams: {
        weeksUp: 2,
        upCoefficient: 0.011,
        downCoefficient: 0.04,
      },
    };
    const expectedResult = [100, 102.5, 102.5, 100];
    expect(waveProgression(data)).toEqual(expectedResult);
  });
});

describe('Randomized Logic Checks', () => {
  it('should strictly follow the UP/DOWN pattern', () => {
    for (let i = 0; i < 100; i++) {
      const initialWeight = 100;
      const durationWeeks = Math.floor(Math.random() * 30) + 5;
      const weeksUp = Math.floor(Math.random() * 4) + 1;
      const upCoeff = 0.05;
      const downCoeff = 0.025;

      const result = waveProgression({
        initialWeight,
        durationWeeks,
        progressionParams: {
          weeksUp,
          upCoefficient: upCoeff,
          downCoefficient: downCoeff,
        },
      });

      for (let w = 1; w < result.length; w++) {
        const prevWeight = result[w - 1]!;
        const currWeight = result[w]!;
        const cyclePosition = w % (weeksUp + 1);

        if (cyclePosition === 0) {
          expect(currWeight).toBeLessThanOrEqual(prevWeight);
        } else {
          expect(currWeight).toBeGreaterThanOrEqual(prevWeight);
        }
      }
    }
  });
});

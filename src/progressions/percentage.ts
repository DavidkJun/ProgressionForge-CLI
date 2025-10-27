import { roundToNearest } from '../utils/math.js';

export interface PercentageProgressionParams {
  startPercent: number;
  incrementPercent: number;
}

export interface PercentageParams {
  initialWeight: number;
  durationWeeks: number;
  progressionParams: PercentageProgressionParams;
}

export const percentageProgression = (params: PercentageParams): number[] => {
  const { initialWeight, durationWeeks, progressionParams } = params;
  const { startPercent, incrementPercent } = progressionParams;

  const weeklyWeights: number[] = [];

  for (let i = 0; i < durationWeeks; i++) {
    const currentPercent = startPercent + i * incrementPercent;
    const calculatedWeight = initialWeight * (currentPercent / 100);
    const roundedWeight = roundToNearest(calculatedWeight, 2.5);
    weeklyWeights.push(roundedWeight);
  }

  return weeklyWeights;
};

export const linearProgression = (params: LinearParams): number[] => {
  const { initialWeight, durationWeeks, progressionParams } = params;
  const { incrementCoefficient } = progressionParams;
  const weeklyWeights = [];
  let currentWeight = params.initialWeight;
  const incrementKg = initialWeight * incrementCoefficient;
  for (let i = 0; i < durationWeeks; i++) {
    weeklyWeights.push(currentWeight);
    currentWeight += incrementKg;
  }
  return weeklyWeights;
};

export interface LinearParams {
  initialWeight: number;
  durationWeeks: number;
  progressionParams: LinearProgressionParams;
}

export interface LinearProgressionParams {
  incrementCoefficient: number;
}

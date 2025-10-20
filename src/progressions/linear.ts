export const linearProgression = (params: LinearParams) => {
  const weeklyWeights = [];
  let currentWeight = params.initialWeight;
  for (let i = 0; i < params.durationWeeks; i++) {
    weeklyWeights.push(currentWeight);
    currentWeight += params.incrementKg;
  }
  return weeklyWeights;
};

export interface LinearParams {
  initialWeight: number;
  durationWeeks: number;
  incrementKg: number;
}

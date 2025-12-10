export const linearProgression = (params) => {
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
//# sourceMappingURL=linear.js.map
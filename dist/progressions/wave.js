import { roundToNearest } from '../utils/math.js';
export const waveProgression = (params) => {
    const { initialWeight, durationWeeks, progressionParams } = params;
    const { weeksUp, upCoefficient, downCoefficient } = progressionParams;
    const weeklyWeights = [];
    let currentWeight = initialWeight;
    let upWeekCounter = 0;
    const upStepKg = initialWeight * upCoefficient;
    const downStepKg = initialWeight * downCoefficient;
    for (let i = 0; i < durationWeeks; i++) {
        weeklyWeights.push(roundToNearest(currentWeight, 2.5));
        if (upWeekCounter < weeksUp) {
            currentWeight += upStepKg;
            upWeekCounter++;
        }
        else {
            upWeekCounter = 0;
            currentWeight -= downStepKg;
        }
    }
    return weeklyWeights;
};
//# sourceMappingURL=wave.js.map
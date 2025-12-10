import { roundToNearest } from '../utils/math.js';
export const percentageProgression = (params) => {
    const { initialWeight, durationWeeks, progressionParams } = params;
    const { startPercent, incrementPercent } = progressionParams;
    const weeklyWeights = [];
    for (let i = 0; i < durationWeeks; i++) {
        const currentPercent = startPercent + i * incrementPercent;
        const calculatedWeight = initialWeight * (currentPercent / 100);
        const roundedWeight = roundToNearest(calculatedWeight, 2.5);
        weeklyWeights.push(roundedWeight);
    }
    return weeklyWeights;
};
//# sourceMappingURL=percentage.js.map
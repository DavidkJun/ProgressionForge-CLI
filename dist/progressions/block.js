import { roundToNearest } from '../utils/math.js';
export const blockProgression = (params) => {
    const { initialWeight, durationWeeks, progressionParams } = params;
    const { accumulationCoefficient, intensificationCoefficient, blockWeeks } = progressionParams;
    const weeklyWeights = [];
    let currentWeight = initialWeight;
    let weekInBlockCounter = 0;
    let currentBlock = 'accumulation';
    const accumulationStepKg = accumulationCoefficient * initialWeight;
    const intensificationStepKg = intensificationCoefficient * initialWeight;
    for (let i = 0; i < durationWeeks; i++) {
        weeklyWeights.push(roundToNearest(currentWeight, 2.5));
        if (weekInBlockCounter === blockWeeks && currentBlock === 'accumulation') {
            currentBlock = 'intensification';
            weekInBlockCounter = 0;
        }
        else if (weekInBlockCounter === blockWeeks) {
            currentBlock = 'accumulation';
            weekInBlockCounter = 0;
        }
        if (currentBlock === 'intensification') {
            currentWeight += intensificationStepKg;
        }
        else {
            currentWeight += accumulationStepKg;
        }
        weekInBlockCounter++;
    }
    return weeklyWeights;
};
//# sourceMappingURL=block.js.map
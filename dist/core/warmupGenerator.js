import { roundToNearest } from '../utils/math.js';
export const getStandardWarmup = (workingWeight) => {
    const warmup = [];
    let currentReps = 8;
    const weightStep = 0.15;
    let currentWeight = workingWeight * 0.6;
    const repsStep = 2;
    for (let i = 0; i < 3; i++) {
        warmup.push({
            weightKg: roundToNearest(currentWeight, 2.5),
            reps: currentReps,
        });
        currentWeight += currentWeight * weightStep;
        currentReps -= repsStep;
    }
    return warmup;
};
export const getUpperBodyPreset = () => {
    return [
        {
            exercise: 'Scapular Pulls / Scapular Push-ups',
            sets: 2,
            reps: 10,
        },
        {
            exercise: 'Band Pull-Aparts',
            sets: 2,
            reps: 15,
        },
    ];
};
export const getLowerBodyPreset = () => {
    return [
        {
            exercise: 'Bodyweight Squats (partial reps)',
            sets: 2,
            reps: 15,
        },
        {
            exercise: 'Knees circular swings',
            sets: 2,
            reps: 10,
        },
    ];
};
export const WARMUP_CALCULATORS = {
    standard: getStandardWarmup,
};
export const WARMUP_PRESETS = {
    'upper-body': getUpperBodyPreset,
    'lower-body': getLowerBodyPreset,
};
//# sourceMappingURL=warmupGenerator.js.map
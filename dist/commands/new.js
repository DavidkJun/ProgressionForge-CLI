import inquirer from 'inquirer';
import { planExists, savePlan } from '../storage/storageManager.js';
import { PROGRESSION_MODELS, } from '../progressions/index.js';
import { WARMUP_CALCULATORS, WARMUP_PRESETS } from '../core/warmupGenerator.js';
import { validateFloat, validateNonEmptyString, validatePositiveNumber, validatePositiveInteger, validateDuration, } from '../utils/validators.js';
const promptForWarmupStep = async () => {
    const { stepType } = await inquirer.prompt([
        {
            type: 'list',
            name: 'stepType',
            message: 'What type of warmup step to add?',
            choices: [
                'Weight-based (e.g., 40kg x 5)',
                'Exercise-based (e.g., Pull-ups)',
            ],
        },
    ]);
    if (stepType === 'Weight-based (e.g., 40kg x 5)') {
        const { weightKg, reps } = await inquirer.prompt([
            {
                type: 'input',
                name: 'weightKg',
                message: 'Warmup weight (kg):',
                validate: validateFloat,
                filter: Number,
            },
            {
                type: 'number',
                name: 'reps',
                message: 'Warmup reps:',
                validate: validatePositiveNumber,
            },
        ]);
        return { weightKg: weightKg, reps: reps };
    }
    const answers = await inquirer.prompt([
        {
            type: 'input',
            name: 'exercise',
            message: 'Warmup exercise name:',
            validate: validateNonEmptyString,
        },
        {
            type: 'number',
            name: 'sets',
            message: 'Warmup sets (optional):',
            default: undefined,
        },
        {
            type: 'number',
            name: 'reps',
            message: 'Warmup reps (optional):',
            default: undefined,
        },
    ]);
    const step = { exercise: answers.exercise };
    if (answers.sets)
        step.sets = answers.sets;
    if (answers.reps)
        step.reps = answers.reps;
    return step;
};
const promptForCustomWarmupLoop = async () => {
    const warmupSteps = [];
    let addAnotherWarmupStep = true;
    while (addAnotherWarmupStep) {
        const newStep = await promptForWarmupStep();
        warmupSteps.push(newStep);
        const { addMore } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'addMore',
                message: 'Add another warmup step?',
                default: false,
            },
        ]);
        addAnotherWarmupStep = addMore;
    }
    return warmupSteps;
};
const promptForProgressionParams = async (model) => {
    if (model === 'linear') {
        return inquirer.prompt([
            {
                type: 'input',
                name: 'incrementCoefficient',
                message: 'Enter linear increment coefficient (e.g., 0.025):',
                default: 0.025,
                validate: validateFloat,
                filter: Number,
            },
        ]);
    }
    if (model === 'percentage') {
        return inquirer.prompt([
            {
                type: 'input',
                name: 'startPercent',
                message: 'Enter starting percentage (e.g., 70):',
                default: 70,
                validate: validateFloat,
                filter: Number,
            },
            {
                type: 'input',
                name: 'incrementPercent',
                message: 'Enter weekly percentage increment (e.g., 5):',
                default: 5,
                validate: validateFloat,
                filter: Number,
            },
        ]);
    }
    if (model === 'wave') {
        return inquirer.prompt([
            {
                type: 'number',
                name: 'weeksUp',
                message: 'Enter number of "weeks up" (e.g., 2):',
                default: 2,
                validate: validatePositiveInteger,
            },
            {
                type: 'input',
                name: 'upCoefficient',
                message: 'Enter the "up" coefficient (e.g., 0.01):',
                default: 0.01,
                validate: validateFloat,
                filter: Number,
            },
            {
                type: 'input',
                name: 'downCoefficient',
                message: 'Enter the "down" coefficient (e.g., 0.01):',
                default: 0.01,
                validate: validateFloat,
                filter: Number,
            },
        ]);
    }
    if (model === 'block') {
        return inquirer.prompt([
            {
                type: 'input',
                name: 'accumulationCoefficient',
                message: 'Enter accumulation coefficient (e.g., 0.05):',
                default: 0.05,
                validate: validateFloat,
                filter: Number,
            },
            {
                type: 'input',
                name: 'intensificationCoefficient',
                message: 'Enter intensification coefficient (e.g., 0.1):',
                default: 0.1,
                validate: validateFloat,
                filter: Number,
            },
            {
                type: 'number',
                name: 'blockWeeks',
                message: 'Enter duration of one block (e.g., 3 weeks):',
                default: 3,
                validate: validatePositiveInteger,
            },
        ]);
    }
    return {};
};
const promptForWarmup = async (exerciseType, initialWorkingWeight) => {
    if (exerciseType === 'weight') {
        const { warmupType } = await inquirer.prompt([
            {
                type: 'list',
                name: 'warmupType',
                message: 'Choose warmup type:',
                choices: [
                    { name: 'Custom (Enter manually)', value: 'custom' },
                    { name: 'Calculated: Standard Ramp', value: 'standard' },
                ],
            },
        ]);
        if (warmupType === 'custom') {
            return promptForCustomWarmupLoop();
        }
        if (warmupType === 'standard') {
            return WARMUP_CALCULATORS.standard(initialWorkingWeight);
        }
    }
    else {
        const { movementType } = await inquirer.prompt([
            {
                type: 'list',
                name: 'movementType',
                message: 'What type of bodyweight movement is this?',
                choices: [
                    {
                        name: 'Upper Body (e.g., Pull-ups, Push-ups)',
                        value: 'upper-body',
                    },
                    { name: 'Lower Body (e.g., Pistol Squats)', value: 'lower-body' },
                ],
            },
        ]);
        const { warmupType } = await inquirer.prompt([
            {
                type: 'list',
                name: 'warmupType',
                message: 'Choose warmup type:',
                choices: [
                    { name: 'Custom (Enter manually)', value: 'custom' },
                    { name: `Preset: ${movementType}`, value: 'preset' },
                ],
            },
        ]);
        if (warmupType === 'custom') {
            return promptForCustomWarmupLoop();
        }
        if (warmupType === 'preset') {
            if (movementType === 'upper-body') {
                return WARMUP_PRESETS['upper-body']();
            }
            else {
                return WARMUP_PRESETS['lower-body']();
            }
        }
    }
    return [];
};
export const promptForExercise = async (planBodyWeightKg) => {
    const baseAnswers = await inquirer.prompt([
        {
            type: 'input',
            name: 'name',
            message: 'Name the exercise you want to add:',
            validate: validateNonEmptyString,
        },
        {
            type: 'list',
            name: 'type',
            message: 'Is this a bodyweight or a weighted exercise?',
            choices: ['bodyweight', 'weight'],
        },
        {
            type: 'number',
            name: 'sets',
            message: "What's the amount of sets you want to have?",
            validate: validatePositiveNumber,
        },
        {
            type: 'number',
            name: 'reps',
            message: "What's the amount of reps you want to have?",
            validate: validatePositiveNumber,
        },
        {
            type: 'list',
            name: 'progressionModel',
            message: 'What type of progression you want to choose?',
            choices: PROGRESSION_MODELS,
        },
    ]);
    let startCoefficient;
    let initialWorkingWeight;
    if (baseAnswers.type === 'weight') {
        const { startWeight } = await inquirer.prompt([
            {
                type: 'input',
                name: 'startWeight',
                message: 'What is your starting working weight (in kg) for this exercise?',
                validate: validateFloat,
                filter: Number,
            },
        ]);
        startCoefficient = startWeight;
        initialWorkingWeight = startWeight;
    }
    else {
        const { coeff } = await inquirer.prompt([
            {
                type: 'input',
                name: 'coeff',
                message: 'Enter starting coefficient (e.g., 1.0 for 100% bodyweight):',
                default: 1.0,
                validate: validateFloat,
                filter: Number,
            },
        ]);
        startCoefficient = coeff;
        initialWorkingWeight = planBodyWeightKg * startCoefficient;
    }
    const progressionParams = await promptForProgressionParams(baseAnswers.progressionModel);
    const warmup = await promptForWarmup(baseAnswers.type, initialWorkingWeight);
    console.log(`Exercise ${baseAnswers.name} has been added.`);
    return {
        name: baseAnswers.name,
        type: baseAnswers.type,
        sets: baseAnswers.sets,
        reps: baseAnswers.reps,
        progressionModel: baseAnswers.progressionModel,
        startCoefficient,
        progressionParams,
        warmup,
    };
};
export const handleNew = async (planName) => {
    try {
        if (await planExists(planName)) {
            console.error(`Error: Plan with name "${planName}" already exists.`);
            return;
        }
        const planAnswers = await inquirer.prompt([
            {
                type: 'number',
                name: 'durationWeeks',
                message: "What's the duration of your training plan in weeks?",
                validate: validateDuration,
            },
            {
                type: 'input',
                name: 'bodyWeightKg',
                message: 'What is your bodyweight in kg?',
                validate: validateFloat,
                filter: Number,
            },
        ]);
        const exercises = [];
        let addAnotherExercise = true;
        while (addAnotherExercise) {
            const newExercise = await promptForExercise(planAnswers.bodyWeightKg);
            exercises.push(newExercise);
            const confirmAdd = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'addMore',
                    message: 'Do you want to add another exercise?',
                    default: true,
                },
            ]);
            addAnotherExercise = confirmAdd.addMore;
        }
        const finalRecipe = {
            planName,
            durationWeeks: planAnswers.durationWeeks,
            bodyWeightKg: planAnswers.bodyWeightKg,
            exercises,
        };
        await savePlan(planName, finalRecipe);
        console.log(`\nSuccess! Your plan "${planName}" has been created.`);
        console.log(`You can find it at: ~/.progression-forge/plans/${planName}.json`);
    }
    catch (error) {
        if (typeof error === 'object' && error !== null && 'isTtyError' in error) {
            console.log('\nPlan creation cancelled.');
        }
        else {
            console.error('An unexpected error occurred:', error);
        }
    }
};
//# sourceMappingURL=new.js.map
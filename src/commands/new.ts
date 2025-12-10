import inquirer from 'inquirer';
import { planExists, savePlan } from '../storage/storageManager.js';
import { PlanRecipe, ExerciseRecipe, WarmupStep } from '../models/types.js';
import {
  PROGRESSION_MODELS,
  ProgressionParams,
} from '../progressions/index.js';

import { LinearProgressionParams } from '../progressions/linear.js';
import { PercentageProgressionParams } from '../progressions/percentage.js';
import { WaveProgressionParams } from '../progressions/wave.js';
import { BlockProgressionParams } from '../progressions/block.js';

import { WARMUP_CALCULATORS, WARMUP_PRESETS } from '../core/warmupGenerator.js';

import {
  validateFloat,
  validateNonEmptyString,
  validatePositiveNumber,
  validatePositiveInteger,
  validateDuration,
} from '../utils/validators.js';

const promptForWarmupStep = async (): Promise<WarmupStep> => {
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
    return { weightKg: weightKg as number, reps: reps as number };
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

  const step: WarmupStep = { exercise: answers.exercise as string };
  if (answers.sets) step.sets = answers.sets;
  if (answers.reps) step.reps = answers.reps;

  return step;
};

const promptForCustomWarmupLoop = async (): Promise<WarmupStep[]> => {
  const warmupSteps: WarmupStep[] = [];
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

const promptForProgressionParams = async (
  model: string
): Promise<ProgressionParams> => {
  if (model === 'linear') {
    return inquirer.prompt<LinearProgressionParams>([
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
    return inquirer.prompt<PercentageProgressionParams>([
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
    return inquirer.prompt<WaveProgressionParams>([
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
    return inquirer.prompt<BlockProgressionParams>([
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
  return {} as ProgressionParams;
};

const promptForWarmup = async (
  exerciseType: 'weight' | 'bodyweight',
  initialWorkingWeight: number
): Promise<WarmupStep[]> => {
  if (exerciseType === 'weight') {
    const { warmupType } = await inquirer.prompt<{
      warmupType: 'custom' | 'standard';
    }>([
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
  } else {
    const { movementType } = await inquirer.prompt<{
      movementType: 'upper-body' | 'lower-body';
    }>([
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

    const { warmupType } = await inquirer.prompt<{
      warmupType: 'custom' | 'preset';
    }>([
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
      } else {
        return WARMUP_PRESETS['lower-body']();
      }
    }
  }
  return [];
};

export const promptForExercise = async (
  planBodyWeightKg: number
): Promise<ExerciseRecipe> => {
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

  let startCoefficient: number;
  let initialWorkingWeight: number;

  if (baseAnswers.type === 'weight') {
    const { startWeight } = await inquirer.prompt([
      {
        type: 'input',
        name: 'startWeight',
        message:
          'What is your starting working weight (in kg) for this exercise?',
        validate: validateFloat,
        filter: Number,
      },
    ]);
    startCoefficient = startWeight as number;
    initialWorkingWeight = startWeight as number;
  } else {
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
    startCoefficient = coeff as number;
    initialWorkingWeight = planBodyWeightKg * startCoefficient;
  }

  const progressionParams = await promptForProgressionParams(
    baseAnswers.progressionModel as string
  );

  const warmup = await promptForWarmup(
    baseAnswers.type as 'weight' | 'bodyweight',
    initialWorkingWeight
  );

  console.log(`Exercise ${baseAnswers.name} has been added.`);

  return {
    name: baseAnswers.name as string,
    type: baseAnswers.type as 'weight' | 'bodyweight',
    sets: baseAnswers.sets as number,
    reps: baseAnswers.reps as number,
    progressionModel: baseAnswers.progressionModel,
    startCoefficient,
    progressionParams,
    warmup,
  };
};

export const handleNew = async (planName: string) => {
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

    const exercises: ExerciseRecipe[] = [];
    let addAnotherExercise = true;

    while (addAnotherExercise) {
      const newExercise = await promptForExercise(
        planAnswers.bodyWeightKg as number
      );
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

    const finalRecipe: PlanRecipe = {
      planName,
      durationWeeks: planAnswers.durationWeeks as number,
      bodyWeightKg: planAnswers.bodyWeightKg as number,
      exercises,
    };

    await savePlan(planName, finalRecipe);

    console.log(`\nSuccess! Your plan "${planName}" has been created.`);
    console.log(
      `You can find it at: ~/.progression-forge/plans/${planName}.json`
    );
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'isTtyError' in error) {
      console.log('\nPlan creation cancelled.');
    } else {
      console.error('An unexpected error occurred:', error);
    }
  }
};

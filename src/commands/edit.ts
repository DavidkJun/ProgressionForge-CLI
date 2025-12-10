import inquirer from 'inquirer';
import { loadPlan, savePlan, planExists } from '../storage/storageManager.js';
import { PlanRecipe, ExerciseRecipe } from '../models/types.js';
import { promptForExercise } from './new.js';
import {
  validateFloat,
  validateNonEmptyString,
  validatePositiveNumber,
  validatePositiveInteger,
} from '../utils/validators.js';

const editSingleExercise = async (
  exercise: ExerciseRecipe
): Promise<ExerciseRecipe> => {
  let editing = true;
  const updatedExercise = { ...exercise };

  while (editing) {
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: `Editing exercise: ${updatedExercise.name}`,
        choices: [
          'Edit Name',
          'Edit Type (Bodyweight/Weight)',
          'Edit Sets & Reps',
          'Edit Start Coefficient',
          'Back to Exercises List',
        ],
      },
    ]);

    switch (action) {
      case 'Edit Name': {
        const { newName } = await inquirer.prompt([
          {
            type: 'input',
            name: 'newName',
            message: 'Enter new name:',
            default: updatedExercise.name,
            validate: validateNonEmptyString,
          },
        ]);
        updatedExercise.name = newName;
        break;
      }
      case 'Edit Type (Bodyweight/Weight)': {
        const { newType } = await inquirer.prompt([
          {
            type: 'list',
            name: 'newType',
            message: 'Select type:',
            default: updatedExercise.type,
            choices: ['bodyweight', 'weight'],
          },
        ]);
        updatedExercise.type = newType;
        break;
      }
      case 'Edit Sets & Reps': {
        const answers = await inquirer.prompt([
          {
            type: 'number',
            name: 'newSets',
            message: 'Enter sets:',
            default: updatedExercise.sets,
            validate: validatePositiveNumber,
          },
          {
            type: 'number',
            name: 'newReps',
            message: 'Enter reps:',
            default: updatedExercise.reps,
            validate: validatePositiveNumber,
          },
        ]);
        updatedExercise.sets = answers.newSets;
        updatedExercise.reps = answers.newReps;
        break;
      }
      case 'Edit Start Coefficient': {
        const { newCoeff } = await inquirer.prompt([
          {
            type: 'input',
            name: 'newCoeff',
            message: 'Enter start coefficient (e.g. 1.0 or weight in kg):',
            default: updatedExercise.startCoefficient,
            validate: validateFloat,
            filter: Number,
          },
        ]);
        updatedExercise.startCoefficient = newCoeff;
        break;
      }
      case 'Back to Exercises List': {
        editing = false;
        break;
      }
    }
  }

  return updatedExercise;
};

const manageExercises = async (recipe: PlanRecipe): Promise<void> => {
  let managing = true;

  while (managing) {
    const choices = [
      'Add a new exercise',
      new inquirer.Separator(),
      ...recipe.exercises.map((ex) => `Edit: ${ex.name}`),
      new inquirer.Separator(),
      ...recipe.exercises.map((ex) => `Delete: ${ex.name}`),
      new inquirer.Separator(),
      'Back to Main Menu',
    ];

    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'Manage Exercises:',
        choices,
        pageSize: 15,
      },
    ]);

    if (action === 'Add a new exercise') {
      const newExercise = await promptForExercise(recipe.bodyWeightKg);
      recipe.exercises.push(newExercise);
      console.log('Exercise added.');
    } else if (action === 'Back to Main Menu') {
      managing = false;
    } else if (action.startsWith('Edit: ')) {
      const exName = action.replace('Edit: ', '');
      const index = recipe.exercises.findIndex((e) => e.name === exName);
      if (index !== -1) {
        recipe.exercises[index] = await editSingleExercise(
          recipe.exercises[index]!
        );
      }
    } else if (action.startsWith('Delete: ')) {
      const exName = action.replace('Delete: ', '');
      const { confirm } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: `Are you sure you want to delete "${exName}"?`,
          default: false,
        },
      ]);

      if (confirm) {
        recipe.exercises = recipe.exercises.filter((e) => e.name !== exName);
        console.log(`Exercise "${exName}" removed.`);
      }
    }
  }
};

export const handleEdit = async (planName: string): Promise<void> => {
  try {
    if (!(await planExists(planName))) {
      console.error(`Error: Plan "${planName}" does not exist.`);
      return;
    }

    console.log(`Loading plan "${planName}"...`);
    const recipe = (await loadPlan(planName)) as PlanRecipe;

    let editingPlan = true;

    while (editingPlan) {
      const { mainAction } = await inquirer.prompt([
        {
          type: 'list',
          name: 'mainAction',
          message: `Editing Plan: ${recipe.planName}`,
          choices: [
            'Edit Plan Details (Duration, Bodyweight)',
            'Manage Exercises',
            'Save & Exit',
            'Exit without Saving',
          ],
        },
      ]);

      switch (mainAction) {
        case 'Edit Plan Details (Duration, Bodyweight)': {
          const answers = await inquirer.prompt([
            {
              type: 'number',
              name: 'durationWeeks',
              message: 'Duration in weeks:',
              default: recipe.durationWeeks,
              validate: validatePositiveInteger,
            },
            {
              type: 'input',
              name: 'bodyWeightKg',
              message: 'Bodyweight (kg):',
              default: recipe.bodyWeightKg,
              validate: validateFloat,
              filter: Number,
            },
          ]);
          recipe.durationWeeks = answers.durationWeeks;
          recipe.bodyWeightKg = answers.bodyWeightKg;
          console.log('Plan details updated.');
          break;
        }

        case 'Manage Exercises': {
          await manageExercises(recipe);
          break;
        }

        case 'Save & Exit': {
          await savePlan(planName, recipe);
          console.log(`Plan "${planName}" successfully saved.`);
          editingPlan = false;
          break;
        }

        case 'Exit without Saving': {
          const { confirmExit } = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'confirmExit',
              message: 'Are you sure? Unsaved changes will be lost.',
              default: false,
            },
          ]);
          if (confirmExit) {
            editingPlan = false;
          }
          break;
        }
      }
    }
  } catch (error) {
    console.error('An error occurred while editing:', error);
  }
};

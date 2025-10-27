import {
  PlanRecipe,
  TrainingPlan,
  FinalExercise,
  WorkingSets,
  ExerciseRecipe,
} from '../models/types.js';
import { progressionRegistry } from '../progressions/index.js';

export const generatePlan = (recipe: PlanRecipe): TrainingPlan => {
  const finalPlan: TrainingPlan = {
    planName: recipe.planName,
    durationWeeks: recipe.durationWeeks,
    weeklyBreakdown: [],
  };
  for (let i = 0; i < recipe.durationWeeks; i++) {
    const currentWeekExercises: FinalExercise[] = [];
    for (const exercise of recipe.exercises as ExerciseRecipe[]) {
      const initialWeight = recipe.bodyWeightKg * exercise.startCoefficient;
      const progression = progressionRegistry[exercise.progressionModel];
      const params = {
        initialWeight: initialWeight,
        durationWeeks: recipe.durationWeeks,
        progressionParams: exercise.progressionParams,
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const allWeeklyWeights: number[] = progression(params as any);
      const currentWeekWeight = allWeeklyWeights[i]!;
      const workingSets: WorkingSets = {
        sets: exercise.sets,
        reps: exercise.reps,
        weightKg: currentWeekWeight,
      };
      const finalExercise: FinalExercise = {
        name: exercise.name,
        type: exercise.type,
        warmup: exercise.warmup,
        workingSets: workingSets,
      };
      currentWeekExercises.push(finalExercise);
    }
    finalPlan.weeklyBreakdown.push({
      week: i + 1,
      exercises: currentWeekExercises,
    });
  }
  return finalPlan;
};

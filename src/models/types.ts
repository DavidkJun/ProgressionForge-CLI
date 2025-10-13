export interface Exercise {
  name: string;
  type: 'bodyweight' | 'weight';
  reps: number;
  sets: number;
  startCoefficient: number;
  progressionModel: 'linear' | 'percentage' | 'wave' | 'block';
  progressionParams: ProgressionParams;
}

export interface ProgressionParams {
  incrementCoefficient: number;
}

export interface PlanRecipe {
  planName: string;
  durationWeeks: number;
  bodyWeightKg: number;
  exercises: Exercise[];
}

import { ProgressionParams } from '../progressions/index.js';
export type WarmupStep = {
    exercise: string;
    sets?: number;
    reps?: number;
} | {
    weightKg: number;
    reps: number;
};
export interface ExerciseRecipe {
    name: string;
    type: 'bodyweight' | 'weight';
    sets: number;
    reps: number;
    startCoefficient: number;
    progressionModel: 'linear' | 'percentage' | 'wave' | 'block';
    progressionParams: ProgressionParams;
    warmup: WarmupStep[];
}
export interface PlanRecipe {
    planName: string;
    durationWeeks: number;
    bodyWeightKg: number;
    exercises: ExerciseRecipe[];
}
export interface WorkingSets {
    sets: number;
    reps: number;
    weightKg: number;
}
export interface FinalExercise {
    name: string;
    type: 'bodyweight' | 'weight';
    workingSets: WorkingSets;
    warmup: WarmupStep[];
}
export interface WeeklyBreakdown {
    week: number;
    exercises: FinalExercise[];
}
export interface TrainingPlan {
    planName: string;
    durationWeeks: number;
    weeklyBreakdown: WeeklyBreakdown[];
}
//# sourceMappingURL=types.d.ts.map
import { TrainingPlan, WarmupStep } from '../models/types.js';

const formatWarmupStep = (step: WarmupStep): string => {
  if ('weightKg' in step) {
    return `${step.weightKg} kg x ${step.reps} reps`;
  }

  let details = '';
  if (step.sets) details += `${step.sets} sets `;
  if (step.reps) details += `x ${step.reps} reps `;

  return `${step.exercise} ${details.trim()}`;
};

export const printPlan = (plan: TrainingPlan): void => {
  console.log('========================================');
  console.log(`PLAN: ${plan.planName}`);
  console.log(`Duration: ${plan.durationWeeks} weeks`);
  console.log('========================================');

  plan.weeklyBreakdown.forEach((week) => {
    console.log(`\n--- Week ${week.week} ---`);

    week.exercises.forEach((exercise) => {
      const { name, workingSets } = exercise;
      const { sets, reps, weightKg } = workingSets;

      console.log(`  **${name} (${sets} x ${reps} @ ${weightKg} kg)**`);

      if (exercise.warmup && exercise.warmup.length > 0) {
        exercise.warmup.forEach((step) => {
          console.log(`    Warmup: ${formatWarmupStep(step)}`);
        });
      }
    });
  });
};

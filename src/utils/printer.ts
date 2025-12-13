import { TrainingPlan, WarmupStep } from '../models/types.js';

const formatNumber = (num: number): number => {
  return parseFloat(num.toFixed(2));
};

const formatWarmupStep = (step: WarmupStep): string => {
  if ('weightKg' in step) {
    return `${formatNumber(step.weightKg)} kg × ${step.reps} reps`;
  }

  let details = '';
  if (step.sets) details += `${step.sets} sets `;
  if (step.reps) details += `× ${step.reps} reps `;

  return details ? `${step.exercise} (${details.trim()})` : step.exercise;
};

export const printPlan = (plan: TrainingPlan): void => {
  console.log(`# 🏋️ Training Plan: ${plan.planName}`);
  console.log(`**Duration:** ${plan.durationWeeks} weeks`);
  console.log(`\n---`);

  plan.weeklyBreakdown.forEach((week) => {
    console.log(`\n## 🗓️ Week ${week.week}`);

    week.exercises.forEach((exercise) => {
      const { name, workingSets } = exercise;
      const { sets, reps, weightKg } = workingSets;

      console.log(`\n### ${name}`);

      if (exercise.warmup && exercise.warmup.length > 0) {
        console.log(`* **Warm-up:**`);
        exercise.warmup.forEach((step) => {
          console.log(`  * ${formatWarmupStep(step)}`);
        });
      }

      console.log(
        `> **Working Sets:** ${sets} sets × ${reps} reps @ **${formatNumber(
          weightKg
        )} kg**`
      );
    });

    console.log(`\n---`);
  });
};

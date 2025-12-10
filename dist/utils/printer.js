// Хелпер для красивого форматування чисел (прибирає зайві нулі після коми)
// 100.00 -> 100
// 116.39999 -> 116.4
const formatNumber = (num) => {
    return parseFloat(num.toFixed(2));
};
const formatWarmupStep = (step) => {
    if ('weightKg' in step) {
        return `${formatNumber(step.weightKg)} kg × ${step.reps} reps`;
    }
    let details = '';
    if (step.sets)
        details += `${step.sets} sets `;
    if (step.reps)
        details += `× ${step.reps} reps `;
    return details ? `${step.exercise} (${details.trim()})` : step.exercise;
};
export const printPlan = (plan) => {
    // Заголовок H1
    console.log(`# 🏋️ Training Plan: ${plan.planName}`);
    console.log(`**Duration:** ${plan.durationWeeks} weeks`);
    console.log(`\n---`);
    plan.weeklyBreakdown.forEach((week) => {
        // Заголовок тижня H2
        console.log(`\n## 🗓️ Week ${week.week}`);
        week.exercises.forEach((exercise) => {
            const { name, workingSets } = exercise;
            const { sets, reps, weightKg } = workingSets;
            // Назва вправи H3
            console.log(`\n### ${name}`);
            // Розминка (списком)
            if (exercise.warmup && exercise.warmup.length > 0) {
                console.log(`* **Warm-up:**`);
                exercise.warmup.forEach((step) => {
                    console.log(`  * ${formatWarmupStep(step)}`);
                });
            }
            // Робоча вага (цитатою для акценту)
            console.log(`> **Working Sets:** ${sets} sets × ${reps} reps @ **${formatNumber(weightKg)} kg**`);
        });
        console.log(`\n---`);
    });
};
//# sourceMappingURL=printer.js.map
import { generatePlan } from './planGenerator.js';
import type { PlanRecipe } from '../models/types.js';

describe('planGenerator (Повний Інтеграційний Тест)', () => {
  const comprehensiveRecipe: PlanRecipe = {
    planName: 'Comprehensive Test Plan',
    durationWeeks: 4,
    bodyWeightKg: 100,
    exercises: [
      {
        name: 'Bench Press (Linear)',
        type: 'weight',
        sets: 3,
        reps: 5,
        startCoefficient: 0.8,
        progressionModel: 'linear',
        progressionParams: {
          incrementCoefficient: 0.025,
        },
        warmup: [{ weightKg: 40, reps: 5 }],
      },
      {
        name: 'Squat (Percentage)',
        type: 'weight',
        sets: 3,
        reps: 8,
        startCoefficient: 1.0,
        progressionModel: 'percentage',
        progressionParams: {
          startPercent: 70,
          incrementPercent: 5,
        },
        warmup: [{ weightKg: 50, reps: 5 }],
      },
      {
        name: 'Overhead Press (Wave)',
        type: 'weight',
        sets: 4,
        reps: 6,
        startCoefficient: 0.5,
        progressionModel: 'wave',
        progressionParams: {
          weeksUp: 2,
          upCoefficient: 0.02,
          downCoefficient: 0.01,
        },
        warmup: [{ weightKg: 30, reps: 5 }],
      },
      {
        name: 'Pistol Squat (Block)',
        type: 'bodyweight',
        sets: 1,
        reps: 5,
        startCoefficient: 1.2,
        progressionModel: 'block',
        progressionParams: {
          blockWeeks: 2,
          accumulationCoefficient: 0.01,
          intensificationCoefficient: 0.02,
        },
        warmup: [{ exercise: 'Joint Mobility' }],
      },
    ],
  };

  const generatedPlan = generatePlan(comprehensiveRecipe);

  describe('Загальна структура плану', () => {
    it('повинен правильно встановити назву та тривалість', () => {
      expect(generatedPlan.planName).toBe('Comprehensive Test Plan');
      expect(generatedPlan.durationWeeks).toBe(4);
    });

    it('повинен згенерувати правильну кількість тижнів', () => {
      expect(generatedPlan.weeklyBreakdown).toHaveLength(4);
    });

    it('повинен правильно нумерувати тижні (починаючи з 1)', () => {
      expect(generatedPlan.weeklyBreakdown[0]!.week).toBe(1);
      expect(generatedPlan.weeklyBreakdown[1]!.week).toBe(2);
      expect(generatedPlan.weeklyBreakdown[2]!.week).toBe(3);
      expect(generatedPlan.weeklyBreakdown[3]!.week).toBe(4);
    });
  });

  describe('Точність розрахунків ваги (Інтеграція)', () => {
    const expectedWeights = {
      week1: [80, 70, 50, 120],
      week2: [82, 75, 50, 120],
      week3: [84, 80, 52.5, 122.5],
      week4: [86, 85, 52.5, 125],
    };

    it('повинен правильно розрахувати ваги для Тижня 1', () => {
      const weekExercises = generatedPlan.weeklyBreakdown[0]!.exercises;
      expect(weekExercises[0]!.workingSets.weightKg).toBe(
        expectedWeights.week1[0]
      );
      expect(weekExercises[1]!.workingSets.weightKg).toBe(
        expectedWeights.week1[1]
      );
      expect(weekExercises[2]!.workingSets.weightKg).toBe(
        expectedWeights.week1[2]
      );
      expect(weekExercises[3]!.workingSets.weightKg).toBe(
        expectedWeights.week1[3]
      );
    });

    it('повинен правильно розрахувати ваги для Тижня 2', () => {
      const weekExercises = generatedPlan.weeklyBreakdown[1]!.exercises;
      expect(weekExercises[0]!.workingSets.weightKg).toBe(
        expectedWeights.week2[0]
      );
      expect(weekExercises[1]!.workingSets.weightKg).toBe(
        expectedWeights.week2[1]
      );
      expect(weekExercises[2]!.workingSets.weightKg).toBe(
        expectedWeights.week2[2]
      );
      expect(weekExercises[3]!.workingSets.weightKg).toBe(
        expectedWeights.week2[3]
      );
    });

    it('повинен правильно розрахувати ваги для Тижня 3', () => {
      const weekExercises = generatedPlan.weeklyBreakdown[2]!.exercises;
      expect(weekExercises[0]!.workingSets.weightKg).toBe(
        expectedWeights.week3[0]
      );
      expect(weekExercises[1]!.workingSets.weightKg).toBe(
        expectedWeights.week3[1]
      );
      expect(weekExercises[2]!.workingSets.weightKg).toBe(
        expectedWeights.week3[2]
      );
      expect(weekExercises[3]!.workingSets.weightKg).toBe(
        expectedWeights.week3[3]
      );
    });

    it('повинен правильно розрахувати ваги для Тижня 4', () => {
      const weekExercises = generatedPlan.weeklyBreakdown[3]!.exercises;
      expect(weekExercises[0]!.workingSets.weightKg).toBe(
        expectedWeights.week4[0]
      );
      expect(weekExercises[1]!.workingSets.weightKg).toBe(
        expectedWeights.week4[1]
      );
      expect(weekExercises[2]!.workingSets.weightKg).toBe(
        expectedWeights.week4[2]
      );
      expect(weekExercises[3]!.workingSets.weightKg).toBe(
        expectedWeights.week4[3]
      );
    });
  });

  describe('Копіювання статичних даних (Назва, Тип, Підходи, Розминка)', () => {
    it('повинен правильно копіювати дані для всіх вправ (перевірка на Тижні 1)', () => {
      const week1Exercises = generatedPlan.weeklyBreakdown[0]!.exercises;
      const recipeExercises = comprehensiveRecipe.exercises;

      expect(week1Exercises[0]!.name).toBe(recipeExercises[0]!.name);
      expect(week1Exercises[0]!.type).toBe('weight');
      expect(week1Exercises[0]!.workingSets.sets).toBe(
        recipeExercises[0]!.sets
      );
      expect(week1Exercises[0]!.workingSets.reps).toBe(
        recipeExercises[0]!.reps
      );
      expect(week1Exercises[0]!.warmup).toEqual(recipeExercises[0]!.warmup);

      expect(week1Exercises[1]!.name).toBe(recipeExercises[1]!.name);
      expect(week1Exercises[1]!.type).toBe('weight');
      expect(week1Exercises[1]!.workingSets.sets).toBe(
        recipeExercises[1]!.sets
      );
      expect(week1Exercises[1]!.workingSets.reps).toBe(
        recipeExercises[1]!.reps
      );
      expect(week1Exercises[1]!.warmup).toEqual(recipeExercises[1]!.warmup);

      expect(week1Exercises[2]!.name).toBe(recipeExercises[2]!.name);
      expect(week1Exercises[2]!.type).toBe('weight');
      expect(week1Exercises[2]!.workingSets.sets).toBe(
        recipeExercises[2]!.sets
      );
      expect(week1Exercises[2]!.workingSets.reps).toBe(
        recipeExercises[2]!.reps
      );
      expect(week1Exercises[2]!.warmup).toEqual(recipeExercises[2]!.warmup);

      expect(week1Exercises[3]!.name).toBe(recipeExercises[3]!.name);
      expect(week1Exercises[3]!.type).toBe('bodyweight');
      expect(week1Exercises[3]!.workingSets.sets).toBe(
        recipeExercises[3]!.sets
      );
      expect(week1Exercises[3]!.workingSets.reps).toBe(
        recipeExercises[3]!.reps
      );
      expect(week1Exercises[3]!.warmup).toEqual(recipeExercises[3]!.warmup);
    });
  });

  describe('Граничні випадки (Edge Cases)', () => {
    it('повинен повертати порожній breakdown, якщо у рецепті немає вправ', () => {
      const emptyRecipe: PlanRecipe = {
        planName: 'Empty Plan',
        durationWeeks: 4,
        bodyWeightKg: 100,
        exercises: [],
      };

      const emptyPlan = generatePlan(emptyRecipe);

      expect(emptyPlan.planName).toBe('Empty Plan');
      expect(emptyPlan.weeklyBreakdown).toHaveLength(4);
      expect(emptyPlan.weeklyBreakdown[0]!.exercises).toHaveLength(0);
      expect(emptyPlan.weeklyBreakdown[3]!.exercises).toHaveLength(0);
    });

    it('повинен правильно працювати з планом на 1 тиждень', () => {
      const oneWeekRecipe: PlanRecipe = {
        planName: 'One Week Plan',
        durationWeeks: 1,
        bodyWeightKg: 100,
        exercises: [comprehensiveRecipe.exercises[0]!],
      };

      const oneWeekPlan = generatePlan(oneWeekRecipe);

      expect(oneWeekPlan.durationWeeks).toBe(1);
      expect(oneWeekPlan.weeklyBreakdown).toHaveLength(1);
      expect(oneWeekPlan.weeklyBreakdown[0]!.exercises).toHaveLength(1);
      expect(oneWeekPlan.weeklyBreakdown[0]!.week).toBe(1);
      expect(
        oneWeekPlan.weeklyBreakdown[0]!.exercises[0]!.workingSets.weightKg
      ).toBe(80);
    });

    it('повинен повертати breakdown з 0 тижнів, якщо durationWeeks: 0', () => {
      const zeroWeekRecipe: PlanRecipe = {
        ...comprehensiveRecipe,
        durationWeeks: 0,
      };
      const plan = generatePlan(zeroWeekRecipe);
      expect(plan.durationWeeks).toBe(0);
      expect(plan.weeklyBreakdown).toHaveLength(0);
    });

    it('повинен розраховувати ваги як 0, якщо startCoefficient: 0', () => {
      const zeroCoeffRecipe: PlanRecipe = {
        ...comprehensiveRecipe,
        durationWeeks: 1,
        exercises: [
          {
            ...comprehensiveRecipe.exercises[0]!,
            startCoefficient: 0,
          },
        ],
      };
      const plan = generatePlan(zeroCoeffRecipe);
      expect(plan.weeklyBreakdown[0]!.exercises[0]!.workingSets.weightKg).toBe(
        0
      );
    });
  });
});

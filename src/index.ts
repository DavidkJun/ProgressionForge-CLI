import fs from 'node:fs';
import path from 'node:path';
import { PlanRecipe } from './models/types.js';
import { generatePlan } from './core/planGenerator.js';
import { recipePlanSchema } from './models/schema.js';
import { printPlan } from './utils/printer.js';

export const loadRecipe = (filePath: string): PlanRecipe | null => {
  try {
    const fileContent = fs.readFileSync(filePath).toString();
    const parsedFile = JSON.parse(fileContent);
    return parsedFile;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const main = () => {
  const recipePath = path.resolve(process.cwd(), 'recipe.json');
  const recipe = loadRecipe(recipePath);
  if (recipe === null) return;
  const validationResult = recipePlanSchema.safeParse(recipe);
  if (!validationResult.success) {
    console.error(validationResult.error);
    return;
  }
  const data = validationResult.data as unknown as PlanRecipe;
  const plan = generatePlan(data);
  printPlan(plan);
};

main();

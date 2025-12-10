import fs from 'fs';
import path from 'path';
import { PlanRecipe } from '../models/types.js';
import { recipePlanSchema } from '../models/schema.js';

const STORAGE_PATH = path.join(process.cwd(), 'plans');

interface SystemError extends Error {
  code?: string;
}

export const savePlan = async (
  planName: string,
  data: PlanRecipe
): Promise<void> => {
  try {
    await fs.promises.mkdir(STORAGE_PATH, { recursive: true });
    const filePath = path.join(STORAGE_PATH, `${planName}.json`);
    const fileContent = JSON.stringify(data, null, 2);
    await fs.promises.writeFile(filePath, fileContent, 'utf-8');
  } catch (error: unknown) {
    console.error(`Error saving plan "${planName}":`, error);
    throw new Error(`Failed to save a plan "${planName}".`);
  }
};

export const loadPlan = async (planName: string): Promise<PlanRecipe> => {
  const filePath = path.join(STORAGE_PATH, `${planName}.json`);
  let fileContent;
  try {
    const fileBuffer = await fs.promises.readFile(filePath);
    fileContent = JSON.parse(fileBuffer.toString('utf-8'));
  } catch (error: unknown) {
    const sysError = error as SystemError;
    if (sysError.code === 'ENOENT') {
      throw new Error(`Plan with name "${planName}" does not exist.`);
    }
    console.error(`Failed to load plan "${planName}":`, error);
    throw new Error(`Failed to load or parse plan "${planName}".`);
  }

  const validationResult = recipePlanSchema.safeParse(fileContent);
  if (!validationResult.success) {
    throw new Error(
      `Plan file "${planName}.json" is corrupted or has invalid format.`
    );
  }
  return validationResult.data as unknown as PlanRecipe;
};

export const listPlans = async (): Promise<string[]> => {
  try {
    const files = await fs.promises.readdir(STORAGE_PATH);
    return files
      .filter((file) => file.endsWith('.json'))
      .map((file) => file.replace('.json', ''));
  } catch (error: unknown) {
    const sysError = error as SystemError;
    if (sysError.code === 'ENOENT') {
      return [];
    }
    console.error('Failed to list plans', error);
    throw new Error('Could not retrieve plan list.');
  }
};

export const deletePlan = async (planName: string): Promise<void> => {
  try {
    const filePath = path.join(STORAGE_PATH, `${planName}.json`);
    await fs.promises.unlink(filePath);
  } catch (error: unknown) {
    const sysError = error as SystemError;
    if (sysError.code === 'ENOENT') {
      throw new Error(`Plan with name "${planName}" does not exist.`);
    }
    console.error(`Failed to delete plan "${planName}":`, error);
    throw new Error(
      `An unexpected error occurred while deleting plan "${planName}".`
    );
  }
};

export const planExists = async (planName: string): Promise<boolean> => {
  const filePath = path.join(STORAGE_PATH, `${planName}.json`);
  try {
    await fs.promises.access(filePath);
    return true;
  } catch (_error) {
    return false;
  }
};

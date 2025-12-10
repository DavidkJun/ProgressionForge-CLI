import fs from 'fs';
import path from 'path';
import { recipePlanSchema } from '../models/schema.js';
const STORAGE_PATH = path.join(process.cwd(), 'plans');
export const savePlan = async (planName, data) => {
    try {
        await fs.promises.mkdir(STORAGE_PATH, { recursive: true });
        const filePath = path.join(STORAGE_PATH, `${planName}.json`);
        const fileContent = JSON.stringify(data, null, 2);
        await fs.promises.writeFile(filePath, fileContent, 'utf-8');
    }
    catch (error) {
        console.error(`Error saving plan "${planName}":`, error);
        throw new Error(`Failed to save a plan "${planName}".`);
    }
};
export const loadPlan = async (planName) => {
    const filePath = path.join(STORAGE_PATH, `${planName}.json`);
    let fileContent;
    try {
        const fileBuffer = await fs.promises.readFile(filePath);
        fileContent = JSON.parse(fileBuffer.toString('utf-8'));
    }
    catch (error) {
        const sysError = error;
        if (sysError.code === 'ENOENT') {
            throw new Error(`Plan with name "${planName}" does not exist.`);
        }
        console.error(`Failed to load plan "${planName}":`, error);
        throw new Error(`Failed to load or parse plan "${planName}".`);
    }
    const validationResult = recipePlanSchema.safeParse(fileContent);
    if (!validationResult.success) {
        throw new Error(`Plan file "${planName}.json" is corrupted or has invalid format.`);
    }
    return validationResult.data;
};
export const listPlans = async () => {
    try {
        const files = await fs.promises.readdir(STORAGE_PATH);
        return files
            .filter((file) => file.endsWith('.json'))
            .map((file) => file.replace('.json', ''));
    }
    catch (error) {
        const sysError = error;
        if (sysError.code === 'ENOENT') {
            return [];
        }
        console.error('Failed to list plans', error);
        throw new Error('Could not retrieve plan list.');
    }
};
export const deletePlan = async (planName) => {
    try {
        const filePath = path.join(STORAGE_PATH, `${planName}.json`);
        await fs.promises.unlink(filePath);
    }
    catch (error) {
        const sysError = error;
        if (sysError.code === 'ENOENT') {
            throw new Error(`Plan with name "${planName}" does not exist.`);
        }
        console.error(`Failed to delete plan "${planName}":`, error);
        throw new Error(`An unexpected error occurred while deleting plan "${planName}".`);
    }
};
export const planExists = async (planName) => {
    const filePath = path.join(STORAGE_PATH, `${planName}.json`);
    try {
        await fs.promises.access(filePath);
        return true;
    }
    catch (_error) {
        return false;
    }
};
//# sourceMappingURL=storageManager.js.map
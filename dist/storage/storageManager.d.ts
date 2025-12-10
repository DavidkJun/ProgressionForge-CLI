import { PlanRecipe } from '../models/types.js';
export declare const savePlan: (planName: string, data: PlanRecipe) => Promise<void>;
export declare const loadPlan: (planName: string) => Promise<PlanRecipe>;
export declare const listPlans: () => Promise<string[]>;
export declare const deletePlan: (planName: string) => Promise<void>;
export declare const planExists: (planName: string) => Promise<boolean>;
//# sourceMappingURL=storageManager.d.ts.map
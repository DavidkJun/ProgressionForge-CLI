import { WarmupStep } from '../models/types.js';
export declare const getStandardWarmup: (workingWeight: number) => WarmupStep[];
export declare const getUpperBodyPreset: () => WarmupStep[];
export declare const getLowerBodyPreset: () => WarmupStep[];
export declare const WARMUP_CALCULATORS: {
    standard: (workingWeight: number) => WarmupStep[];
};
export declare const WARMUP_PRESETS: {
    'upper-body': () => WarmupStep[];
    'lower-body': () => WarmupStep[];
};
//# sourceMappingURL=warmupGenerator.d.ts.map
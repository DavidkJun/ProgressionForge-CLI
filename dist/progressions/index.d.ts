import type { LinearParams } from './linear.js';
import type { PercentageParams } from './percentage.js';
import type { WaveParams } from './wave.js';
import type { BlockParams } from './block.js';
export type { LinearProgressionParams } from './linear.js';
export type { PercentageProgressionParams } from './percentage.js';
export type { WaveProgressionParams } from './wave.js';
export type { BlockProgressionParams } from './block.js';
import type { LinearProgressionParams } from './linear.js';
import type { PercentageProgressionParams } from './percentage.js';
import type { WaveProgressionParams } from './wave.js';
import type { BlockProgressionParams } from './block.js';
export type ProgressionParams = LinearProgressionParams | PercentageProgressionParams | WaveProgressionParams | BlockProgressionParams;
export declare const progressionRegistry: {
    linear: (params: LinearParams) => number[];
    percentage: (params: PercentageParams) => number[];
    wave: (params: WaveParams) => number[];
    block: (params: BlockParams) => number[];
};
export type ProgressionFuncInput = LinearParams | PercentageParams | WaveParams | BlockParams;
export declare const PROGRESSION_MODELS: (keyof typeof progressionRegistry)[];
//# sourceMappingURL=index.d.ts.map
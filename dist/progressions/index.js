import { linearProgression } from './linear.js';
import { percentageProgression } from './percentage.js';
import { waveProgression } from './wave.js';
import { blockProgression } from './block.js';
export const progressionRegistry = {
    linear: linearProgression,
    percentage: percentageProgression,
    wave: waveProgression,
    block: blockProgression,
};
export const PROGRESSION_MODELS = Object.keys(progressionRegistry);
//# sourceMappingURL=index.js.map
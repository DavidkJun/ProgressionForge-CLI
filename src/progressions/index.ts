import { linearProgression } from './linear.js';
import { percentageProgression } from './percentage.js';
import { waveProgression } from './wave.js';
import { blockProgression } from './block.js';
import type { LinearParams } from './linear.js';
import type { PercentageParams } from './percentage.js';
import type { WaveParams } from './wave.js';
import type { BlockParams } from './block.js';

export type { LinearParams } from './linear.js';
export type { PercentageParams } from './percentage.js';
export type { WaveParams } from './wave.js';
export type { BlockParams } from './block.js';

export const progressionRegistry = {
  linear: linearProgression,
  percentage: percentageProgression,
  wave: waveProgression,
  block: blockProgression,
};

export const PROGRESSION_MODELS = Object.keys(
  progressionRegistry
) as (keyof typeof progressionRegistry)[];

export type ProgressionParams =
  | LinearParams
  | PercentageParams
  | WaveParams
  | BlockParams;

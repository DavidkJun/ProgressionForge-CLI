import { linearProgression } from './linear.js';
import { percentageProgression } from './percentage.js';
import { waveProgression } from './wave.js';
import { blockProgression } from './block.js';

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

export type ProgressionParams =
  | LinearProgressionParams
  | PercentageProgressionParams
  | WaveProgressionParams
  | BlockProgressionParams;

export const progressionRegistry = {
  linear: linearProgression,
  percentage: percentageProgression,
  wave: waveProgression,
  block: blockProgression,
};

export type ProgressionFuncInput =
  | LinearParams
  | PercentageParams
  | WaveParams
  | BlockParams;

export const PROGRESSION_MODELS = Object.keys(
  progressionRegistry
) as (keyof typeof progressionRegistry)[];

export interface WaveProgressionParams {
    weeksUp: number;
    upCoefficient: number;
    downCoefficient: number;
}
export interface WaveParams {
    initialWeight: number;
    durationWeeks: number;
    progressionParams: WaveProgressionParams;
}
export declare const waveProgression: (params: WaveParams) => number[];
//# sourceMappingURL=wave.d.ts.map
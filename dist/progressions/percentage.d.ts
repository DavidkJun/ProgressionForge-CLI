export interface PercentageProgressionParams {
    startPercent: number;
    incrementPercent: number;
}
export interface PercentageParams {
    initialWeight: number;
    durationWeeks: number;
    progressionParams: PercentageProgressionParams;
}
export declare const percentageProgression: (params: PercentageParams) => number[];
//# sourceMappingURL=percentage.d.ts.map
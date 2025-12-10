export interface BlockProgressionParams {
    accumulationCoefficient: number;
    intensificationCoefficient: number;
    blockWeeks: number;
}
export interface BlockParams {
    initialWeight: number;
    durationWeeks: number;
    progressionParams: BlockProgressionParams;
}
export declare const blockProgression: (params: BlockParams) => number[];
//# sourceMappingURL=block.d.ts.map
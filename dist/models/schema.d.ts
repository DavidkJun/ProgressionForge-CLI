import { z } from 'zod';
export declare const progressionParamsSchema: z.ZodObject<{}, z.core.$loose>;
export declare const warmupStepSchema: z.ZodUnion<readonly [z.ZodObject<{
    exercise: z.ZodString;
    duration: z.ZodOptional<z.ZodString>;
    sets: z.ZodOptional<z.ZodNumber>;
    reps: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>, z.ZodObject<{
    weightKg: z.ZodNumber;
    reps: z.ZodNumber;
}, z.core.$strip>]>;
export declare const exerciseSchema: z.ZodObject<{
    name: z.ZodString;
    type: z.ZodEnum<{
        bodyweight: "bodyweight";
        weight: "weight";
    }>;
    reps: z.ZodNumber;
    sets: z.ZodNumber;
    startCoefficient: z.ZodNumber;
    progressionModel: z.ZodEnum<{
        linear: "linear";
        percentage: "percentage";
        wave: "wave";
        block: "block";
    }>;
    progressionParams: z.ZodObject<{}, z.core.$loose>;
    warmup: z.ZodArray<z.ZodUnion<readonly [z.ZodObject<{
        exercise: z.ZodString;
        duration: z.ZodOptional<z.ZodString>;
        sets: z.ZodOptional<z.ZodNumber>;
        reps: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>, z.ZodObject<{
        weightKg: z.ZodNumber;
        reps: z.ZodNumber;
    }, z.core.$strip>]>>;
}, z.core.$strip>;
export declare const recipePlanSchema: z.ZodObject<{
    planName: z.ZodString;
    durationWeeks: z.ZodNumber;
    bodyWeightKg: z.ZodNumber;
    exercises: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        type: z.ZodEnum<{
            bodyweight: "bodyweight";
            weight: "weight";
        }>;
        reps: z.ZodNumber;
        sets: z.ZodNumber;
        startCoefficient: z.ZodNumber;
        progressionModel: z.ZodEnum<{
            linear: "linear";
            percentage: "percentage";
            wave: "wave";
            block: "block";
        }>;
        progressionParams: z.ZodObject<{}, z.core.$loose>;
        warmup: z.ZodArray<z.ZodUnion<readonly [z.ZodObject<{
            exercise: z.ZodString;
            duration: z.ZodOptional<z.ZodString>;
            sets: z.ZodOptional<z.ZodNumber>;
            reps: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>, z.ZodObject<{
            weightKg: z.ZodNumber;
            reps: z.ZodNumber;
        }, z.core.$strip>]>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
//# sourceMappingURL=schema.d.ts.map
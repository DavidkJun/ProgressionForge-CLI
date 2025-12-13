// @ts-nocheck
import { jest } from '@jest/globals';
import { printPlan } from './printer.js';
describe('Printer Module', () => {
    let consoleOutput = [];
    const mockLog = jest.spyOn(console, 'log').mockImplementation((text) => {
        consoleOutput.push(text);
    });
    beforeEach(() => {
        consoleOutput = [];
        jest.clearAllMocks();
    });
    afterAll(() => {
        mockLog.mockRestore();
    });
    const mockPlan = {
        planName: 'Test Plan',
        durationWeeks: 2,
        weeklyBreakdown: [
            {
                week: 1,
                exercises: [
                    {
                        name: 'Bench Press',
                        type: 'weight',
                        workingSets: { sets: 3, reps: 5, weightKg: 100.39999 },
                        warmup: [
                            { weightKg: 50, reps: 10 },
                            { weightKg: 80, reps: 3 },
                        ],
                    },
                ],
            },
            {
                week: 2,
                exercises: [
                    {
                        name: 'Pull Ups',
                        type: 'bodyweight',
                        workingSets: { sets: 3, reps: 10, weightKg: 80 },
                        warmup: [{ exercise: 'Scapular Pulls', sets: 2, reps: 15 }],
                    },
                ],
            },
        ],
    };
    describe('Standard Logic Tests', () => {
        it('should contain correct Markdown headers and plan details', () => {
            printPlan(mockPlan);
            const fullOutput = consoleOutput.join('\n');
            expect(fullOutput).toContain('# 🏋️ Training Plan: Test Plan');
            expect(fullOutput).toContain('**Duration:** 2 weeks');
            expect(fullOutput).toContain('## 🗓️ Week 1');
            expect(fullOutput).toContain('### Bench Press');
        });
        it('should format working sets correctly with rounding', () => {
            printPlan(mockPlan);
            const fullOutput = consoleOutput.join('\n');
            expect(fullOutput).toContain('@ **100.4 kg**');
            expect(fullOutput).toContain('> **Working Sets:** 3 sets × 5 reps');
        });
        it('should format weight-based warmup correctly', () => {
            printPlan(mockPlan);
            const fullOutput = consoleOutput.join('\n');
            expect(fullOutput).toContain('* 50 kg × 10 reps');
        });
        it('should format exercise-based warmup correctly', () => {
            printPlan(mockPlan);
            const fullOutput = consoleOutput.join('\n');
            expect(fullOutput).toContain('* Scapular Pulls (2 sets × 15 reps)');
        });
    });
    describe('Snapshot Test', () => {
        it('should match the exact visual structure', () => {
            printPlan(mockPlan);
            const fullOutput = consoleOutput.join('\n');
            expect(fullOutput).toMatchSnapshot();
        });
    });
});
//# sourceMappingURL=printer.test.js.map
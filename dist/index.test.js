import { main } from './index.js';
import { listPlans, deletePlan, loadPlan } from './storage/storageManager.js';
import { generatePlan } from './core/planGenerator.js';
import { printPlan } from './utils/printer.js';
import { handleNew } from './commands/new.js';
import { handleEdit } from './commands/edit.js';
import { recipePlanSchema } from './models/schema.js';
// ----------------------------------------------------------------------------
// Mocks
// ----------------------------------------------------------------------------
// Mock all external modules to isolate the CLI logic
jest.mock('./storage/storageManager');
jest.mock('./core/planGenerator');
jest.mock('./utils/printer');
jest.mock('./commands/new');
jest.mock('./commands/edit');
jest.mock('./models/schema', () => ({
    recipePlanSchema: {
        safeParse: jest.fn(),
    },
}));
// ----------------------------------------------------------------------------
// Types & Helpers
// ----------------------------------------------------------------------------
// Helper to cast mocks to Jest Mock types for type safety
const mockLoadPlan = loadPlan;
const mockListPlans = listPlans;
const mockDeletePlan = deletePlan;
const mockGeneratePlan = generatePlan;
const mockPrintPlan = printPlan;
const mockHandleNew = handleNew;
const mockHandleEdit = handleEdit;
const mockSafeParse = recipePlanSchema.safeParse;
describe('CLI Entry Point (index.ts)', () => {
    let originalArgv;
    let consoleLogSpy;
    let consoleErrorSpy;
    let processExitSpy;
    // Custom error to stop execution flow when process.exit is called
    class ExitError extends Error {
        code;
        constructor(code) {
            super(`process.exit(${code})`);
            this.code = code;
            this.name = 'ExitError';
        }
    }
    beforeAll(() => {
        originalArgv = process.argv;
    });
    beforeEach(() => {
        // Reset mocks and spies before each test
        jest.clearAllMocks();
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => { });
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
        // Mock process.exit to throw an error so we can stop execution flow in tests
        processExitSpy = jest.spyOn(process, 'exit').mockImplementation((code) => {
            throw new ExitError(code);
        });
    });
    afterAll(() => {
        process.argv = originalArgv;
        jest.restoreAllMocks();
    });
    // Helper to run main and catch the ExitError if strictly necessary
    const runMain = async (args) => {
        process.argv = ['node', 'index.ts', ...args];
        try {
            await main();
        }
        catch (e) {
            if (!(e instanceof ExitError)) {
                throw e;
            }
            return e.code;
        }
        return 0; // Default success if no exit called
    };
    // --------------------------------------------------------------------------
    // Command: Unknown / Default
    // --------------------------------------------------------------------------
    describe('Default (Unknown Command)', () => {
        it('should show help and exit with code 1 when no command is provided', async () => {
            const exitCode = await runMain([]);
            expect(consoleErrorSpy).toHaveBeenCalledWith('Unknown or missing command.');
            expect(processExitSpy).toHaveBeenCalledWith(1);
            expect(exitCode).toBe(1);
        });
        it('should show help and exit with code 1 when unknown command is provided', async () => {
            const exitCode = await runMain(['unknown-cmd']);
            expect(consoleErrorSpy).toHaveBeenCalledWith('Unknown or missing command.');
            expect(exitCode).toBe(1);
        });
    });
    // --------------------------------------------------------------------------
    // Command: new
    // --------------------------------------------------------------------------
    describe('Command: new', () => {
        it('should error and exit if plan name is missing', async () => {
            const exitCode = await runMain(['new']);
            expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Missing plan name'));
            expect(exitCode).toBe(1);
            expect(mockHandleNew).not.toHaveBeenCalled();
        });
        it('should call handleNew with correct filename on success', async () => {
            mockHandleNew.mockResolvedValue(undefined);
            const exitCode = await runMain(['new', 'my-plan']);
            expect(mockHandleNew).toHaveBeenCalledWith('my-plan');
            expect(exitCode).toBe(0);
            expect(processExitSpy).not.toHaveBeenCalled();
        });
    });
    // --------------------------------------------------------------------------
    // Command: generate
    // --------------------------------------------------------------------------
    describe('Command: generate', () => {
        it('should error and exit if plan name is missing', async () => {
            const exitCode = await runMain(['generate']);
            expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Missing plan name'));
            expect(exitCode).toBe(1);
        });
        it('should error and exit if loading plan fails', async () => {
            mockLoadPlan.mockRejectedValue(new Error('File not found'));
            const exitCode = await runMain(['generate', 'my-plan']);
            expect(consoleErrorSpy).toHaveBeenCalledWith('File not found');
            expect(exitCode).toBe(1);
        });
        it('should error and exit if validation fails', async () => {
            const mockData = { some: 'data' };
            mockLoadPlan.mockResolvedValue(mockData);
            mockSafeParse.mockReturnValue({
                success: false,
                error: { format: () => ({ error: 'Invalid schema' }) },
            });
            const exitCode = await runMain(['generate', 'my-plan']);
            expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('is corrupted or has invalid format'));
            expect(exitCode).toBe(1);
        });
        it('should generate and print plan if valid', async () => {
            const mockRecipe = { name: 'Valid Recipe' };
            const mockGeneratedPlan = { weeks: [] };
            mockLoadPlan.mockResolvedValue(mockRecipe);
            mockSafeParse.mockReturnValue({
                success: true,
                data: mockRecipe,
            });
            mockGeneratePlan.mockReturnValue(mockGeneratedPlan);
            const exitCode = await runMain(['generate', 'my-plan']);
            expect(mockGeneratePlan).toHaveBeenCalledWith(mockRecipe);
            expect(mockPrintPlan).toHaveBeenCalledWith(mockGeneratedPlan);
            expect(exitCode).toBe(0);
        });
    });
    // --------------------------------------------------------------------------
    // Command: list
    // --------------------------------------------------------------------------
    describe('Command: list', () => {
        it('should handle errors during listing', async () => {
            mockListPlans.mockRejectedValue(new Error('Storage error'));
            const exitCode = await runMain(['list']);
            expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to list plans:', 'Storage error');
            expect(exitCode).toBe(1);
        });
        it('should print message if no plans found', async () => {
            mockListPlans.mockResolvedValue([]);
            const exitCode = await runMain(['list']);
            expect(consoleLogSpy).toHaveBeenCalledWith('No saved plans found.');
            expect(exitCode).toBe(0);
        });
        it('should list plans if found', async () => {
            mockListPlans.mockResolvedValue(['plan1', 'plan2']);
            const exitCode = await runMain(['list']);
            expect(consoleLogSpy).toHaveBeenCalledWith('Available plans:');
            expect(consoleLogSpy).toHaveBeenCalledWith('  - plan1');
            expect(consoleLogSpy).toHaveBeenCalledWith('  - plan2');
            expect(exitCode).toBe(0);
        });
    });
    // --------------------------------------------------------------------------
    // Command: delete
    // --------------------------------------------------------------------------
    describe('Command: delete', () => {
        it('should error and exit if plan name is missing', async () => {
            const exitCode = await runMain(['delete']);
            expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Missing plan name'));
            expect(exitCode).toBe(1);
        });
        it('should error and exit if delete fails', async () => {
            mockDeletePlan.mockRejectedValue(new Error('Delete failed'));
            const exitCode = await runMain(['delete', 'old-plan']);
            expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to delete plan "old-plan":', 'Delete failed');
            expect(exitCode).toBe(1);
        });
        it('should success message if delete succeeds', async () => {
            mockDeletePlan.mockResolvedValue(undefined);
            const exitCode = await runMain(['delete', 'old-plan']);
            expect(mockDeletePlan).toHaveBeenCalledWith('old-plan');
            expect(consoleLogSpy).toHaveBeenCalledWith('Successfully deleted plan: old-plan');
            expect(exitCode).toBe(0);
        });
    });
    // --------------------------------------------------------------------------
    // Command: edit
    // --------------------------------------------------------------------------
    describe('Command: edit', () => {
        it('should error and exit if plan name is missing', async () => {
            const exitCode = await runMain(['edit']);
            expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Missing plan name'));
            expect(exitCode).toBe(1);
            expect(mockHandleEdit).not.toHaveBeenCalled();
        });
        it('should call handleEdit with correct filename on success', async () => {
            mockHandleEdit.mockResolvedValue(undefined);
            const exitCode = await runMain(['edit', 'my-plan']);
            expect(mockHandleEdit).toHaveBeenCalledWith('my-plan');
            expect(exitCode).toBe(0);
        });
    });
});
//# sourceMappingURL=index.test.js.map
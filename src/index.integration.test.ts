// @ts-nocheck
import { jest } from '@jest/globals';

import { main } from './index.js';
import * as newCommand from './commands/new.js';
import * as editCommand from './commands/edit.js';
import * as storageManager from './storage/storageManager.js';
import * as planGenerator from './core/planGenerator.js';
import * as printer from './utils/printer.js';
import { recipePlanSchema } from './models/schema.js';

jest.mock('./commands/new');
jest.mock('./commands/edit');
jest.mock('./storage/storageManager');
jest.mock('./core/planGenerator');
jest.mock('./utils/printer');

jest.mock('./models/schema', () => ({
  recipePlanSchema: {
    safeParse: jest.fn(),
  },
}));

describe('CLI Integration Test (index.ts)', () => {
  const originalArgv = process.argv;
  const mockExit = jest.spyOn(process, 'exit').mockImplementation((code) => {
    throw new Error(`Process.exit called with code ${code}`);
  });

  const mockConsoleError = jest
    .spyOn(console, 'error')
    .mockImplementation(() => {});
  const mockConsoleLog = jest
    .spyOn(console, 'log')
    .mockImplementation(() => {});

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    process.argv = originalArgv;
    mockExit.mockRestore();
    mockConsoleError.mockRestore();
    mockConsoleLog.mockRestore();
  });

  const runCli = async (args: string[]) => {
    process.argv = ['node', 'forge', ...args];
    try {
      await main();
    } catch (e) {
      if (!(e instanceof Error && e.message.includes('Process.exit'))) {
        throw e;
      }
    }
  };

  describe('Command: new', () => {
    it('should call handleNew with correct filename', async () => {
      await runCli(['new', 'MyPlan']);
      expect(newCommand.handleNew).toHaveBeenCalledWith('MyPlan');
      expect(mockExit).not.toHaveBeenCalled();
    });

    it('should fail if filename is missing', async () => {
      await runCli(['new']);
      expect(newCommand.handleNew).not.toHaveBeenCalled();
      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining('Missing plan name')
      );
      expect(mockExit).toHaveBeenCalledWith(1);
    });
  });

  describe('Command: edit', () => {
    it('should call handleEdit with correct filename', async () => {
      await runCli(['edit', 'MyPlan']);
      expect(editCommand.handleEdit).toHaveBeenCalledWith('MyPlan');
    });

    it('should fail if filename is missing', async () => {
      await runCli(['edit']);
      expect(editCommand.handleEdit).not.toHaveBeenCalled();
      expect(mockExit).toHaveBeenCalledWith(1);
    });
  });

  describe('Command: delete', () => {
    it('should call deletePlan with correct filename', async () => {
      await runCli(['delete', 'OldPlan']);
      expect(storageManager.deletePlan).toHaveBeenCalledWith('OldPlan');
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Successfully deleted')
      );
    });

    it('should handle errors during deletion', async () => {
      const errorMsg = 'File not found';
      (storageManager.deletePlan as jest.Mock).mockRejectedValue(
        new Error(errorMsg)
      );

      await runCli(['delete', 'OldPlan']);

      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining('Failed to delete plan'),
        expect.stringContaining(errorMsg)
      );
      expect(mockExit).toHaveBeenCalledWith(1);
    });
  });

  describe('Command: list', () => {
    it('should list plans if they exist', async () => {
      (storageManager.listPlans as jest.Mock).mockResolvedValue([
        'plan1.json',
        'plan2.json',
      ]);
      await runCli(['list']);
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Available plans')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('plan1.json')
      );
    });

    it('should show message if no plans found', async () => {
      (storageManager.listPlans as jest.Mock).mockResolvedValue([]);
      await runCli(['list']);
      expect(mockConsoleLog).toHaveBeenCalledWith('No saved plans found.');
    });
  });

  describe('Command: generate', () => {
    const validPlanData = {
      planName: 'TestPlan',
    };

    it('should fail if filename is missing', async () => {
      await runCli(['generate']);
      expect(mockExit).toHaveBeenCalledWith(1);
    });

    it('should fail if loadPlan throws error', async () => {
      (storageManager.loadPlan as jest.Mock).mockRejectedValue(
        new Error('Read error')
      );
      await runCli(['generate', 'TestPlan']);
      expect(mockConsoleError).toHaveBeenCalledWith('Read error');
      expect(mockExit).toHaveBeenCalledWith(1);
    });

    it('should fail if validation fails (Zod)', async () => {
      (storageManager.loadPlan as jest.Mock).mockResolvedValue({
        invalid: 'data',
      });

      (recipePlanSchema.safeParse as jest.Mock).mockReturnValue({
        success: false,
        error: { format: () => ({ _errors: ['Invalid data'] }) },
      });

      await runCli(['generate', 'TestPlan']);

      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining('corrupted or has invalid format')
      );
      expect(mockExit).toHaveBeenCalledWith(1);
    });

    it('should generate and print plan if data is valid', async () => {
      (storageManager.loadPlan as jest.Mock).mockResolvedValue(validPlanData);

      (recipePlanSchema.safeParse as jest.Mock).mockReturnValue({
        success: true,
        data: validPlanData,
      });

      const mockGeneratedPlan = { week1: 'workout' };
      (planGenerator.generatePlan as jest.Mock).mockReturnValue(
        mockGeneratedPlan
      );

      await runCli(['generate', 'TestPlan']);

      expect(planGenerator.generatePlan).toHaveBeenCalledWith(validPlanData);
      expect(printer.printPlan).toHaveBeenCalledWith(mockGeneratedPlan);
      expect(mockExit).not.toHaveBeenCalled();
    });
  });

  describe('Default (Unknown command)', () => {
    it('should show help and exit', async () => {
      await runCli(['dance']);
      expect(mockConsoleError).toHaveBeenCalledWith(
        'Unknown or missing command.'
      );
      expect(mockExit).toHaveBeenCalledWith(1);
    });
  });
});

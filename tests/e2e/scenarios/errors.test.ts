import path from 'path';
import fs from 'fs';
import { runCLI } from '../helpers/cliHelpers';

const TEST_DIR = path.join(__dirname, '../../temp-errors');
const EXISTING_PLAN_NAME = 'existing-plan';
const NON_EXISTENT_PLAN_NAME = 'ghost-plan';

describe('E2E: Error Handling', () => {
  beforeAll(() => {
    if (!fs.existsSync(TEST_DIR)) fs.mkdirSync(TEST_DIR, { recursive: true });
    const plansDir = path.join(TEST_DIR, 'plans');
    fs.mkdirSync(plansDir, { recursive: true });

    const dummyPlan = {
      planName: EXISTING_PLAN_NAME,
      durationWeeks: 4,
      exercises: [],
    };
    fs.writeFileSync(
      path.join(plansDir, `${EXISTING_PLAN_NAME}.json`),
      JSON.stringify(dummyPlan)
    );
  });

  afterAll(() => {
    if (fs.existsSync(TEST_DIR))
      fs.rmSync(TEST_DIR, { recursive: true, force: true });
  });

  test('should overwrite existing plan successfully', async () => {
    const inputs = ['4', '80', 'n'];
    const result = await runCLI(['new', EXISTING_PLAN_NAME], inputs, TEST_DIR);

    expect(result.code).toBe(0);
  });

  test('should fail when generating a non-existent plan', async () => {
    const result = await runCLI(
      ['generate', NON_EXISTENT_PLAN_NAME],
      [],
      TEST_DIR
    );
    expect(result.code).not.toBe(0);
    expect(result.stderr + result.stdout).toMatch(/does not exist/i);
  });

  test('should show help when no command provided', async () => {
    const result = await runCLI([], [], TEST_DIR);
    expect(result.stderr + result.stdout).toMatch(/Available commands/i);
  });
});

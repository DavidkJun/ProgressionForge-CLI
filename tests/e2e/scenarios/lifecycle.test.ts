import path from 'path';
import fs from 'fs';
import { runCLI, KEY_CODES } from '../helpers/cliHelpers';

const TEST_DIR = path.join(__dirname, '../../temp-lifecycle');
const PLAN_NAME = 'e2e-test-plan';
const PLAN_FILE = path.join(TEST_DIR, 'plans', `${PLAN_NAME}.json`);

describe('E2E: Full Lifecycle (Happy Path)', () => {
  beforeAll(() => {
    if (!fs.existsSync(TEST_DIR)) fs.mkdirSync(TEST_DIR, { recursive: true });
  });

  afterAll(() => {
    if (fs.existsSync(TEST_DIR))
      fs.rmSync(TEST_DIR, { recursive: true, force: true });
  });

  test('should create a new plan via "new" command', async () => {
    const inputs = [
      '4',
      '80',

      'Squats',
      KEY_CODES.ENTER,
      '5',
      '5',

      KEY_CODES.ENTER,
      '1',
      '0.025',

      KEY_CODES.ENTER,

      KEY_CODES.ENTER,

      KEY_CODES.ENTER,

      '20',
      '10',

      'n',

      'n',
    ];

    const result = await runCLI(['new', PLAN_NAME], inputs, TEST_DIR);

    if (result.code !== 0) {
      console.log('DEBUG STDOUT (NEW):', result.stdout);
    }

    expect(result.code).toBe(0);
    expect(result.stdout).toContain('Success');
    expect(fs.existsSync(PLAN_FILE)).toBe(true);

    const fileContent = JSON.parse(fs.readFileSync(PLAN_FILE, 'utf-8'));
    expect(fileContent.planName).toBe(PLAN_NAME);
  }, 90000);

  test('should verify the plan appears in "list"', async () => {
    const result = await runCLI(['list'], [], TEST_DIR);
    expect(result.code).toBe(0);
    expect(result.stdout).toContain(PLAN_NAME);
  });

  test('should generate the workout schedule', async () => {
    const result = await runCLI(['generate', PLAN_NAME], [], TEST_DIR);

    expect(result.code).toBe(0);
    expect(result.stdout.length).toBeGreaterThan(0);

    expect(result.stdout).toMatchSnapshot();
  });

  test('should delete the plan', async () => {
    expect(fs.existsSync(PLAN_FILE)).toBe(true);

    const inputs = ['y'];
    const result = await runCLI(['delete', PLAN_NAME], inputs, TEST_DIR);

    expect(result.code).toBe(0);
    expect(result.stdout).toContain('Successfully deleted');
    expect(fs.existsSync(PLAN_FILE)).toBe(false);
  });
});

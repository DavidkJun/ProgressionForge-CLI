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

  // ТЕСТ 1: Створення
  test('should create a new plan via "new" command', async () => {
    const inputs = [
      '4', // Duration
      '80', // Bodyweight

      // -- Exercise --
      'Squats', // Name
      KEY_CODES.ENTER, // Type: Bodyweight (Default)
      '5', // Sets
      '5', // Reps

      KEY_CODES.ENTER, // Progression: Linear (Default)
      '1', // Start Coeff
      '0.025', // Increment (2.5%)

      KEY_CODES.ENTER, // Movement Type: Upper Body (Default)

      // -- Warmup (Custom) --
      // Просто тиснемо ENTER. Перший пункт - "Custom".
      KEY_CODES.ENTER,

      // Select step type "Weight-based" (Default)
      KEY_CODES.ENTER,

      // Вводимо цифри. Програма буде їх чекати.
      '20', // Warmup Weight
      '10', // Warmup Reps

      'n', // Add another warmup step? -> NO

      // -- Exercise Loop End --
      'n', // Add another exercise? -> NO
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

  // ТЕСТ 2: Перегляд списку
  test('should verify the plan appears in "list"', async () => {
    const result = await runCLI(['list'], [], TEST_DIR);
    expect(result.code).toBe(0);
    expect(result.stdout).toContain(PLAN_NAME);
  });

  // ТЕСТ 3: Генерація
  test('should generate the workout schedule', async () => {
    const result = await runCLI(['generate', PLAN_NAME], [], TEST_DIR);

    expect(result.code).toBe(0);
    expect(result.stdout.length).toBeGreaterThan(0);

    // Снепшот збереже результат.
    // Якщо тест впаде, запустіть з прапорцем -u
    expect(result.stdout).toMatchSnapshot();
  });

  // ТЕСТ 4: Видалення
  test('should delete the plan', async () => {
    expect(fs.existsSync(PLAN_FILE)).toBe(true);

    // 'y' для підтвердження (якщо його немає в коді, це не зашкодить)
    const inputs = ['y'];
    const result = await runCLI(['delete', PLAN_NAME], inputs, TEST_DIR);

    expect(result.code).toBe(0);
    expect(result.stdout).toContain('Successfully deleted');
    expect(fs.existsSync(PLAN_FILE)).toBe(false);
  });
});

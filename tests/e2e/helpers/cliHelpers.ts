import { spawn } from 'child_process';
import path from 'path';

export interface CliResult {
  code: number;
  stdout: string;
  stderr: string;
  error: Error | null;
}

export const KEY_CODES = {
  // Використовуємо \n, це стабільно працює для Inquirer + spawn
  ENTER: '\n',
  DOWN: '\x1B\x5B\x42',
  UP: '\x1B\x5B\x41',
};

export function runCLI(
  args: string[],
  inputs: string[] = [],
  cwd: string = process.cwd()
): Promise<CliResult> {
  return new Promise((resolve) => {
    // Шлях до скомпільованого файлу
    const cliPath = path.resolve(__dirname, '../../../dist/index.js');

    const child = spawn('node', [cliPath, ...args], {
      cwd,
      stdio: 'pipe',
      env: { ...process.env, NODE_ENV: 'test' },
    });

    let stdout = '';
    let stderr = '';
    let error: Error | null = null;

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('error', (err) => {
      error = err;
    });

    const loopInputs = async () => {
      // Чекаємо 4 секунди на повний старт (щоб Inquirer прокинувся)
      await new Promise((r) => setTimeout(r, 4000));

      for (const input of inputs) {
        if (child.stdin && !child.killed) {
          if (
            input === KEY_CODES.DOWN ||
            input === KEY_CODES.UP ||
            input === KEY_CODES.ENTER
          ) {
            child.stdin.write(input);
          } else {
            // Для тексту додаємо Enter
            child.stdin.write(input + KEY_CODES.ENTER);
          }
        }
        // Пауза 2 секунди між діями
        await new Promise((r) => setTimeout(r, 2000));
      }

      // Даємо час на обробку останньої команди
      await new Promise((r) => setTimeout(r, 1000));
      if (child.stdin) {
        child.stdin.end();
      }
    };

    loopInputs();

    child.on('close', (code) => {
      resolve({
        code: code ?? 0,
        stdout,
        stderr,
        error,
      });
    });
  });
}

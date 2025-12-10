import { main } from './index.js';
import * as fs from 'fs/promises';
import { jest } from '@jest/globals';
// ----------------------------------------------------------------------------
// Mocks
// ----------------------------------------------------------------------------
// 1. Мокаємо FS (Файлову систему)
jest.mock('fs/promises');
// 2. ВАЖЛИВО: Мокаємо інтерактивні команди!
// Це вирішує проблему Timeout. Ми замінюємо реальну функцію, яка чекає введення,
// на фейкову, яка просто каже "Я все зробила".
jest.mock('./commands/new.js', () => ({
    handleNew: jest.fn(),
}));
jest.mock('./commands/edit.js', () => ({
    handleEdit: jest.fn(),
}));
// Імпортуємо замокані функції, щоб налаштувати їх поведінку
import { handleNew } from './commands/new.js';
describe('CLI Integration Flow (index.ts)', () => {
    let consoleLogSpy;
    let consoleErrorSpy;
    let virtualFileSystem = {};
    beforeEach(() => {
        virtualFileSystem = {};
        jest.clearAllMocks();
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => { });
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
        jest.spyOn(process, 'exit').mockImplementation((code) => {
            throw new Error(`EXIT_CALLED_WITH_${code}`);
        });
        // --- Налаштування віртуальної FS ---
        fs.writeFile.mockImplementation(async (path, data) => {
            virtualFileSystem[path] = data;
            return Promise.resolve();
        });
        fs.readFile.mockImplementation(async (path) => {
            const content = virtualFileSystem[path];
            if (content) {
                return Promise.resolve(content);
            }
            return Promise.reject(new Error(`ENOENT: no such file or directory, open '${path}'`));
        });
        fs.readdir.mockImplementation(async (_path) => {
            const files = Object.keys(virtualFileSystem).map((p) => p.split('/').pop() || '');
            return Promise.resolve(files.filter(Boolean));
        });
        fs.unlink.mockImplementation(async (path) => {
            if (virtualFileSystem[path]) {
                delete virtualFileSystem[path];
                return Promise.resolve();
            }
            return Promise.reject(new Error(`ENOENT: no such file or directory, unlink '${path}'`));
        });
        fs.stat.mockImplementation(async (_path) => {
            return Promise.resolve({ isDirectory: () => true, isFile: () => false });
        });
        fs.mkdir.mockImplementation(async (_path) => Promise.resolve());
    });
    afterAll(() => {
        jest.restoreAllMocks();
    });
    const runCLI = async (args) => {
        process.argv = ['node', 'index.js', ...args];
        try {
            await main();
        }
        catch (e) {
            if (e instanceof Error && e.message.startsWith('EXIT_CALLED_WITH')) {
                return parseInt(e.message.split('_').pop() || '1', 10);
            }
            throw e;
        }
        return 0;
    };
    // ==========================================================================
    // ТЕСТОВІ СЦЕНАРІЇ
    // ==========================================================================
    it('Happy Path: Create -> List -> Delete', async () => {
        const planName = 'integration-test-plan';
        const expectedFilePath = `./plans/${planName}.json`;
        // --- НАЛАШТУВАННЯ МОКУ ДЛЯ handleNew ---
        // Ми емулюємо, що handleNew "створив" файл.
        // Замість реального опитування користувача, ми просто записуємо файл у віртуальну FS.
        handleNew.mockImplementation(async (name) => {
            const dummyPlan = JSON.stringify({ name: name, weeks: [] });
            // Прямо тут "створюємо" файл у нашій віртуальній системі
            await fs.writeFile(`./plans/${name}.json`, dummyPlan);
        });
        // --- КРОК 1: Створення (NEW) ---
        const exitCodeNew = await runCLI(['new', planName]);
        expect(exitCodeNew).toBe(0);
        // Перевіряємо, що main викликав handleNew
        expect(handleNew).toHaveBeenCalledWith(planName);
        // Перевіряємо, що в результаті роботи мока файл з'явився
        expect(virtualFileSystem[expectedFilePath]).toBeDefined();
        // --- КРОК 2: Перегляд (LIST) ---
        // Тепер list має побачити цей файл
        const exitCodeList = await runCLI(['list']);
        expect(exitCodeList).toBe(0);
        expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining(planName));
        // --- КРОК 3: Видалення (DELETE) ---
        const exitCodeDelete = await runCLI(['delete', planName]);
        expect(exitCodeDelete).toBe(0);
        // Після видалення файл має зникнути
        expect(virtualFileSystem[expectedFilePath]).toBeUndefined();
        expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Successfully deleted'));
    });
    it('Error Handling: Should fail gracefully when deleting non-existent plan', async () => {
        const exitCode = await runCLI(['delete', 'ghost-plan']);
        expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Failed to delete plan'), expect.anything());
        expect(exitCode).toBe(1);
    });
    it('Error Handling: Should show usage if command arguments are missing', async () => {
        const exitCode = await runCLI(['new']);
        expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Missing plan name'));
        expect(exitCode).toBe(1);
    });
});
//# sourceMappingURL=index.unit.test.js.map
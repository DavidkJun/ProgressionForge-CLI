import { generatePlan } from './core/planGenerator.js';
import { recipePlanSchema } from './models/schema.js';
import { printPlan } from './utils/printer.js';
import { listPlans, deletePlan, loadPlan } from './storage/storageManager.js';
import { handleNew } from './commands/new.js';
import { handleEdit } from './commands/edit.js';
export const main = async () => {
    const args = process.argv.slice(2);
    const command = args[0];
    const fileName = args[1];
    switch (command) {
        case 'new': {
            if (fileName) {
                await handleNew(fileName);
            }
            else {
                console.error('Error: Missing plan name for "new" command.');
                console.error('Usage: new <plan-name>');
                process.exit(1);
            }
            break;
        }
        case 'generate': {
            if (!fileName) {
                console.error('Error: Missing plan name for "generate" command.');
                console.error('Usage: generate <plan-name>');
                process.exit(1);
            }
            let recipe;
            try {
                const loadedData = await loadPlan(fileName);
                recipe = loadedData;
            }
            catch (error) {
                console.error(error instanceof Error ? error.message : 'Failed to load plan recipe.');
                process.exit(1);
            }
            const validationResult = recipePlanSchema.safeParse(recipe);
            if (!validationResult.success) {
                console.error(`Plan file "${fileName}" is corrupted or has invalid format:`);
                console.error(JSON.stringify(validationResult.error.format(), null, 2));
                process.exit(1);
            }
            const data = validationResult.data;
            const plan = generatePlan(data);
            printPlan(plan);
            break;
        }
        case 'list': {
            try {
                const plans = await listPlans();
                if (plans.length === 0) {
                    console.log('No saved plans found.');
                }
                else {
                    console.log('Available plans:');
                    plans.forEach((plan) => console.log(`  - ${plan}`));
                }
            }
            catch (err) {
                console.error('Failed to list plans:', err instanceof Error ? err.message : err);
                process.exit(1);
            }
            break;
        }
        case 'delete': {
            if (!fileName) {
                console.error('Error: Missing plan name for "delete" command.');
                console.error('Usage: delete <plan-name>');
                process.exit(1);
            }
            try {
                await deletePlan(fileName);
                console.log(`Successfully deleted plan: ${fileName}`);
            }
            catch (err) {
                console.error(`Failed to delete plan "${fileName}":`, err instanceof Error ? err.message : err);
                process.exit(1);
            }
            break;
        }
        case 'edit': {
            if (fileName) {
                await handleEdit(fileName);
            }
            else {
                console.error('Error: Missing plan name for "edit" command.');
                console.error('Usage: edit <plan-name>');
                process.exit(1);
            }
            break;
        }
        default:
            console.error('Unknown or missing command.');
            console.error('Available commands:');
            console.error('  new <plan-name>     - Creates a new plan recipe.');
            console.error('  generate <plan-name> - Generates a workout schedule from a saved plan.');
            console.error('  list                - Lists all saved plans.');
            console.error('  delete <plan-name>  - Deletes a plan.');
            console.error('  edit <plan-name>    - Edits a plan.');
            process.exit(1);
    }
};
if (process.env.NODE_ENV !== 'test') {
    main().catch((err) => {
        console.error('Fatal Error:', err);
        process.exit(1);
    });
}
//# sourceMappingURL=index.js.map
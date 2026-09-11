import { copyTemplate, setupConfig } from './scaffold-utils.js';

export async function scaffold(args) {
    const mode = args['--setup'] === true ? 'config' : String(args['--setup']);
    const outputDir = args['--output'] || process.cwd();

    switch (mode) {
        case 'config':
            await setupConfig(outputDir);
            break;

        case 'custom-check':
            await copyTemplate('templates/custom-check', undefined, outputDir);
            break;

        case 'extend-check':
            await copyTemplate('templates/extend-checks.js', undefined, outputDir);
            break;

        case 'workflow':
            await copyTemplate('templates/optimize.yml', undefined, outputDir);
            break;

        case 'all':
            await setupConfig(outputDir);
            await copyTemplate('templates/custom-check', undefined, outputDir);
            await copyTemplate('templates/extend-checks.js', undefined, outputDir);
            await copyTemplate('templates/optimize.yml', undefined, outputDir);
            break;

        default:
            console.error(`[optimize] ❌ Unknown --setup target: ${mode}`);
            process.exit(1);
    }
}
import { copyTemplate, setupConfig } from './scaffold-utils.js';

export async function scaffold(args) {
    const mode = args['--setup'] === true ? 'config' : String(args['--setup']);
    switch (mode) {
        case 'config':
            await setupConfig();
            break;

        case 'custom-check':
            await copyTemplate('templates/custom-check', undefined, args['--output']);
            break;

        case 'extend-check':
            await copyTemplate('templates/extend-checks.js', undefined, args['--output']);
            break;

        case 'workflow':
            await copyTemplate('templates/optimize.yml', undefined, args['--output']);
            break;

        case 'all':
            await setupConfig();
            await copyTemplate('templates/custom-check', undefined, args['--output']);
            await copyTemplate('templates/extend-checks.js', undefined, args['--output']);
            await copyTemplate('templates/optimize.yml', undefined, args['--output']);
            break;

        default:
            console.error(`[optimize] ❌ Unknown --setup target: ${mode}`);
            process.exit(1);
    }
}
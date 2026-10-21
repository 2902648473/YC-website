import { readFileSync } from 'node:fs';
import { getDeploymentConfig } from '../src/lib/deployment-config.mjs';

// Keep wrangler.jsonc valid JSON so this validation needs no extra dependency.
const config = JSON.parse(readFileSync(new URL('../wrangler.jsonc', import.meta.url), 'utf8'));
const deployment = getDeploymentConfig(config.vars);
console.log(`Worker: ${config.name}; canonical: ${deployment.siteUrl ?? 'not set'}; indexing: ${deployment.indexing}`);

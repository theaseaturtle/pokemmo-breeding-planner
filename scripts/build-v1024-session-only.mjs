import { readFileSync, writeFileSync } from 'node:fs';

const sourceUrl = new URL('../app/pokemmo-breeding-planner-v1.0.23-2026-08-29.html', import.meta.url);
const outputUrl = new URL('../app/pokemmo-breeding-planner-v1.0.24-2026-08-30.html', import.meta.url);
let html = readFileSync(sourceUrl, 'utf8');
html = html.replaceAll('v1.0.23', 'v1.0.24').replaceAll('v1_0_23', 'v1_0_24').replaceAll('2026-08-29', '2026-08-30');
html = html.replace("const APP_VERSION='1.0.23'", "const APP_VERSION='1.0.24'");
writeFileSync(outputUrl, html);

import { readFileSync, writeFileSync } from 'node:fs';

const sourcePath = new URL('../app/pokemmo-breeding-planner-v1.0.11-2026-08-25.html', import.meta.url);
const outputPath = new URL('../app/pokemmo-breeding-planner-v1.0.12-2026-08-25.html', import.meta.url);
let html = readFileSync(sourcePath, 'utf8')
  .replaceAll('v1.0.11', 'v1.0.12')
  .replaceAll('v1_0_11', 'v1_0_12')
  .replace("APP_VERSION='1.0.11'", "APP_VERSION='1.0.12'")
  .replace("PREVIOUS_STORAGE_KEY='pokemmo_breeding_planner_v1_0_10'", "PREVIOUS_STORAGE_KEY='pokemmo_breeding_planner_v1_0_11'")
  .replace('SCHEMA_VERSION=11', 'SCHEMA_VERSION=12')
  .replaceAll('pokedex-gen1-5-bootstrap-2026-08-24-v1.0.12', 'pokedex-gen1-5-bootstrap-2026-08-24-v1.0.9')
  .replaceAll('pokemmo-breeding-tree-acquisition-ledger-2026-08-24-v1.0.12', 'pokemmo-breeding-tree-acquisition-ledger-2026-08-24-v1.0.9')
  .replace("已从 v1.0.10 迁移目标、价格、长期库存与道具库存", "已从 v1.0.11 迁移目标、价格、长期库存与道具库存");
const stage1CostCards = /<div class="rule-strip"><div class="metric"><div class="label">亲本待购<\/div>[\s\S]*?<\/div><div class="item"><h3>确定性配种树<\/h3>/;
if (!stage1CostCards.test(html)) throw new Error('未找到 05 阶段成本卡片区');
html = html.replace(stage1CostCards, '<div class="item"><h3>确定性配种树</h3>');
writeFileSync(outputPath, html);
console.log(outputPath.pathname);

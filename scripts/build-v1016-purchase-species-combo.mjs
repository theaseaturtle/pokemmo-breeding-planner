import { readFileSync, writeFileSync } from 'node:fs';

const sourcePath = new URL('../app/pokemmo-breeding-planner-v1.0.15-2026-08-25.html', import.meta.url);
const outputPath = new URL('../app/pokemmo-breeding-planner-v1.0.16-2026-08-25.html', import.meta.url);

let html = readFileSync(sourcePath, 'utf8')
  .replaceAll('v1.0.15', 'v1.0.16')
  .replaceAll('v1_0_15', 'v1_0_16')
  .replace("APP_VERSION='1.0.15'", "APP_VERSION='1.0.16'")
  .replace("PREVIOUS_STORAGE_KEY='pokemmo_breeding_planner_v1_0_14'", "PREVIOUS_STORAGE_KEY='pokemmo_breeding_planner_v1_0_15'")
  .replace('SCHEMA_VERSION=15', 'SCHEMA_VERSION=16')
  .replaceAll('pokedex-gen1-5-bootstrap-2026-08-24-v1.0.16', 'pokedex-gen1-5-bootstrap-2026-08-24-v1.0.9')
  .replaceAll('pokemmo-breeding-tree-acquisition-ledger-2026-08-24-v1.0.16', 'pokemmo-breeding-tree-acquisition-ledger-2026-08-24-v1.0.9')
  .replace("document.querySelectorAll('[data-purchase-search]')", "document.querySelectorAll('[data-purchase-search],[data-buy-species-input]')")
  .replace('const groupId=input.dataset.purchaseSearch,menu=', 'const groupId=input.dataset.purchaseSearch||input.dataset.buyGroup,menu=')
  .replace('<strong>\'+(row.allocation===\'MANUAL\'?\'待购来源\':\'自动补位\')+\'：<input class="inline-purchase-species"', '<strong class="combo inline-purchase-combo">\'+(row.allocation===\'MANUAL\'?\'待购来源\':\'自动补位\')+\'：<input class="inline-purchase-species"')
  .replace('首次打开可迁移 v1.0.14 长期数据', '首次打开可迁移 v1.0.15 长期数据')
  .replace("已从 v1.0.14 迁移目标、价格、长期库存与道具库存", "已从 v1.0.15 迁移目标、价格、长期库存与道具库存")
  .replace("document.getElementById('data-version-badge').textContent='v1.0.15'", "document.getElementById('data-version-badge').textContent='v1.0.9'")
  .replace("document.getElementById('rules-version-badge').textContent='配种树 v1.0.15'", "document.getElementById('rules-version-badge').textContent='配种树 v1.0.9'");

writeFileSync(outputPath, html);
console.log(outputPath.pathname);

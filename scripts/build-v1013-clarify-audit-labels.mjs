import { readFileSync, writeFileSync } from 'node:fs';

const sourcePath = new URL('../app/pokemmo-breeding-planner-v1.0.12-2026-08-25.html', import.meta.url);
const outputPath = new URL('../app/pokemmo-breeding-planner-v1.0.13-2026-08-25.html', import.meta.url);
let html = readFileSync(sourcePath, 'utf8')
  .replaceAll('v1.0.12', 'v1.0.13')
  .replaceAll('v1_0_12', 'v1_0_13')
  .replace("APP_VERSION='1.0.12'", "APP_VERSION='1.0.13'")
  .replace("PREVIOUS_STORAGE_KEY='pokemmo_breeding_planner_v1_0_11'", "PREVIOUS_STORAGE_KEY='pokemmo_breeding_planner_v1_0_12'")
  .replace('SCHEMA_VERSION=12', 'SCHEMA_VERSION=13')
  .replaceAll('pokedex-gen1-5-bootstrap-2026-08-24-v1.0.13', 'pokedex-gen1-5-bootstrap-2026-08-24-v1.0.9')
  .replaceAll('pokemmo-breeding-tree-acquisition-ledger-2026-08-24-v1.0.13', 'pokemmo-breeding-tree-acquisition-ledger-2026-08-24-v1.0.9')
  .replace('参考方案总成本', '参考方案总成本（02 预估）')
  .replace('实际已花费', '已确认实际花费（05 成交）')
  .replace('剩余预计花费', '未购买部分预计花费')
  .replace('完工预测', '按当前采购进度完工预测')
  .replace('历史成交价不会因市场参考价变化而改写。', '02 价格只用于排序与预估；05 中确认的成交价才计入实际花费。');
writeFileSync(outputPath, html);
console.log(outputPath.pathname);

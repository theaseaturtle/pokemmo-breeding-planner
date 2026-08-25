import { readFileSync, writeFileSync } from 'node:fs';

const sourcePath = new URL('../app/pokemmo-breeding-planner-v1.0.9-2026-08-24.html', import.meta.url);
const outputPath = new URL('../app/pokemmo-breeding-planner-v1.0.10-2026-08-25.html', import.meta.url);
let html = readFileSync(sourcePath, 'utf8')
  .replaceAll('v1.0.9', 'v1.0.10')
  .replaceAll('v1_0_9', 'v1_0_10')
  .replace("APP_VERSION='1.0.9'", "APP_VERSION='1.0.10'")
  .replaceAll('pokedex-gen1-5-bootstrap-2026-08-24-v1.0.10', 'pokedex-gen1-5-bootstrap-2026-08-24-v1.0.9')
  .replaceAll('pokemmo-breeding-tree-acquisition-ledger-2026-08-24-v1.0.10', 'pokemmo-breeding-tree-acquisition-ledger-2026-08-24-v1.0.9')
  .replace("PREVIOUS_STORAGE_KEY='pokemmo_breeding_planner_v1_0_8'", "PREVIOUS_STORAGE_KEY='pokemmo_breeding_planner_v1_0_9'")
  .replace('SCHEMA_VERSION=9', 'SCHEMA_VERSION=10')
  .replace('首次打开可迁移 v1.0.8 长期数据', '首次打开可迁移 v1.0.9 长期数据')
  .replace("document.getElementById('data-version-badge').textContent='v1.0.10'", "document.getElementById('data-version-badge').textContent='v1.0.9'")
  .replace("document.getElementById('rules-version-badge').textContent='配种树 v1.0.10'", "document.getElementById('rules-version-badge').textContent='配种树 v1.0.9'")
  .replace(/<div class="field"><label for="brace-mode">锁项道具<\/label>[\s\S]*?<div id="price-grid" class="rule-strip"><\/div><div class="field"><label for="price-nature-base">仅性格路线素材单价<\/label><input id="price-nature-base" type="number" min="0" step="1"><\/div><div class="field"><label for="price-everstone">不变之石单价<\/label><input id="price-everstone" type="number" min="0" step="1"><\/div>/, '<div id="price-grid" class="rule-strip"></div><div class="field"><label for="price-nature-base">仅性格路线素材单价</label><input id="price-nature-base" type="number" min="0" step="1"></div>')
  .replace("'#target-nature,#target-gender,#brace-mode,#purchase-mode,'+", "'#target-nature,#target-gender,'+")
  .replace("Object.assign(APP.pricing,x.pricing||{});APP.inventory=", "Object.assign(APP.pricing,x.pricing||{});APP.pricing.braceMode='YEN';APP.pricing.purchaseMode='MARKET';APP.pricing.everstone=0;APP.inventory=")
  .replace("document.getElementById('price-everstone').value=APP.pricing.everstone", '')
  .replace("document.getElementById('brace-mode').onchange=e=>{APP.pricing.braceMode=e.target.value;invalidate('brace 计费变化')};", '')
  .replace("document.getElementById('purchase-mode').onchange=e=>{APP.pricing.purchaseMode=e.target.value;invalidate('来源模式变化')};", '')
  .replace("document.getElementById('price-everstone').onchange=e=>{APP.pricing.everstone=Number(e.target.value||0);invalidate('不变之石价格变化')};", '')
  .replace("document.getElementById('brace-mode').value=APP.pricing.braceMode;document.getElementById('purchase-mode').value=APP.pricing.purchaseMode;", '')
  .replace("document.getElementById('price-everstone').value=APP.pricing.everstone;", '');
writeFileSync(outputPath, html);
console.log(outputPath.pathname);

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const releasePath = new URL('../app/pokemmo-breeding-planner-v1.0.10-2026-08-25.html', import.meta.url);
const html = readFileSync(releasePath, 'utf8');
const inline = html.match(/<script>([\s\S]*)<\/script>/)?.[1];
function loadPlanner() {
  const script = inline.replace(/init\(\);\s*$/, 'globalThis.__planner={APP,POKEDEX_RAW,makeSpecies,itemsFor};');
  const context = vm.createContext({ console, structuredClone: globalThis.structuredClone, setTimeout, clearTimeout });
  vm.runInContext(script, context);
  const planner = context.__planner;
  planner.APP.catalog = planner.POKEDEX_RAW.map(planner.makeSpecies);
  planner.APP.byName = Object.fromEntries(planner.APP.catalog.map(species => [species.name, species]));
  return planner;
}

test('v1.0.10 移除成本口径的重复输入并固定默认策略', () => {
  assert.doesNotMatch(html, /id="brace-mode"|id="purchase-mode"|id="price-everstone"/);
  assert.doesNotMatch(html, /锁项道具|基础素材来源|不变之石单价/);
  assert.match(html, /APP_VERSION='1\.0\.10'/);
  assert.match(html, /STORAGE_KEY='pokemmo_breeding_planner_v1_0_10'/);
  assert.match(html, /PREVIOUS_STORAGE_KEY='pokemmo_breeding_planner_v1_0_9'/);
});

test('旧账本加载时强制使用金币、允许采购和不变之石零参考价', () => {
  const planner = loadPlanner();
  const source = inline.replace(/init\(\);\s*$/, 'globalThis.__normalize=load;');
  assert.match(source, /APP\.pricing\.braceMode='YEN';APP\.pricing\.purchaseMode='MARKET';APP\.pricing\.everstone=0/);
  assert.equal(planner.APP.pricing.braceMode, 'YEN');
  assert.equal(planner.APP.pricing.purchaseMode, 'MARKET');
  assert.equal(planner.APP.pricing.everstone, 0);
});

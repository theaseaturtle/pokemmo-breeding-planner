import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const releasePath = new URL('../app/pokemmo-breeding-planner-v1.0.11-2026-08-25.html', import.meta.url);
const html = readFileSync(releasePath, 'utf8');
const inline = html.match(/<script>([\s\S]*)<\/script>/)?.[1];

test('锁个体道具采购只提供金币 10000 或 BP 750', () => {
  assert.match(html, /data-buy-item-currency/);
  assert.match(html, /金币 · 10000/);
  assert.match(html, /BP · 750/);
  assert.match(inline, /currency==='BP'\?750:10000/);
  assert.match(inline, /锁个体道具价格固定为金币 10000 或 BP 750/);
});

test('v1.0.11 使用独立账本并从 v1.0.10 迁移', () => {
  assert.match(inline, /APP_VERSION='1\.0\.11'/);
  assert.match(inline, /STORAGE_KEY='pokemmo_breeding_planner_v1_0_11'/);
  assert.match(inline, /PREVIOUS_STORAGE_KEY='pokemmo_breeding_planner_v1_0_10'/);
  assert.match(inline, /SCHEMA_VERSION=11/);
});

test('新版应用脚本语法有效', () => {
  const script = inline.replace(/init\(\);\s*$/, '');
  assert.doesNotThrow(() => new vm.Script(script));
});

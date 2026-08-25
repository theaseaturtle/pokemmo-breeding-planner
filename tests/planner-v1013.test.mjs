import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const releasePath = new URL('../app/pokemmo-breeding-planner-v1.0.13-2026-08-25.html', import.meta.url);
const html = readFileSync(releasePath, 'utf8');
const inline = html.match(/<script>([\s\S]*)<\/script>/)?.[1];

test('07 审计明确区分 02 预估、05 成交和未购买预测', () => {
  assert.match(inline, /参考方案总成本（02 预估）/);
  assert.match(inline, /已确认实际花费（05 成交）/);
  assert.match(inline, /未购买部分预计花费/);
  assert.match(inline, /按当前采购进度完工预测/);
  assert.match(inline, /02 价格只用于排序与预估；05 中确认的成交价才计入实际花费/);
});

test('v1.0.13 使用独立账本并从 v1.0.12 迁移', () => {
  assert.match(inline, /APP_VERSION='1\.0\.13'/);
  assert.match(inline, /STORAGE_KEY='pokemmo_breeding_planner_v1_0_13'/);
  assert.match(inline, /PREVIOUS_STORAGE_KEY='pokemmo_breeding_planner_v1_0_12'/);
  assert.match(inline, /SCHEMA_VERSION=13/);
});

test('新版应用脚本语法有效', () => {
  assert.doesNotThrow(() => new vm.Script(inline.replace(/init\(\);\s*$/, '')));
});

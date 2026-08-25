import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const releasePath = new URL('../app/pokemmo-breeding-planner-v1.0.16-2026-08-25.html', import.meta.url);
const html = readFileSync(releasePath, 'utf8');
const inline = html.match(/<script>([\s\S]*)<\/script>/)?.[1];

test('待购来源使用与目标物种一致的合法候选联想', () => {
  assert.match(inline, /querySelectorAll\('\[data-purchase-search\],\[data-buy-species-input\]'\)/);
  assert.match(inline, /input\.dataset\.purchaseSearch\|\|input\.dataset\.buyGroup/);
  assert.match(inline, /\[s\.name,s\.id,s\.py\]/);
  assert.match(inline, /没有符合此亲本条件的物种/);
  assert.match(inline, /data-purchase-combo/);
});

test('v1.0.16 使用独立账本并从 v1.0.15 迁移', () => {
  assert.match(inline, /APP_VERSION='1\.0\.16'/);
  assert.match(inline, /STORAGE_KEY='pokemmo_breeding_planner_v1_0_16'/);
  assert.match(inline, /PREVIOUS_STORAGE_KEY='pokemmo_breeding_planner_v1_0_15'/);
  assert.match(inline, /SCHEMA_VERSION=16/);
});

test('新版应用脚本语法有效', () => {
  assert.doesNotThrow(() => new vm.Script(inline.replace(/init\(\);\s*$/, '')));
});

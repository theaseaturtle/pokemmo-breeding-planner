import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const releasePath = new URL('../app/pokemmo-breeding-planner-v1.0.12-2026-08-25.html', import.meta.url);
const html = readFileSync(releasePath, 'utf8');
const inline = html.match(/<script>([\s\S]*)<\/script>/)?.[1];

test('05 阶段移除三张即时成本卡，07 审计仍保留', () => {
  assert.doesNotMatch(html, /<div class="label">亲本待购<\/div>/);
  assert.doesNotMatch(html, /<div class="label">道具待购<\/div>/);
  assert.doesNotMatch(html, /<div class="label">道具 BP<\/div>/);
  assert.match(inline, /function renderPurchaseAudit\(\)/);
  assert.match(inline, /采购进度审计/);
});

test('v1.0.12 使用独立账本并从 v1.0.11 迁移', () => {
  assert.match(inline, /APP_VERSION='1\.0\.12'/);
  assert.match(inline, /STORAGE_KEY='pokemmo_breeding_planner_v1_0_12'/);
  assert.match(inline, /PREVIOUS_STORAGE_KEY='pokemmo_breeding_planner_v1_0_11'/);
  assert.match(inline, /SCHEMA_VERSION=12/);
});

test('新版应用脚本语法有效', () => {
  assert.doesNotThrow(() => new vm.Script(inline.replace(/init\(\);\s*$/, '')));
});

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const releasePath = new URL('../app/pokemmo-breeding-planner-v1.0.17-2026-08-25.html', import.meta.url);
const html = readFileSync(releasePath, 'utf8');
const inline = html.match(/<script>([\s\S]*)<\/script>/)?.[1];

test('已确认购买的真实物种按记录顺序绑定到待购叶子', () => {
  assert.match(inline, /function bindConfirmedParentSources\(stage\)/);
  assert.match(inline, /record\.kind==='PARENT'&&record\.groupId===group\.id/);
  assert.match(inline, /rp\.sources\[leafId\]\.speciesName=confirmed\[index\]/);
  assert.match(inline, /purchaseAllocation='CONFIRMED'/);
  assert.match(inline, /bindConfirmedParentSources\(APP\.stage1\);APP\.stage2=buildStage2/);
});

test('亲本采购变化会清除未执行计划或标记已执行计划过期', () => {
  assert.match(inline, /function invalidateExecutionForAcquisition\(reason\)/);
  assert.match(inline, /steps\.some\(step=>step\.status==='CONFIRMED'\)/);
  assert.match(inline, /else APP\.stage2=null/);
  assert.match(inline, /invalidateExecutionForAcquisition\('亲本采购变化'\)/);
  assert.match(inline, /invalidateExecutionForAcquisition\('撤销亲本采购'\)/);
});

test('v1.0.17 使用独立账本并从 v1.0.16 迁移', () => {
  assert.match(inline, /APP_VERSION='1\.0\.17'/);
  assert.match(inline, /STORAGE_KEY='pokemmo_breeding_planner_v1_0_17'/);
  assert.match(inline, /PREVIOUS_STORAGE_KEY='pokemmo_breeding_planner_v1_0_16'/);
  assert.match(inline, /SCHEMA_VERSION=17/);
  assert.match(inline, /APP\.purchaseRecords=Array\.isArray\(x\.purchaseRecords\)\?x\.purchaseRecords:\[\]/);
  assert.doesNotMatch(inline, /APP\.purchaseRecords=migrated\?\[\]/);
});

test('新版应用脚本语法有效', () => {
  assert.doesNotThrow(() => new vm.Script(inline.replace(/init\(\);\s*$/, '')));
});

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const releasePath = new URL('../app/pokemmo-breeding-planner-v1.0.15-2026-08-25.html', import.meta.url);
const html = readFileSync(releasePath, 'utf8');
const inline = html.match(/<script>([\s\S]*)<\/script>/)?.[1];

test('配种产物使用母方初始形态', () => {
  assert.match(inline, /const EGG_BASE_FOR=\{'大嘴雀':'烈雀','烈咬陆鲨':'圆陆鲨'\}/);
  assert.match(inline, /const maternal=input\.lineageRole==='TARGET_MAINLINE'/);
  assert.match(inline, /speciesName=eggSpeciesFor\(maternal/);
  assert.match(inline, /进化后处理：'\+stage1\.bt\.name\+' → '\+stage1\.species\.name/);
});

test('待购行可直接改选物种并确认购买', () => {
  assert.match(inline, /data-buy-species-input/);
  assert.match(inline, /自动补位只是默认建议/);
  assert.match(inline, /const replacement=confirmParentPurchase\(group,speciesName,quantity,unitPrice,note\)/);
  assert.match(inline, /已更换并登记购入/);
});

test('v1.0.15 使用独立账本并从 v1.0.14 迁移', () => {
  assert.match(inline, /APP_VERSION='1\.0\.15'/);
  assert.match(inline, /STORAGE_KEY='pokemmo_breeding_planner_v1_0_15'/);
  assert.match(inline, /PREVIOUS_STORAGE_KEY='pokemmo_breeding_planner_v1_0_14'/);
  assert.match(inline, /SCHEMA_VERSION=15/);
});

test('新版应用脚本语法有效', () => {
  assert.doesNotThrow(() => new vm.Script(inline.replace(/init\(\);\s*$/, '')));
});

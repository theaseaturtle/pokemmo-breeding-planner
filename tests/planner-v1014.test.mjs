import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const releasePath = new URL('../app/pokemmo-breeding-planner-v1.0.14-2026-08-25.html', import.meta.url);
const html = readFileSync(releasePath, 'utf8');
const inline = html.match(/<script>([\s\S]*)<\/script>/)?.[1];

test('大嘴雀的育种入口是烈雀，最终目标仍是大嘴雀', () => {
  assert.match(inline, /'大嘴雀':\['烈雀','烈雀 → 大嘴雀'\]/);
  assert.match(inline, /进化后处理：'\+stage1\.bt\.name\+' → '\+stage1\.species\.name/);
});

test('执行步骤引用具体的前置步骤产物', () => {
  assert.match(inline, /source:'第 '\+\(stepNoByNodeId\[input\.nodeId\]\|\|'\?'\)\+' 步产出 · '\+input\.output\.speciesName/);
  assert.match(inline, /stepNoByNodeId=Object\.fromEntries/);
});

test('v1.0.14 使用独立账本并从 v1.0.13 迁移', () => {
  assert.match(inline, /APP_VERSION='1\.0\.14'/);
  assert.match(inline, /STORAGE_KEY='pokemmo_breeding_planner_v1_0_14'/);
  assert.match(inline, /PREVIOUS_STORAGE_KEY='pokemmo_breeding_planner_v1_0_13'/);
  assert.match(inline, /SCHEMA_VERSION=14/);
});

test('新版应用脚本语法有效', () => {
  assert.doesNotThrow(() => new vm.Script(inline.replace(/init\(\);\s*$/, '')));
});

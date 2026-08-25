import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const releasePath = new URL('../app/pokemmo-breeding-planner-v1.0.19-2026-08-25.html', import.meta.url);
const html = readFileSync(releasePath, 'utf8');
const inline = html.match(/<script>([\s\S]*)<\/script>/)?.[1];

test('v1.0.19 提供可访问的阶段导航和稳定锚点', () => {
  assert.match(html, /class="skip-link" href="#main-content"/);
  assert.match(html, /class="workflow-nav" aria-label="规划阶段"/);
  for (const id of ['phase-target', 'phase-resources', 'phase-execution', 'phase-audit']) {
    assert.match(html, new RegExp(`id="${id}"`));
    assert.match(html, new RegExp(`href="#${id}"`));
  }
});

test('UI 优化保持离线原生栈并补齐页面元信息', () => {
  assert.match(html, /v1\.0\.19 focused-workbench refinement/);
  assert.match(html, /<meta name="description"/);
  assert.match(html, /<meta name="theme-color" content="#081115">/);
  assert.doesNotMatch(html, /https?:\/\/[^"']+\.(?:css|js)/);
});

test('v1.0.19 使用独立账本并从 v1.0.18 迁移', () => {
  assert.match(inline, /APP_VERSION='1\.0\.19'/);
  assert.match(inline, /STORAGE_KEY='pokemmo_breeding_planner_v1_0_19'/);
  assert.match(inline, /PREVIOUS_STORAGE_KEY='pokemmo_breeding_planner_v1_0_18'/);
  assert.match(inline, /SCHEMA_VERSION=19/);
  assert.match(inline, /已从 v1\.0\.18 迁移完整账本/);
});

test('新版应用脚本语法有效', () => {
  assert.doesNotThrow(() => new vm.Script(inline.replace(/init\(\);\s*$/, '')));
});

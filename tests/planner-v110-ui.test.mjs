import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const releasePath = new URL('../app/pokemmo-breeding-planner-v1.1.0-2026-08-24.html', import.meta.url);
const html = readFileSync(releasePath, 'utf8');
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(match => match[1]);
const appScript = scripts.at(-1);

test('v1.1.0 是独立账本并从 v1.0.9 迁移基础输入', () => {
  assert.match(appScript, /APP_VERSION='1\.1\.0'/);
  assert.match(appScript, /STORAGE_KEY='pokemmo_breeding_planner_v1_1_0'/);
  assert.match(appScript, /PREVIOUS_STORAGE_KEY='pokemmo_breeding_planner_v1_0_9'/);
  assert.match(appScript, /SCHEMA_VERSION=10/);
  assert.match(appScript, /已从 v1\.0\.9 迁移目标/);
});

test('实验 UI 保持 v1.0.9 的数据集与规则集版本', () => {
  assert.match(html, /DATA_VERSION='pokedex-gen1-5-bootstrap-2026-08-24-v1\.0\.9'/);
  assert.match(html, /RULESET_VERSION='pokemmo-breeding-tree-acquisition-ledger-2026-08-24-v1\.0\.9'/);
});

test('单文件内嵌 Geist、GSAP 与 ScrollTrigger，不依赖 CDN', () => {
  assert.match(html, /font-family:Geist/);
  assert.match(html, /data:font\/woff2;base64,/);
  assert.equal(scripts.length, 3);
  assert.match(scripts[0], /3\.15\.0/);
  assert.match(html, /ScrollTrigger/);
  assert.doesNotMatch(html, /<script[^>]+src=/);
  assert.doesNotMatch(html, /<link[^>]+href=/);
});

test('实验版使用可靠双栏、紧凑首屏与轻量动效', () => {
  assert.match(html, /grid-template-columns:minmax\(280px,320px\) minmax\(0,1fr\)/);
  assert.match(html, /\.layout>aside,\.layout>section\{grid-column:auto;min-width:0\}/);
  assert.match(html, /\.masthead\{min-height:360px/);
  assert.match(html, /\.resource-grid\{grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.doesNotMatch(html, /<div class="taste-marquee"/);
  assert.doesNotMatch(html, /<section class="horizontal-accordions"/);
  assert.doesNotMatch(appScript, /scrub:true/);
  assert.doesNotMatch(appScript, /taste-step-/);
  assert.match(appScript, /duration:\.7/);
  assert.match(html, /prefers-reduced-motion:reduce/);
  assert.doesNotMatch(html, /0[1-7] \/ /);
});

test('新版应用脚本语法有效', () => {
  const withoutStartup = appScript.replace(/init\(\);initTasteMotion\(\);\s*$/, '');
  assert.doesNotThrow(() => new vm.Script(withoutStartup));
});

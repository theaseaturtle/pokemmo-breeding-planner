import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const releasePath = new URL('../app/pokemmo-breeding-planner-v1.0.20-2026-08-25.html', import.meta.url);
const html = readFileSync(releasePath, 'utf8');
const inline = html.match(/<script>([\s\S]*)<\/script>/)?.[1] ?? '';

test('水箭龟和其他进化形态统一解析为家族最初孵蛋形态', () => {
  const helperSource = inline.match(/const EGG_BASE_IDS=.*?function eggSpeciesFor\(name\)\{[^\n]+\}/)?.[0];
  assert.ok(helperSource, '缺少孵蛋形态解析函数');
  const species = {
    水箭龟: { id: '#009' },
    大嘴雀: { id: '#022' },
    烈咬陆鲨: { id: '#445' },
  };
  const context = {
    APP: { byId: { '#007': { name: '杰尼龟' }, '#021': { name: '烈雀' }, '#443': { name: '圆陆鲨' } } },
    findSpecies: name => species[name],
  };
  vm.createContext(context);
  vm.runInContext(`${helperSource};this.eggSpeciesFor=eggSpeciesFor;this.baseCount=EGG_BASE_IDS.length`, context);
  assert.equal(context.baseCount, 649);
  assert.equal(context.eggSpeciesFor('水箭龟'), '杰尼龟');
  assert.equal(context.eggSpeciesFor('大嘴雀'), '烈雀');
  assert.equal(context.eggSpeciesFor('烈咬陆鲨'), '圆陆鲨');
});

test('当前路线不能绑定碰撞分组中的旧目标或已消耗采购', () => {
  const bindSource = inline.match(/function bindConfirmedParentSources\(stage\)\{[^\n]+\}/)?.[0];
  assert.ok(bindSource, '缺少已购亲本绑定函数');
  const context = {
    APP: {
      purchaseRecords: [
        { kind: 'PARENT', groupId: 'shared', speciesName: '烈咬陆鲨', quantity: 1, consumed: 0, transferred: 0 },
        { kind: 'PARENT', groupId: 'shared', speciesName: '水箭龟', quantity: 1, consumed: 1, transferred: 0 },
      ],
    },
  };
  vm.createContext(context);
  vm.runInContext(`${bindSource};this.bindConfirmedParentSources=bindConfirmedParentSources`, context);
  const stage = {
    resourcePlan: {
      groups: [{ id: 'shared', leafIds: ['leaf-1'], allowed: [{ name: '水箭龟' }] }],
      sources: { 'leaf-1': { type: 'PURCHASE', speciesName: '水箭龟', purchaseAllocation: 'FALLBACK' } },
    },
  };
  context.bindConfirmedParentSources(stage);
  assert.equal(stage.resourcePlan.sources['leaf-1'].speciesName, '水箭龟');
  assert.equal(stage.resourcePlan.sources['leaf-1'].purchaseAllocation, 'FALLBACK');
});

test('切换目标路线会在确认后清空整个方案采购池但不触碰长期库存', () => {
  const helperSource = inline.match(/function confirmRouteReplacement\(\)\{[^\n]+\}/)?.[0];
  assert.ok(helperSource, '缺少路线切换采购池确认函数');
  const inventory = [{ id: 'inventory-1', speciesName: '水箭龟' }];
  const context = {
    APP: {
      stage1: { species: { name: '烈咬陆鲨' } },
      purchaseRecords: [{ kind: 'PARENT' }, { kind: 'ITEM' }],
      overrides: { old: true },
      inventory,
    },
    selected: () => ({ name: '水箭龟' }),
    confirm: () => true,
  };
  vm.createContext(context);
  vm.runInContext(`${helperSource};this.confirmRouteReplacement=confirmRouteReplacement`, context);
  assert.equal(context.confirmRouteReplacement(), true);
  assert.equal(context.APP.purchaseRecords.length, 0);
  assert.equal(Object.keys(context.APP.overrides).length, 0);
  assert.equal(context.APP.inventory, inventory);
});

test('迁移时会拒绝亲本或孵蛋产物不一致的旧执行方案', () => {
  const helperSource = inline.match(/function executionPlanIsConsistent\(stage1,stage2\)\{[^\n]+\}/)?.[0];
  assert.ok(helperSource, '缺少旧执行方案一致性校验');
  const context = { eggSpeciesFor: name => name === '水箭龟' ? '杰尼龟' : name };
  vm.createContext(context);
  vm.runInContext(`${helperSource};this.executionPlanIsConsistent=executionPlanIsConsistent`, context);
  const stage1 = {
    resourcePlan: {
      groups: [{ leafIds: ['leaf-1'], allowed: [{ name: '水箭龟' }] }],
      sources: { 'leaf-1': { type: 'PURCHASE', speciesName: '烈咬陆鲨' } },
    },
  };
  const stage2 = {
    steps: [{
      kind: 'BREEDING',
      parentLoadouts: [{ speciesName: '水箭龟' }, { speciesName: '小海狮' }],
      output: { speciesName: '水箭龟' },
    }],
  };
  assert.equal(context.executionPlanIsConsistent(stage1, stage2), false);
});

test('配种树以实际母方而不是最终目标计算孵蛋物种', () => {
  assert.match(inline, /const maternal=input\.left\.kind==='LEAF'/);
  assert.doesNotMatch(inline, /const maternal=input\.lineageRole==='TARGET_MAINLINE'\?bt\.name/);
});

test('v1.0.20 使用独立账本并从 v1.0.19 迁移', () => {
  assert.match(inline, /APP_VERSION='1\.0\.20'/);
  assert.match(inline, /STORAGE_KEY='pokemmo_breeding_planner_v1_0_20'/);
  assert.match(inline, /PREVIOUS_STORAGE_KEY='pokemmo_breeding_planner_v1_0_19'/);
  assert.match(inline, /SCHEMA_VERSION=20/);
  assert.doesNotThrow(() => new vm.Script(inline.replace(/init\(\);\s*$/, '')));
});

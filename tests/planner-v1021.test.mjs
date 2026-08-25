import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const releasePath = new URL('../app/pokemmo-breeding-planner-v1.0.21-2026-08-25.html', import.meta.url);
const html = readFileSync(releasePath, 'utf8');
const inline = html.match(/<script>([\s\S]*)<\/script>/)?.[1] ?? '';

function loadPlanner() {
  const script = inline.replace(
    /init\(\);\s*$/,
    'globalThis.__planner={APP,POKEDEX_RAW,makeSpecies,diagnosis,resourcePlan,resolveTreeSpecies,bindConfirmedParentSources};',
  );
  const context = vm.createContext({
    console,
    confirm: () => true,
    structuredClone: globalThis.structuredClone,
    setTimeout,
    clearTimeout,
  });
  vm.runInContext(script, context);
  const planner = context.__planner;
  planner.APP.catalog = planner.POKEDEX_RAW.map(planner.makeSpecies);
  planner.APP.byName = Object.fromEntries(planner.APP.catalog.map(species => [species.name, species]));
  planner.APP.byId = Object.fromEntries(planner.APP.catalog.map(species => [species.id, species]));
  return planner;
}

test('确认大钳蟹母方后重新计算当前节点和所有下游产物', () => {
  const planner = loadPlanner();
  const target = planner.APP.byName['刺甲贝'];
  const speedLeaf = { kind: 'LEAF', id: 'leaf-speed', gender: 'F', iv: { key: '速度', value: '31' }, nature: 'None' };
  const attackLeaf = { kind: 'LEAF', id: 'leaf-attack', gender: 'M', iv: { key: '物攻', value: '31' }, nature: 'None' };
  const mainLeaf = { kind: 'LEAF', id: 'leaf-main', gender: 'F', iv: null, nature: '固执' };
  const directNode = {
    kind: 'NODE', id: 'node-direct', lineageRole: 'DONOR', left: speedLeaf, right: attackLeaf,
    ivs: [{ key: '速度', value: '31' }, { key: '物攻', value: '31' }], items: { braces: ['速度', '物攻'], everstone: 0 },
    output: { id: 'temp-direct', speciesName: '大舌贝', gender: 'F', ivs: [], nature: 'None' },
  };
  const root = {
    kind: 'NODE', id: 'node-root', lineageRole: 'TARGET_MAINLINE', left: mainLeaf, right: directNode,
    ivs: [{ key: '速度', value: '31' }, { key: '物攻', value: '31' }], items: { braces: ['速度'], everstone: 1 },
    output: { id: 'temp-root', speciesName: '大舌贝', gender: 'F', ivs: [], nature: '固执' },
  };
  const group = { id: 'group-speed', leafIds: [speedLeaf.id], allowed: [planner.APP.byName['大舌贝'], planner.APP.byName['大钳蟹']] };
  const resourcePlan = {
    groups: [group],
    sources: {
      [speedLeaf.id]: { type: 'PURCHASE', speciesName: '大舌贝' },
      [attackLeaf.id]: { type: 'PURCHASE', speciesName: '菊石兽' },
      [mainLeaf.id]: { type: 'PURCHASE', speciesName: '刺甲贝' },
    },
    tree: { routeType: 'GENDERED', root, nodes: [directNode, root], leaves: [speedLeaf, attackLeaf, mainLeaf] },
  };
  planner.resolveTreeSpecies(resourcePlan.tree, resourcePlan.sources, target);
  assert.equal(directNode.output.speciesName, '大舌贝');

  planner.APP.purchaseRecords = [{
    kind: 'PARENT', groupId: group.id, speciesName: '大钳蟹', quantity: 1, consumed: 0, transferred: 0,
  }];
  planner.bindConfirmedParentSources({ bt: target, resourcePlan });

  assert.equal(resourcePlan.sources[speedLeaf.id].speciesName, '大钳蟹');
  assert.equal(directNode.output.speciesName, '大钳蟹');
  assert.equal(resourcePlan.tree.root.output.speciesName, '大舌贝');
});

test('执行卡明确显示本次孵化产物和物种继承规则', () => {
  assert.match(inline, /本次孵化产物：/);
  assert.match(inline, /继承母方/);
  assert.match(inline, /母方决定物种/);
});

test('结果区区分用户目标和配种完成产物且不生成进化步骤', () => {
  assert.match(inline, /配种完成产物/);
  assert.match(inline, /后续进化不纳入执行计划/);
  assert.doesNotMatch(inline, /kind:'POST_PROCESS'/);
  assert.doesNotMatch(inline, /进化后处理：/);
});

test('v1.0.21 使用独立账本并从 v1.0.20 重算迁移', () => {
  assert.match(inline, /APP_VERSION='1\.0\.21'/);
  assert.match(inline, /STORAGE_KEY='pokemmo_breeding_planner_v1_0_21'/);
  assert.match(inline, /PREVIOUS_STORAGE_KEY='pokemmo_breeding_planner_v1_0_20'/);
  assert.match(inline, /if\(migrated&&APP\.stage1\)APP\.stage1=makeReconciledStage1\(\)/);
  assert.match(inline, /repairStage2Presentation\(APP\.stage2\)/);
});

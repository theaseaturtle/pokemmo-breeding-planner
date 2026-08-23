import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const stablePath = new URL('../app/pokemmo-breeding-planner-v1.0.5-2026-08-19.html', import.meta.url);
const releasePath = new URL('../app/pokemmo-breeding-planner-v1.0.6-2026-08-23.html', import.meta.url);

function inlineScript(path) {
  const html = readFileSync(path, 'utf8');
  const script = html.match(/<script>([\s\S]*)<\/script>/)?.[1];
  assert.ok(script, `${path.pathname} 必须包含内联脚本`);
  return script;
}

function topLevelFunctionNames(script) {
  return [...script.matchAll(/^function\s+([A-Za-z_$][\w$]*)\s*\(/gm)].map(match => match[1]);
}

function loadPlanner(path) {
  const script = inlineScript(path).replace(
    /init\(\);\s*$/,
    'globalThis.__planner = { APP, POKEDEX_RAW, makeSpecies, diagnosis, createTree, legalSpecies, resourcePlan };',
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
  return planner;
}

function behaviorSummary(planner) {
  const normal = planner.APP.byName['妙蛙种子'];
  const genderless = planner.APP.byName['小磁怪'];
  const maleOnly = planner.APP.byName['尼多朗'];
  const normalIvs = [
    { key: '生命', value: '31' },
    { key: '物攻', value: '31' },
    { key: '物防', value: '31' },
  ];
  planner.APP.target.nature = 'None';
  planner.APP.target.finalGender = 'RANDOM';
  planner.APP.pricing.braceMode = 'BP';
  planner.APP.pricing.ivPrices = { 生命: 0, 物攻: 0, 物防: 0, 特攻: 0, 特防: 0, 速度: 0 };
  planner.APP.inventory = [];
  planner.APP.items = { everstone: 0, brace: {} };

  const normalTree = planner.createTree(normal, normalIvs, 'None');
  const genderlessTree = planner.createTree(genderless, normalIvs.slice(0, 2), 'None');
  const pairingLeaf = genderlessTree.leaves.find(leaf => leaf.role === 'GENDERLESS_PAIRING_PARENT');
  const plan = planner.resourcePlan(
    normal,
    normal,
    normalIvs,
    planner.diagnosis(normal, normal, normalIvs),
  );

  return {
    normalTree: { leaves: normalTree.leaves.length, nodes: normalTree.nodes.length },
    genderlessTree: {
      routeType: genderlessTree.routeType,
      partners: Array.from(planner.legalSpecies(pairingLeaf, genderless), item => item.name).sort(),
    },
    maleOnlyDiagnosis: planner.diagnosis(maleOnly, maleOnly, normalIvs).outcomeClass,
    costs: { itemBp: plan.itemBp, itemYen: plan.itemYen, breedingYen: plan.breedingYen },
  };
}

test('v1.0.6 只保留一套顶层函数，并保留 v1.0.5 的全部函数接口', () => {
  assert.ok(existsSync(releasePath), 'v1.0.6 尚未生成');
  const stableNames = new Set(topLevelFunctionNames(inlineScript(stablePath)));
  const releaseNames = topLevelFunctionNames(inlineScript(releasePath));
  const counts = new Map(releaseNames.map(name => [name, releaseNames.filter(item => item === name).length]));

  assert.deepEqual([...counts.entries()].filter(([, count]) => count !== 1), []);
  assert.deepEqual(new Set(releaseNames), stableNames);
});

test('v1.0.6 的核心规划结果与 v1.0.5 当前运行行为一致', () => {
  assert.deepEqual(
    behaviorSummary(loadPlanner(releasePath)),
    behaviorSummary(loadPlanner(stablePath)),
  );
});

test('v1.0.6 使用独立的应用版本和本地账本命名空间', () => {
  const script = inlineScript(releasePath);
  assert.match(script, /APP_VERSION='1\.0\.6'/);
  assert.match(script, /STORAGE_KEY='pokemmo_breeding_planner_v1_0_6'/);
  assert.match(script, /SCHEMA_VERSION=6/);
});

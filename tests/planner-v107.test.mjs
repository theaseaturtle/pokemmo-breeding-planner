import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const stablePath = new URL('../app/pokemmo-breeding-planner-v1.0.6-2026-08-23.html', import.meta.url);
const releasePath = new URL('../app/pokemmo-breeding-planner-v1.0.7-2026-08-24.html', import.meta.url);

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
    'globalThis.__planner = { APP, POKEDEX_RAW, makeSpecies, diagnosis, createTree, legalSpecies, resourcePlan, buildStage2 };',
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

function normalPlan(planner, inventory = []) {
  const target = planner.APP.byName['妙蛙种子'];
  const ivs = [
    { key: '物攻', value: '31' },
    { key: '速度', value: '31' },
  ];
  planner.APP.target.nature = '固执';
  planner.APP.target.finalGender = 'F';
  planner.APP.target.donorEggGroupBySpecies = { 妙蛙种子: '植物' };
  planner.APP.pricing.ivPrices = { 生命: 0, 物攻: 0, 物防: 0, 特攻: 0, 特防: 0, 速度: 0 };
  planner.APP.inventory = inventory;
  return planner.resourcePlan(target, target, ivs, planner.diagnosis(target, target, ivs));
}

test('双蛋组目标必须显式选择一个活跃捐赠蛋组', () => {
  const planner = loadPlanner(releasePath);
  const target = planner.APP.byName['妙蛙种子'];
  const ivs = [
    { key: '物攻', value: '31' },
    { key: '速度', value: '31' },
  ];
  planner.APP.target.nature = '固执';
  planner.APP.target.finalGender = 'F';

  const missing = planner.diagnosis(target, target, ivs);
  assert.equal(missing.code, 'DONOR_EGG_GROUP_REQUIRED');
  assert.equal(missing.outcomeClass, 'unsupported');

  planner.APP.target.donorEggGroupBySpecies = { 妙蛙种子: '植物' };
  const selected = planner.diagnosis(target, target, ivs);
  const plan = planner.resourcePlan(target, target, ivs, selected);
  assert.equal(selected.outcomeClass, 'plannable');
  assert.equal(plan.activeDonorEggGroup, '植物');
});

test('速度百变怪可以作为妙蛙种子路线的 IV 捐赠亲本', () => {
  const planner = loadPlanner(releasePath);
  const plan = normalPlan(planner, [{
    id: 'inventory-ditto-speed',
    speciesName: '百变怪',
    gender: 'GENDERLESS',
    nature: 'None',
    quantity: 1,
    ivEntries: [{ key: '速度', value: '31' }],
  }]);
  const speedDonor = plan.groups.find(group => group.gender === 'M' && group.iv?.key === '速度');
  const source = plan.sources[speedDonor.leafIds[0]];

  assert.ok(speedDonor.allowed.some(species => species.name === '百变怪'));
  assert.equal(speedDonor.inventory.length, 1);
  assert.equal(source.type, 'INVENTORY');
  assert.equal(source.inventoryId, 'inventory-ditto-speed');
  assert.equal(source.speciesName, '百变怪');
});

test('百变怪不能替代目标物种的性格主线亲本', () => {
  const planner = loadPlanner(releasePath);
  const plan = normalPlan(planner, [{
    id: 'inventory-ditto-nature',
    speciesName: '百变怪',
    gender: 'GENDERLESS',
    nature: '固执',
    quantity: 1,
    ivEntries: [],
  }]);
  const natureMainline = plan.groups.find(group => group.type === 'NATURE_0');

  assert.deepEqual(Array.from(natureMainline.allowed, species => species.name), ['妙蛙种子']);
  assert.equal(natureMainline.inventory.length, 0);
  assert.equal(plan.sources[natureMainline.leafIds[0]].type, 'PURCHASE');
});

test('同一活跃蛋组的雌性亲本可构建真实物种的雄性捐赠者', () => {
  const planner = loadPlanner(releasePath);
  const plan = normalPlan(planner, [
    {
      id: 'inventory-oddish-attack',
      speciesName: '走路草',
      gender: 'F',
      nature: 'None',
      quantity: 1,
      ivEntries: [{ key: '物攻', value: '31' }],
    },
    {
      id: 'inventory-bellsprout-speed',
      speciesName: '喇叭芽',
      gender: 'M',
      nature: 'None',
      quantity: 1,
      ivEntries: [{ key: '速度', value: '31' }],
    },
  ]);
  const attackFemale = plan.groups.find(group => group.gender === 'F' && group.iv?.key === '物攻');
  const speedMale = plan.groups.find(group => group.gender === 'M' && group.iv?.key === '速度');
  const donorNode = plan.tree.nodes.find(node => node.branch === 'PURE' && node.level === 2 && node.outputGender === 'M');
  const finalNode = plan.tree.root;

  assert.equal(plan.sources[attackFemale.leafIds[0]].speciesName, '走路草');
  assert.equal(plan.sources[speedMale.leafIds[0]].speciesName, '喇叭芽');
  assert.equal(donorNode.output.speciesName, '走路草');
  assert.equal(donorNode.output.gender, 'M');
  assert.equal(finalNode.output.speciesName, '妙蛙种子');
  assert.equal(plan.gender.pureMale, 5000);
});

test('执行计划显示捐赠子树的真实中间物种', () => {
  const planner = loadPlanner(releasePath);
  const target = planner.APP.byName['妙蛙种子'];
  const ivs = [
    { key: '物攻', value: '31' },
    { key: '速度', value: '31' },
  ];
  const plan = normalPlan(planner, [
    {
      id: 'inventory-oddish-attack',
      speciesName: '走路草',
      gender: 'F',
      nature: 'None',
      quantity: 1,
      ivEntries: [{ key: '物攻', value: '31' }],
    },
    {
      id: 'inventory-bellsprout-speed',
      speciesName: '喇叭芽',
      gender: 'M',
      nature: 'None',
      quantity: 1,
      ivEntries: [{ key: '速度', value: '31' }],
    },
  ]);
  const execution = planner.buildStage2({
    meta: { fingerprint: 'fixture' },
    species: target,
    bt: target,
    ivs,
    nature: '固执',
    finalGender: 'F',
    resourcePlan: plan,
  });
  const donorStep = execution.steps.find(step => step.branch === 'PURE' && step.level === 2);

  assert.equal(donorStep.lineageRole, 'DONOR');
  assert.equal(donorStep.output.speciesName, '走路草');
  assert.match(donorStep.output.label, /^走路草/);
});

test('捐赠节点不会生成百变怪与百变怪的非法配对', () => {
  const planner = loadPlanner(releasePath);
  const plan = normalPlan(planner, [
    {
      id: 'inventory-ditto-attack',
      speciesName: '百变怪',
      gender: 'GENDERLESS',
      nature: 'None',
      quantity: 2,
      ivEntries: [{ key: '物攻', value: '31' }],
    },
    {
      id: 'inventory-ditto-speed',
      speciesName: '百变怪',
      gender: 'GENDERLESS',
      nature: 'None',
      quantity: 1,
      ivEntries: [{ key: '速度', value: '31' }],
    },
  ]);
  const donorNode = plan.tree.nodes.find(node => node.branch === 'PURE' && node.level === 2 && node.outputGender === 'M');
  const donorLeaves = [donorNode.left, donorNode.right];
  const donorSources = donorLeaves.map(leaf => plan.sources[leaf.id]);

  assert.equal(donorSources.filter(source => source.type === 'INVENTORY').length, 1);
  assert.equal(donorSources.filter(source => source.type === 'PURCHASE').length, 1);
  assert.equal(donorSources.find(source => source.type === 'PURCHASE').speciesName, '妙蛙种子');
  assert.equal(donorNode.output.speciesName, '妙蛙种子');
});

test('自动分配优先保留百变怪并限制为活跃蛋组', () => {
  const planner = loadPlanner(releasePath);
  const plan = normalPlan(planner, [
    {
      id: 'inventory-ditto-speed',
      speciesName: '百变怪',
      gender: 'GENDERLESS',
      nature: 'None',
      quantity: 1,
      ivEntries: [{ key: '速度', value: '31' }],
    },
    {
      id: 'inventory-bellsprout-speed',
      speciesName: '喇叭芽',
      gender: 'M',
      nature: 'None',
      quantity: 1,
      ivEntries: [{ key: '速度', value: '31' }],
    },
    {
      id: 'inventory-cubone-attack',
      speciesName: '卡拉卡拉',
      gender: 'F',
      nature: 'None',
      quantity: 1,
      ivEntries: [{ key: '物攻', value: '31' }],
    },
  ]);
  const speedMale = plan.groups.find(group => group.gender === 'M' && group.iv?.key === '速度');
  const attackFemale = plan.groups.find(group => group.gender === 'F' && group.iv?.key === '物攻');

  assert.equal(plan.sources[speedMale.leafIds[0]].speciesName, '喇叭芽');
  assert.equal(plan.assigned.has('inventory-ditto-speed'), false);
  assert.equal(attackFemale.allowed.some(species => species.name === '卡拉卡拉'), false);
  assert.equal(plan.sources[attackFemale.leafIds[0]].type, 'PURCHASE');
});

test('高阶亲本只在用户手动覆盖后进入分配', () => {
  const planner = loadPlanner(releasePath);
  const inventory = [{
    id: 'inventory-oddish-2v',
    speciesName: '走路草',
    gender: 'F',
    nature: 'None',
    quantity: 1,
    ivEntries: [
      { key: '物攻', value: '31' },
      { key: '速度', value: '31' },
    ],
  }];
  const automatic = normalPlan(planner, inventory);
  const attackFemale = automatic.groups.find(group => group.gender === 'F' && group.iv?.key === '物攻');
  assert.equal(automatic.sources[attackFemale.leafIds[0]].type, 'PURCHASE');

  planner.APP.overrides[attackFemale.id] = { inventoryId: 'inventory-oddish-2v' };
  const overridden = normalPlan(planner, inventory);
  assert.equal(overridden.sources[attackFemale.leafIds[0]].type, 'INVENTORY');
  assert.equal(overridden.sources[attackFemale.leafIds[0]].speciesName, '走路草');
});

test('没有百变怪库存时，v1.0.7 保持 v1.0.6 的规划结果', () => {
  const summary = plan => ({
    nodes: plan.tree.nodes.length,
    leaves: plan.tree.leaves.length,
    groups: plan.groups.map(group => ({
      type: group.type,
      gender: group.gender,
      iv: group.iv ? `${group.iv.key}:${group.iv.value}` : null,
      nature: group.nature,
      quantity: group.quantity,
      inventory: group.inventory.length,
      purchase: group.purchase.map(item => `${item.speciesName}:${item.quantity}`),
    })),
    itemYen: plan.itemYen,
    itemBp: plan.itemBp,
    breedingYen: plan.breedingYen,
    summary: plan.summary,
  });

  assert.equal(
    JSON.stringify(summary(normalPlan(loadPlanner(releasePath)))),
    JSON.stringify(summary(normalPlan(loadPlanner(stablePath)))),
  );
});

test('v1.0.7 使用独立版本和本地账本命名空间', () => {
  assert.ok(existsSync(releasePath), 'v1.0.7 尚未生成');
  const script = inlineScript(releasePath);
  const names = topLevelFunctionNames(script);
  const counts = new Map(names.map(name => [name, names.filter(item => item === name).length]));

  assert.deepEqual([...counts.entries()].filter(([, count]) => count !== 1), []);
  assert.match(script, /APP_VERSION='1\.0\.7'/);
  assert.match(script, /RELEASE_DATE='2026-08-24'/);
  assert.match(script, /STORAGE_KEY='pokemmo_breeding_planner_v1_0_7'/);
  assert.match(script, /SCHEMA_VERSION=8/);
});

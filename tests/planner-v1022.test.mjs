import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const releasePath = new URL('../app/pokemmo-breeding-planner-v1.0.22-2026-08-26.html', import.meta.url);
const html = readFileSync(releasePath, 'utf8');
const inline = html.match(/<script>([\s\S]*)<\/script>/)?.[1] ?? '';

function loadPlanner() {
  const script = inline.replace(
    /init\(\);\s*$/,
    'globalThis.__planner={APP,POKEDEX_RAW,makeSpecies,diagnosis,createTree,groupsFor,leafFit,sexFee,resourcePlan,buildStage2};',
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

function fiveIvs() {
  return ['生命', '物攻', '物防', '特防', '速度'].map((key, index) => ({ key, value: '31', index }));
}

test('纯雄目标使用目标家族主线和逐级外购百变怪', () => {
  const planner = loadPlanner();
  const tauros = planner.APP.byName['肯泰罗'];
  planner.APP.target.nature = '固执';
  planner.APP.target.finalGender = 'M';

  assert.equal(tauros.supportState, 'PLANNABLE');
  assert.equal(planner.diagnosis(tauros, tauros, fiveIvs()).code, 'OK');

  const tree = planner.createTree(tauros, fiveIvs(), '固执');
  assert.equal(tree.routeType, 'MALE_ONLY');
  assert.equal(tree.nodes.length, 5);
  assert.equal(tree.leaves.filter(leaf => leaf.role === 'TARGET_MAINLINE').length, 1);

  const dittoStages = tree.leaves.filter(leaf => leaf.role === 'DITTO_STAGE');
  assert.deepEqual(Array.from(dittoStages, leaf => leaf.ivs.length), [1, 2, 3, 4, 5]);
  assert.ok(dittoStages.every(leaf => leaf.speciesName === '百变怪' && leaf.gender === 'GENDERLESS'));
  assert.ok(tree.nodes.every(node => node.right.kind === 'LEAF' && node.right.role === 'DITTO_STAGE'));
  assert.ok(tree.nodes.every(node => node.output.gender === 'M'));
});

test('无性格纯雄 5V 路线不会构造百变怪互配子树', () => {
  const planner = loadPlanner();
  const tauros = planner.APP.byName['肯泰罗'];
  planner.APP.target.nature = 'None';
  planner.APP.target.finalGender = 'M';

  const tree = planner.createTree(tauros, fiveIvs(), 'None');
  assert.equal(tree.routeType, 'MALE_ONLY');
  assert.equal(tree.nodes.length, 4);
  assert.deepEqual(
    Array.from(tree.leaves.filter(leaf => leaf.role === 'DITTO_STAGE'), leaf => leaf.ivs.length),
    [1, 2, 3, 4],
  );
  assert.ok(tree.nodes.every(node => !(node.left.speciesName === '百变怪' && node.right.speciesName === '百变怪')));
});

test('多V百变怪阶段只接受包含完整 IV 组合的百变怪', () => {
  const planner = loadPlanner();
  const tauros = planner.APP.byName['肯泰罗'];
  const tree = planner.createTree(tauros, fiveIvs(), '固执');
  const stage = tree.leaves.find(leaf => leaf.role === 'DITTO_STAGE' && leaf.ivs.length === 3);

  const exact = { speciesName: '百变怪', gender: 'GENDERLESS', nature: 'None', quantity: 1, ivEntries: stage.ivs };
  const missing = { ...exact, ivEntries: stage.ivs.slice(0, 2) };
  const wrongSpecies = { ...exact, speciesName: '肯泰罗', gender: 'M' };

  assert.equal(planner.leafFit(exact, stage, tauros, fiveIvs()).level, 'STRICT');
  assert.equal(planner.leafFit(missing, stage, tauros, fiveIvs()).level, 'NO');
  assert.equal(planner.leafFit(wrongSpecies, stage, tauros, fiveIvs()).level, 'NO');

  const group = planner.groupsFor(tree, tauros).find(item => item.leafIds.includes(stage.id));
  assert.deepEqual(Array.from(group.allowed, species => species.name), ['百变怪']);
  assert.equal(group.unitPrice, 0);
});

test('资源方案和执行方案使用同一组真实百变怪阶段', () => {
  const planner = loadPlanner();
  const tauros = planner.APP.byName['肯泰罗'];
  const ivs = fiveIvs();
  planner.APP.target.speciesName = '肯泰罗';
  planner.APP.target.nature = '固执';
  planner.APP.target.finalGender = 'M';
  for (const iv of ivs) planner.APP.target.ivs[iv.key] = { enabled: true, value: '31' };

  const diagnosis = planner.diagnosis(tauros, tauros, ivs);
  const plan = planner.resourcePlan(tauros, tauros, ivs, diagnosis);
  const dittoGroups = plan.groups.filter(group => group.role === 'DITTO_STAGE');
  assert.deepEqual(Array.from(dittoGroups, group => group.ivs.length), [1, 2, 3, 4, 5]);
  assert.ok(dittoGroups.every(group => group.purchase.length === 1 && group.purchase[0].speciesName === '百变怪'));

  const stage1 = {
    meta: { fingerprint: 'male-only-fixture' },
    bt: tauros,
    resourcePlan: plan,
  };
  const execution = planner.buildStage2(stage1);
  assert.equal(execution.steps.length, 5);
  assert.ok(execution.steps.every(step => step.parentLoadouts[1].speciesName === '百变怪'));
  assert.deepEqual(Array.from(execution.steps, step => step.parentLoadouts[1].ivs.length), [1, 2, 3, 4, 5]);
  assert.ok(execution.steps.every(step => step.lockInstruction === '无需锁性别（固定雄性）'));
});

test('固定单性别产物不收性别选择费', () => {
  const planner = loadPlanner();
  assert.equal(planner.sexFee(planner.APP.byName['肯泰罗'], 'M'), 0);
  assert.equal(planner.sexFee(planner.APP.byName['吉利蛋'], 'F'), 0);
});

test('百变怪不能作为育种目标且特殊成对产物仍保持阻断', () => {
  const planner = loadPlanner();
  const ditto = planner.APP.byName['百变怪'];
  assert.equal(planner.diagnosis(ditto, ditto, fiveIvs()).code, 'DITTO_TARGET_UNAVAILABLE');
  assert.equal(planner.APP.byName['尼多朗'].supportState, 'RULES_UNCONFIRMED');
  assert.equal(planner.APP.byName['电萤虫'].supportState, 'RULES_UNCONFIRMED');
});

test('v1.0.22 使用独立账本并公开纯雄采购说明', () => {
  assert.match(inline, /APP_VERSION='1\.0\.22'/);
  assert.match(inline, /STORAGE_KEY='pokemmo_breeding_planner_v1_0_22'/);
  assert.match(inline, /PREVIOUS_STORAGE_KEY='pokemmo_breeding_planner_v1_0_21'/);
  assert.match(inline, /RULESET_VERSION='pokemmo-breeding-tree-single-sex-2026-08-26-v1\.0\.10'/);
  assert.match(inline, /多V百变怪不能由1V百变怪合成/);
  assert.match(inline, /百变怪不能互相配种/);
});

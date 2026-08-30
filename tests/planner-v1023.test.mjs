import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const releasePath = new URL('../app/pokemmo-breeding-planner-v1.0.24-2026-08-30.html', import.meta.url);
const html = readFileSync(releasePath, 'utf8');

test('v1.0.23 不使用任何浏览器本地缓存', () => {
  assert.doesNotMatch(html, /localStorage|STORAGE_KEY|PREVIOUS_STORAGE_KEY/);
});

function loadPlanner() {
  const script = html.match(/<script>([\s\S]*)<\/script>/)?.[1].replace(/init\(\);\s*$/, 'globalThis.x={APP,POKEDEX_RAW,BABY_RULES,makeSpecies,diagnosis,resourcePlan,buildStage2};');
  const context = vm.createContext({ console, confirm: () => true, structuredClone: globalThis.structuredClone, setTimeout, clearTimeout });
  vm.runInContext(script, context);
  const planner = context.x;
  planner.APP.catalog = planner.POKEDEX_RAW.map(planner.makeSpecies);
  planner.APP.byName = Object.fromEntries(planner.APP.catalog.map((s) => [s.name, s]));
  planner.APP.byId = Object.fromEntries(planner.APP.catalog.map((s) => [s.id, s]));
  return planner;
}

test('幼年体目标映射到可繁殖亲本并要求母方熏炉', () => {
  const planner = loadPlanner();
  planner.APP.target.speciesName = '露力丽';
  planner.APP.target.ivs['物攻'] = { enabled: true, value: '31' };
  planner.APP.target.ivs['速度'] = { enabled: true, value: '31' };
  planner.APP.target.donorEggGroupBySpecies['玛力露'] = '妖精';
  const species = planner.APP.byName['露力丽'];
  const target = planner.APP.byName['玛力露'];
  const ivs = [{ key: '物攻', value: '31' }, { key: '速度', value: '31' }];
  const diagnosis = planner.diagnosis(species, target, ivs);
  const plan = planner.resourcePlan(species, target, ivs, diagnosis);
  assert.equal(species.supportState, 'PLANNABLE');
  assert.equal(diagnosis.code, 'OK');
  assert.equal(plan.tree.root.output.speciesName, '露力丽');
  assert.equal(plan.tree.root.babyIncense, '海潮熏香');
  assert.equal(plan.items.find((item) => item.key === 'incense:sea-incense')?.need, 1);
  const execution = planner.buildStage2({ meta: { fingerprint: 'baby' }, bt: target, resourcePlan: plan });
  assert.equal(execution.steps.at(-1).output.speciesName, '露力丽');
  assert.equal(execution.steps.at(-1).parentLoadouts[0].heldItem, '海潮熏香');
});

test('幼年体目标的母方没有熏炉时仍会显示采购需求', () => {
  const planner = loadPlanner();
  planner.APP.target.speciesName = '小卡比兽';
  planner.APP.target.ivs['速度'] = { enabled: true, value: '31' };
  planner.APP.target.ivs['物攻'] = { enabled: true, value: '31' };
  const species = planner.APP.byName['小卡比兽'];
  const target = planner.APP.byName['卡比兽'];
  const ivs = [{ key: '物攻', value: '31' }, { key: '速度', value: '31' }];
  const plan = planner.resourcePlan(species, target, ivs, planner.diagnosis(species, target, ivs));
  assert.equal(plan.items.find((item) => item.key === 'incense:full-incense')?.purchase, 1);
});

test('小卡比兽 2V 固执执行步骤每一步都是一雌一雄', () => {
  const planner = loadPlanner();
  planner.APP.target.speciesName = '小卡比兽';
  planner.APP.target.nature = '固执';
  planner.APP.target.finalGender = 'F';
  planner.APP.target.donorEggGroupBySpecies['卡比兽'] = '怪兽';
  for (const key of ['物攻', '速度']) planner.APP.target.ivs[key] = { enabled: true, value: '31' };
  const species = planner.APP.byName['小卡比兽'];
  const target = planner.APP.byName['卡比兽'];
  const ivs = [{ key: '物攻', value: '31' }, { key: '速度', value: '31' }];
  const plan = planner.resourcePlan(species, target, ivs, planner.diagnosis(species, target, ivs));
  const execution = planner.buildStage2({ meta: { fingerprint: 'sex-regression' }, bt: target, resourcePlan: plan });
  for (const step of execution.steps) {
    assert.equal(Array.from(step.parentLoadouts, (parent) => parent.gender).join(','), 'F,M');
  }
});

for (const ivCount of [5, 6]) {
  test(`${ivCount}V 固执小卡比兽生成正确的幼年体终点`, () => {
    const planner = loadPlanner();
    planner.APP.target.speciesName = '小卡比兽';
    planner.APP.target.nature = '固执';
    planner.APP.target.finalGender = 'F';
    planner.APP.target.donorEggGroupBySpecies['卡比兽'] = '怪兽';
    const keys = ['生命', '物攻', '物防', '特防', '速度', '特攻'].slice(0, ivCount);
    const ivs = keys.map((key, index) => {
      planner.APP.target.ivs[key] = { enabled: true, value: '31' };
      return { key, value: '31', index };
    });
    const species = planner.APP.byName['小卡比兽'];
    const target = planner.APP.byName['卡比兽'];
    const diagnosis = planner.diagnosis(species, target, ivs);
    const plan = planner.resourcePlan(species, target, ivs, diagnosis);
    assert.equal(diagnosis.code, 'OK');
    assert.equal(plan.tree.leaves.length, ivCount === 5 ? 48 : 96);
    assert.equal(plan.tree.root.output.speciesName, '小卡比兽');
    assert.equal(plan.tree.root.babyIncense, '饱腹熏香');
    assert.deepEqual(plan.items.filter((item) => item.need).map((item) => item.key).at(-1), 'incense:full-incense');
    const execution = planner.buildStage2({ meta: { fingerprint: `baby-${ivCount}v` }, bt: target, resourcePlan: plan });
    const finalStep = execution.steps.at(-1);
    assert.equal(finalStep.output.speciesName, '小卡比兽');
    assert.equal(finalStep.parentLoadouts[0].heldItem, '饱腹熏香');
    assert.equal(finalStep.parentLoadouts[1].heldItem, '不变之石');
    assert.equal(finalStep.parentLoadouts[1].nature, '固执');
  });
}

test('全部幼年体均能映射到有效的可繁殖进化亲本', () => {
  const planner = loadPlanner();
  const missing = [];
  for (const [babyName, rule] of Object.entries(planner.BABY_RULES)) {
    const baby = planner.APP.byName[babyName];
    const parent = planner.APP.byName[rule.breedingTarget];
    if (!baby) missing.push(babyName);
    if (!baby) continue;
    assert.ok(parent?.canBreed, `${babyName} 的入口 ${rule.breedingTarget} 必须可繁殖`);
    assert.equal(baby.supportState, 'PLANNABLE');
    assert.equal(baby.breedingTargetName, parent.name);
    planner.APP.target.speciesName = babyName;
    planner.APP.target.nature = 'None';
    planner.APP.target.finalGender = parent.genderType === 'female_only' ? 'F' : parent.genderType === 'male_only' ? 'M' : 'RANDOM';
    if (parent.eggGroups.length > 1) planner.APP.target.donorEggGroupBySpecies[parent.name] = parent.eggGroups[0];
    planner.APP.target.ivs['物攻'] = { enabled: true, value: '31' };
    planner.APP.target.ivs['速度'] = { enabled: true, value: '31' };
    const ivs = [{ key: '物攻', value: '31' }, { key: '速度', value: '31' }];
    const diagnosis = planner.diagnosis(baby, parent, ivs);
    const plan = planner.resourcePlan(baby, parent, ivs, diagnosis);
    assert.equal(diagnosis.code, 'OK', `${babyName} 应可规划`);
    if (rule.incense) {
      assert.equal(plan.tree.root.babyIncense, rule.incense);
      assert.equal(plan.items.find((item) => item.key === `incense:${rule.incenseKey}`)?.need, 1);
    } else {
      assert.equal(plan.tree.root.babyIncense, undefined);
      assert.equal(plan.items.some((item) => item.key.startsWith('incense:')), false);
    }
  }
  assert.deepEqual(missing, []);
});

test('所有需要熏香的幼年体都把熏香绑定到最终步骤母方', () => {
  const planner = loadPlanner();
  for (const [babyName, rule] of Object.entries(planner.BABY_RULES)) {
    if (!rule.incense) continue;
    const baby = planner.APP.byName[babyName];
    const parent = planner.APP.byName[rule.breedingTarget];
    planner.APP.target.speciesName = babyName;
    planner.APP.target.nature = '固执';
    planner.APP.target.finalGender = 'F';
    planner.APP.target.ivs['物攻'] = { enabled: true, value: '31' };
    planner.APP.target.ivs['速度'] = { enabled: true, value: '31' };
    if (parent.eggGroups.length > 1) planner.APP.target.donorEggGroupBySpecies[parent.name] = parent.eggGroups[0];
    const ivs = [{ key: '物攻', value: '31' }, { key: '速度', value: '31' }];
    const plan = planner.resourcePlan(baby, parent, ivs, planner.diagnosis(baby, parent, ivs));
    const execution = planner.buildStage2({ meta: { fingerprint: `incense-${babyName}` }, bt: parent, resourcePlan: plan });
    const finalStep = execution.steps.at(-1);
    assert.equal(finalStep.parentLoadouts[0].gender, 'F', babyName);
    assert.equal(finalStep.output.speciesName, babyName, babyName);
    assert.equal(finalStep.parentLoadouts[0].heldItem, rule.incense, babyName);
    assert.equal(finalStep.parentLoadouts[1].gender, 'M', babyName);
    assert.equal(finalStep.parentLoadouts[1].heldItem, '不变之石', babyName);
    assert.equal(finalStep.items.incense, `incense:${rule.incenseKey}`, babyName);
  }
});

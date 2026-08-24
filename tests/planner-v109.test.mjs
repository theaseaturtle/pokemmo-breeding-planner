import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const releasePath = new URL('../app/pokemmo-breeding-planner-v1.0.9-2026-08-24.html', import.meta.url);

function loadPlanner() {
  const html = readFileSync(releasePath, 'utf8');
  const inline = html.match(/<script>([\s\S]*)<\/script>/)?.[1];
  assert.ok(inline, 'v1.0.9 必须包含内联脚本');
  const script = inline.replace(
    /init\(\);\s*$/,
    'globalThis.__planner={APP,POKEDEX_RAW,makeSpecies,diagnosis,resourcePlan,buildStage2,purchaseProgress,itemPurchaseProgress,confirmParentPurchase,confirmItemPurchase,undoPurchase,editPurchasePrice,transferPurchase,actualPurchaseSpend,acquisitionShortage,canConfirm};',
  );
  const context = vm.createContext({ console, confirm: () => true, structuredClone: globalThis.structuredClone, setTimeout, clearTimeout });
  vm.runInContext(script, context);
  const planner = context.__planner;
  planner.APP.catalog = planner.POKEDEX_RAW.map(planner.makeSpecies);
  planner.APP.byName = Object.fromEntries(planner.APP.catalog.map(species => [species.name, species]));
  return planner;
}

function normalPlan(planner) {
  const target = planner.APP.byName['大舌贝'];
  const ivs = [
    { key: '生命', value: '31', index: 0 },
    { key: '物攻', value: '31', index: 1 },
  ];
  planner.APP.target.speciesName = target.name;
  planner.APP.target.nature = '固执';
  planner.APP.target.finalGender = 'F';
  planner.APP.target.donorEggGroupBySpecies = { 大舌贝: '水中3' };
  planner.APP.pricing.ivPrices = { 生命: 4000, 物攻: 4500, 物防: 0, 特攻: 0, 特防: 0, 速度: 0 };
  planner.APP.pricing.natureBase = 20000;
  planner.APP.pricing.everstone = 2000;
  const diagnosis = planner.diagnosis(target, target, ivs);
  const resourcePlan = planner.resourcePlan(target, target, ivs, diagnosis);
  planner.APP.stage1 = { meta: { fingerprint: 'fixture', stale: false }, species: target, bt: target, ivs, nature: '固执', finalGender: 'F', diagnosis, resourcePlan };
  return resourcePlan;
}

test('确认购入会减少待购而不会改变采购需求', () => {
  const planner = loadPlanner();
  const plan = normalPlan(planner);
  const group = plan.groups.find(item => item.iv?.key === '生命');
  const row = group.purchase[0];
  const before = planner.purchaseProgress(group);

  const result = planner.confirmParentPurchase(group, row.speciesName, 1, 3888, '交易所');
  const after = planner.purchaseProgress(group);

  assert.equal(result.ok, true);
  assert.equal(after.requirement, before.requirement);
  assert.equal(after.confirmed, 1);
  assert.equal(after.remaining, before.remaining - 1);
  assert.equal(planner.actualPurchaseSpend('yen'), 3888);
});

test('采购登记不能超过该物种计划数量，未消耗时可以撤销', () => {
  const planner = loadPlanner();
  const plan = normalPlan(planner);
  const group = plan.groups.find(item => item.purchase.length);
  const row = group.purchase[0];

  assert.equal(planner.confirmParentPurchase(group, row.speciesName, row.quantity + 1, row.unitPrice).ok, false);
  assert.equal(planner.confirmParentPurchase(group, row.speciesName, row.quantity, row.unitPrice).ok, true);
  const record = planner.APP.purchaseRecords[0];
  assert.equal(planner.undoPurchase(record.id).ok, true);
  assert.equal(planner.purchaseProgress(group).confirmed, 0);
});

test('道具采购使用独立实际价格并减少剩余数量', () => {
  const planner = loadPlanner();
  const plan = normalPlan(planner);
  const item = plan.items.find(row => row.purchase > 0 && row.currency === 'yen');
  const before = planner.itemPurchaseProgress(item);

  assert.equal(planner.confirmItemPurchase(item, 1, 1999).ok, true);
  assert.equal(planner.itemPurchaseProgress(item).remaining, before.remaining - 1);
  assert.equal(planner.actualPurchaseSpend('yen'), 1999);
});

test('执行步骤在所需市场亲本尚未购入时显示等待采购', () => {
  const planner = loadPlanner();
  const plan = normalPlan(planner);
  const stage2 = planner.buildStage2(planner.APP.stage1);
  planner.APP.stage2 = stage2;
  const first = stage2.steps.find(step => step.kind === 'BREEDING');

  assert.match(planner.acquisitionShortage(first), /^等待采购：/);
});

test('亲本和道具全部购入后首个无依赖步骤立即解锁', () => {
  const planner = loadPlanner();
  const plan = normalPlan(planner);

  for (const group of plan.groups) {
    for (const row of group.purchase) {
      assert.equal(planner.confirmParentPurchase(group, row.speciesName, row.quantity, group.unitPrice).ok, true);
    }
  }
  for (const item of plan.items.filter(row => row.purchase > 0)) {
    assert.equal(planner.confirmItemPurchase(item, item.purchase, item.unit).ok, true);
  }

  const stage2 = planner.buildStage2(planner.APP.stage1);
  planner.APP.stage2 = stage2;
  const first = stage2.steps.find(step => step.kind === 'BREEDING' && step.dependsOn.length === 0);

  assert.equal(planner.acquisitionShortage(first), null);
  assert.equal(planner.canConfirm(first), true);
});

test('未消耗采购可以转入长期库存且实际花费历史保留', () => {
  const planner = loadPlanner();
  const plan = normalPlan(planner);
  const group = plan.groups.find(item => item.purchase.length);
  const row = group.purchase[0];
  planner.confirmParentPurchase(group, row.speciesName, 1, 4321);
  const record = planner.APP.purchaseRecords[0];

  assert.equal(planner.transferPurchase(record.id).ok, true);
  assert.equal(planner.purchaseProgress(group).confirmed, 0);
  assert.equal(planner.APP.inventory[0].quantity, 1);
  assert.equal(planner.actualPurchaseSpend('yen'), 4321);
  assert.equal(planner.undoPurchase(record.id).ok, false);
});

test('相同成交价与备注的连续采购自动合并为一个批次', () => {
  const planner = loadPlanner();
  const plan = normalPlan(planner);
  const item = plan.items.find(row => row.purchase >= 2);

  assert.ok(item);
  assert.equal(planner.confirmItemPurchase(item, 1, 4000, '同一批').ok, true);
  assert.equal(planner.confirmItemPurchase(item, 1, 4000, '同一批').ok, true);
  assert.equal(planner.APP.purchaseRecords.length, 1);
  assert.equal(planner.APP.purchaseRecords[0].quantity, 2);

  if (item.purchase >= 3) {
    assert.equal(planner.confirmItemPurchase(item, 1, 4100, '另一批').ok, true);
    assert.equal(planner.APP.purchaseRecords.length, 2);
  }
});

test('采购界面使用分层记录、卡内编辑和响应式道具布局', () => {
  const html = readFileSync(releasePath, 'utf8');

  assert.doesNotMatch(html, /window\.prompt/);
  assert.match(html, /class="purchase-actions"/);
  assert.match(html, /class="purchase-edit-form"/);
  assert.match(html, /class="purchase-history"/);
  assert.match(html, /class="metric item-acquisition"/);
  assert.match(html, /@media\(max-width:1100px\).*item-audit\{grid-template-columns:repeat\(2/);
  assert.match(html, /@media\(max-width:700px\).*item-audit\{grid-template-columns:1fr/);
});

test('v1.0.9 使用独立账本并提供 v1.0.8 一次性迁移入口', () => {
  const html = readFileSync(releasePath, 'utf8');
  const names = [...html.matchAll(/^function\s+([A-Za-z_$][\w$]*)\s*\(/gm)].map(match => match[1]);
  const duplicates = names.filter((name, index) => names.indexOf(name) !== index);

  assert.deepEqual(duplicates, []);
  assert.match(html, /APP_VERSION='1\.0\.9'/);
  assert.match(html, /STORAGE_KEY='pokemmo_breeding_planner_v1_0_9'/);
  assert.match(html, /PREVIOUS_STORAGE_KEY='pokemmo_breeding_planner_v1_0_8'/);
  assert.match(html, /SCHEMA_VERSION=9/);
});

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const releasePath = new URL('../app/pokemmo-breeding-planner-v1.0.18-2026-08-25.html', import.meta.url);
const html = readFileSync(releasePath, 'utf8');
const inline = html.match(/<script>([\s\S]*)<\/script>/)?.[1];
const sourceHelpers = inline.slice(
  inline.indexOf('function sourceStepLabel'),
  inline.indexOf('function parentLoadout'),
);
const helperContext = {};
vm.runInNewContext(sourceHelpers, helperContext);

test('中间产物来源显示真实生产步骤编号和物种', () => {
  assert.equal(
    helperContext.sourceStepLabel('node-2', '海刺龙', { 'node-2': 2 }),
    '第 2 步产出 · 海刺龙',
  );
  assert.throws(() => helperContext.sourceStepLabel('missing', '海刺龙', {}), /缺少来源步骤/);
  assert.match(inline, /source:sourceStepLabel\(input\.id,input\.output\.speciesName,stepNoByNodeId\)/);
  assert.doesNotMatch(inline, /stepNoByNodeId\[input\.(?:id|nodeId)\]\|\|'\?'/);
});

test('迁移后的所有临时亲本来源都会重新计算且不含问号', () => {
  const stage2 = {
    steps: [
      { id: 'node-1', sequence: 1 },
      { id: 'node-2', sequence: 2 },
      {
        id: 'node-3',
        sequence: 3,
        left: { type: 'TEMP', nodeId: 'node-1' },
        right: { type: 'TEMP', nodeId: 'node-2' },
        parentLoadouts: [
          { speciesName: '圆陆鲨', source: '第 ? 步产出 · 圆陆鲨' },
          { speciesName: '海刺龙', source: '第 ? 步产出 · 海刺龙' },
        ],
      },
    ],
  };

  helperContext.repairStage2SourceLabels(stage2);

  assert.deepEqual(
    stage2.steps[2].parentLoadouts.map(loadout => loadout.source),
    ['第 1 步产出 · 圆陆鲨', '第 2 步产出 · 海刺龙'],
  );
  assert.ok(stage2.steps[2].parentLoadouts.every(loadout => !loadout.source.includes('?')));
});

test('v1.0.18 使用独立账本并从 v1.0.17 迁移', () => {
  assert.match(inline, /APP_VERSION='1\.0\.18'/);
  assert.match(inline, /STORAGE_KEY='pokemmo_breeding_planner_v1_0_18'/);
  assert.match(inline, /PREVIOUS_STORAGE_KEY='pokemmo_breeding_planner_v1_0_17'/);
  assert.match(inline, /SCHEMA_VERSION=18/);
  assert.doesNotMatch(inline, /APP\.stage1=migrated\?null/);
  assert.doesNotMatch(inline, /APP\.stage2=migrated\?null/);
  assert.match(inline, /repairStage2SourceLabels\(APP\.stage2\)/);
  assert.match(inline, /执行方案、已确认步骤和来源步骤编号均已保留/);
});

test('新版应用脚本语法有效', () => {
  assert.doesNotThrow(() => new vm.Script(inline.replace(/init\(\);\s*$/, '')));
});

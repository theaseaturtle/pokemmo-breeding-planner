import { readFileSync, writeFileSync } from 'node:fs';

const sourcePath = new URL('../app/pokemmo-breeding-planner-v1.0.17-2026-08-25.html', import.meta.url);
const outputPath = new URL('../app/pokemmo-breeding-planner-v1.0.18-2026-08-25.html', import.meta.url);

let html = readFileSync(sourcePath, 'utf8')
  .replaceAll('v1.0.17', 'v1.0.18')
  .replaceAll('v1_0_17', 'v1_0_18')
  .replace("APP_VERSION='1.0.17'", "APP_VERSION='1.0.18'")
  .replace("PREVIOUS_STORAGE_KEY='pokemmo_breeding_planner_v1_0_16'", "PREVIOUS_STORAGE_KEY='pokemmo_breeding_planner_v1_0_17'")
  .replace('SCHEMA_VERSION=17', 'SCHEMA_VERSION=18')
  .replaceAll('pokedex-gen1-5-bootstrap-2026-08-24-v1.0.18', 'pokedex-gen1-5-bootstrap-2026-08-24-v1.0.9')
  .replaceAll('pokemmo-breeding-tree-acquisition-ledger-2026-08-24-v1.0.18', 'pokemmo-breeding-tree-acquisition-ledger-2026-08-24-v1.0.9')
  .replace(
    'function parentLoadout(input,heldItem,rp,stepNoByNodeId){',
    "function sourceStepLabel(breedingNodeId,speciesName,stepNoByNodeId){const stepNo=stepNoByNodeId[breedingNodeId];if(!Number.isInteger(stepNo))throw Error('中间产物缺少来源步骤：'+speciesName);return'第 '+stepNo+' 步产出 · '+speciesName}\nfunction repairStage2SourceLabels(stage2){if(!Array.isArray(stage2?.steps))return;const stepNoByNodeId=Object.fromEntries(stage2.steps.map((step,index)=>[step.id,Number(step.sequence||index+1)]));stage2.steps.forEach(step=>{if(!Array.isArray(step.parentLoadouts))return;[step.left,step.right].forEach((input,index)=>{if(input?.type!=='TEMP'||!step.parentLoadouts[index])return;const loadout=step.parentLoadouts[index];loadout.source=sourceStepLabel(input.nodeId,loadout.speciesName,stepNoByNodeId)})})}\nfunction parentLoadout(input,heldItem,rp,stepNoByNodeId){"
  )
  .replace(
    "source:'第 '+(stepNoByNodeId[input.nodeId]||'?')+' 步产出 · '+input.output.speciesName",
    'source:sourceStepLabel(input.id,input.output.speciesName,stepNoByNodeId)'
  )
  .replace(
    "APP.stage1=migrated?null:(x.stage1||null);APP.stage2=migrated?null:(x.stage2||null);APP.staleHistory=migrated?[]:(x.staleHistory||[]);reviveStage1();normalizeStoredInventory();if(migrated)APP.notice='已从 v1.0.16 迁移目标、价格、长期库存、道具库存与采购记录；旧执行方案未迁移。'",
    "APP.stage1=x.stage1||null;APP.stage2=x.stage2||null;APP.staleHistory=Array.isArray(x.staleHistory)?x.staleHistory:[];reviveStage1();repairStage2SourceLabels(APP.stage2);normalizeStoredInventory();if(migrated)APP.notice='已从 v1.0.17 迁移完整账本；执行方案、已确认步骤和来源步骤编号均已保留。'"
  )
  .replace('首次打开可迁移 v1.0.16 长期数据', '首次打开可迁移 v1.0.17 长期数据')
  .replace("document.getElementById('data-version-badge').textContent='v1.0.17'", "document.getElementById('data-version-badge').textContent='v1.0.9'")
  .replace("document.getElementById('rules-version-badge').textContent='配种树 v1.0.17'", "document.getElementById('rules-version-badge').textContent='配种树 v1.0.9'");

writeFileSync(outputPath, html);
console.log(outputPath.pathname);

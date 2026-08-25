import { readFileSync, writeFileSync } from 'node:fs';

const sourcePath = new URL('../app/pokemmo-breeding-planner-v1.0.16-2026-08-25.html', import.meta.url);
const outputPath = new URL('../app/pokemmo-breeding-planner-v1.0.17-2026-08-25.html', import.meta.url);

let html = readFileSync(sourcePath, 'utf8')
  .replaceAll('v1.0.16', 'v1.0.17')
  .replaceAll('v1_0_16', 'v1_0_17')
  .replace("APP_VERSION='1.0.16'", "APP_VERSION='1.0.17'")
  .replace("PREVIOUS_STORAGE_KEY='pokemmo_breeding_planner_v1_0_15'", "PREVIOUS_STORAGE_KEY='pokemmo_breeding_planner_v1_0_16'")
  .replace('SCHEMA_VERSION=16', 'SCHEMA_VERSION=17')
  .replaceAll('pokedex-gen1-5-bootstrap-2026-08-24-v1.0.17', 'pokedex-gen1-5-bootstrap-2026-08-24-v1.0.9')
  .replaceAll('pokemmo-breeding-tree-acquisition-ledger-2026-08-24-v1.0.17', 'pokemmo-breeding-tree-acquisition-ledger-2026-08-24-v1.0.9')
  .replace(
    "function makeReconciledStage1(){let stage=makeStage1();if(reconcilePurchaseRecords(stage))stage=makeStage1();return stage}",
    "function bindConfirmedParentSources(stage){const rp=stage?.resourcePlan;if(!rp)return stage;rp.groups.forEach(group=>{const leaves=group.leafIds.filter(leafId=>rp.sources[leafId]?.type==='PURCHASE'),confirmed=[];APP.purchaseRecords.filter(record=>record.kind==='PARENT'&&record.groupId===group.id).forEach(record=>{const count=Math.max(0,Number(record.quantity||0)-Number(record.transferred||0));for(let i=0;i<count;i++)confirmed.push(record.speciesName)});leaves.forEach((leafId,index)=>{if(!confirmed[index])return;rp.sources[leafId].speciesName=confirmed[index];rp.sources[leafId].purchaseAllocation='CONFIRMED'});});return stage}\nfunction invalidateExecutionForAcquisition(reason){if(!APP.stage2)return;if(APP.stage2.steps.some(step=>step.status==='CONFIRMED')){APP.stage2.stale=true;APP.staleHistory.push({at:new Date().toISOString(),reason})}else APP.stage2=null}\nfunction makeReconciledStage1(){let stage=makeStage1();if(reconcilePurchaseRecords(stage))stage=makeStage1();return bindConfirmedParentSources(stage)}"
  )
  .replace(
    "function generate2(){if(!APP.stage1||APP.stage1.diagnosis.outcomeClass!=='plannable'||APP.stage1.meta.stale)return;APP.stage2=buildStage2(APP.stage1);renderAll();persist()}",
    "function generate2(){if(!APP.stage1||APP.stage1.diagnosis.outcomeClass!=='plannable'||APP.stage1.meta.stale)return;bindConfirmedParentSources(APP.stage1);APP.stage2=buildStage2(APP.stage1);renderAll();persist()}"
  )
  .replace(
    "const leaf=APP.stage1.resourcePlan.tree.leaves.find(item=>group.leafIds.includes(item.id)),price=",
    "const leaf=APP.stage1.resourcePlan.tree.leaves.find(item=>group.leafIds.includes(item.id)),price="
  )
  .replace(
    "confirmedAt:new Date().toISOString()});return{ok:true,remaining:remaining-amount}",
    "confirmedAt:new Date().toISOString()});bindConfirmedParentSources(APP.stage1);invalidateExecutionForAcquisition('亲本采购变化');return{ok:true,remaining:remaining-amount}"
  )
  .replace(
    "APP.purchaseRecords=APP.purchaseRecords.filter(item=>item.id!==recordId);return{ok:true}",
    "APP.purchaseRecords=APP.purchaseRecords.filter(item=>item.id!==recordId);if(record.kind==='PARENT'){bindConfirmedParentSources(APP.stage1);invalidateExecutionForAcquisition('撤销亲本采购')}return{ok:true}"
  )
  .replace(
    "record.transferred=Number(record.transferred||0)+quantity;return{ok:true,quantity}",
    "record.transferred=Number(record.transferred||0)+quantity;if(record.kind==='PARENT'){bindConfirmedParentSources(APP.stage1);invalidateExecutionForAcquisition('亲本采购转入库存')}return{ok:true,quantity}"
  )
  .replace("APP.purchaseRecords=migrated?[]:(Array.isArray(x.purchaseRecords)?x.purchaseRecords:[])", "APP.purchaseRecords=Array.isArray(x.purchaseRecords)?x.purchaseRecords:[]")
  .replace('首次打开可迁移 v1.0.15 长期数据', '首次打开可迁移 v1.0.16 长期数据')
  .replace("已从 v1.0.15 迁移目标、价格、长期库存与道具库存", "已从 v1.0.16 迁移目标、价格、长期库存、道具库存与采购记录")
  .replace("document.getElementById('data-version-badge').textContent='v1.0.16'", "document.getElementById('data-version-badge').textContent='v1.0.9'")
  .replace("document.getElementById('rules-version-badge').textContent='配种树 v1.0.16'", "document.getElementById('rules-version-badge').textContent='配种树 v1.0.9'");

writeFileSync(outputPath, html);
console.log(outputPath.pathname);

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const sourceUrl = new URL('../app/pokemmo-breeding-planner-v1.0.19-2026-08-25.html', import.meta.url);
const outputUrl = new URL('../app/pokemmo-breeding-planner-v1.0.20-2026-08-25.html', import.meta.url);

// National Pokédex #001–#649 → earliest species in the evolution chain.
// Derived once from PokeAPI's pokemon_species.csv; the generated planner remains fully offline.
const eggBaseIds = '1,1,1,4,4,4,7,7,7,10,10,10,13,13,13,16,16,16,19,19,21,21,23,23,172,172,27,27,29,29,29,32,32,32,173,173,37,37,174,174,41,41,43,43,43,46,46,48,48,50,50,52,52,54,54,56,56,58,58,60,60,60,63,63,63,66,66,66,69,69,69,72,72,74,74,74,77,77,79,79,81,81,83,84,84,86,86,88,88,90,90,92,92,92,95,96,96,98,98,100,100,102,102,104,104,236,236,108,109,109,111,111,440,114,115,116,116,118,118,120,120,439,123,238,239,240,127,128,129,129,131,132,133,133,133,133,137,138,138,140,140,142,446,144,145,146,147,147,147,150,151,152,152,152,155,155,155,158,158,158,161,161,163,163,165,165,167,167,41,170,170,172,173,174,175,175,177,177,179,179,179,43,298,298,438,60,187,187,187,190,191,191,193,194,194,133,133,198,79,200,201,360,203,204,204,206,207,95,209,209,211,123,213,214,215,216,216,218,218,220,220,222,223,223,225,458,227,228,228,116,231,231,137,234,235,236,236,238,239,240,241,440,243,244,245,246,246,246,249,250,251,252,252,252,255,255,255,258,258,258,261,261,263,263,265,265,265,265,265,270,270,270,273,273,273,276,276,278,278,280,280,280,283,283,285,285,287,287,287,290,290,290,293,293,293,296,296,298,299,300,300,302,303,304,304,304,307,307,309,309,311,312,313,314,406,316,316,318,318,320,320,322,322,324,325,325,327,328,328,328,331,331,333,333,335,336,337,338,339,339,341,341,343,343,345,345,347,347,349,349,351,352,353,353,355,355,357,433,359,360,361,361,363,363,363,366,366,366,369,370,371,371,371,374,374,374,377,378,379,380,381,382,383,384,385,386,387,387,387,390,390,390,393,393,393,396,396,396,399,399,401,401,403,403,403,406,406,408,408,410,410,412,412,412,415,415,417,418,418,420,420,422,422,190,425,425,427,427,200,198,431,431,433,434,434,436,436,438,439,440,441,442,443,443,443,446,447,447,449,449,451,451,453,453,455,456,456,458,459,459,215,81,108,111,114,239,240,175,193,133,133,207,220,137,280,299,355,361,479,480,481,482,483,484,485,486,487,488,489,490,491,492,493,494,495,495,495,498,498,498,501,501,501,504,504,506,506,506,509,509,511,511,513,513,515,515,517,517,519,519,519,522,522,524,524,524,527,527,529,529,531,532,532,532,535,535,535,538,539,540,540,540,543,543,543,546,546,548,548,550,551,551,551,554,554,556,557,557,559,559,561,562,562,564,564,566,566,568,568,570,570,572,572,574,574,574,577,577,577,580,580,582,582,582,585,585,587,588,588,590,590,592,592,594,595,595,597,597,599,599,599,602,602,602,605,605,607,607,607,610,610,610,613,613,615,616,616,618,619,619,621,622,622,624,624,626,627,627,629,629,631,632,633,633,633,636,636,638,639,640,641,642,643,644,645,646,647,648,649';

let html = readFileSync(sourceUrl, 'utf8');

function replaceRequired(search, replacement, label) {
  if (!html.includes(search)) throw new Error(`Missing v1.0.19 source fragment: ${label}`);
  html = html.replace(search, replacement);
}

html = html
  .replaceAll('v1.0.19', 'v1.0.20')
  .replaceAll('v1_0_19', 'v1_0_20')
  .replace("PREVIOUS_STORAGE_KEY='pokemmo_breeding_planner_v1_0_18'", "PREVIOUS_STORAGE_KEY='pokemmo_breeding_planner_v1_0_19'")
  .replace('SCHEMA_VERSION=19', 'SCHEMA_VERSION=20')
  .replace('<meta name="release-date" content="2026-08-24">', '<meta name="release-date" content="2026-08-25">')
  .replace('APP v1.0.20 · 2026-08-24', 'APP v1.0.20 · 2026-08-25')
  .replace('v1.0.20-2026-08-24', 'v1.0.20-2026-08-25')
  .replace("APP_VERSION='1.0.19', RELEASE_DATE='2026-08-24'", "APP_VERSION='1.0.20', RELEASE_DATE='2026-08-25'");

replaceRequired(
  "const EGG_BASE_FOR={'大嘴雀':'烈雀','烈咬陆鲨':'圆陆鲨'};function eggSpeciesFor(name){return EGG_BASE_FOR[name]||name}",
  `const EGG_BASE_IDS=[${eggBaseIds}];function eggSpeciesFor(name){const species=findSpecies(name),id=Number(species?.id?.slice(1)||0),baseId=EGG_BASE_IDS[id-1],base=APP.byId['#'+String(baseId||id).padStart(3,'0')];return base?.name||name}`,
  'complete hatch-species map',
);

replaceRequired(
  "const maternal=input.lineageRole==='TARGET_MAINLINE'?bt.name:(input.left.kind==='LEAF'?sources[input.left.id].speciesName:input.left.output.speciesName),speciesName=eggSpeciesFor(maternal==='百变怪'?(left==='百变怪'?right:left):maternal);",
  "const maternal=input.left.kind==='LEAF'?sources[input.left.id].speciesName:input.left.output.speciesName,speciesName=eggSpeciesFor(maternal==='百变怪'?(left==='百变怪'?right:left):maternal);",
  'real maternal species',
);

replaceRequired(
  "function bindConfirmedParentSources(stage){const rp=stage?.resourcePlan;if(!rp)return stage;rp.groups.forEach(group=>{const leaves=group.leafIds.filter(leafId=>rp.sources[leafId]?.type==='PURCHASE'),confirmed=[];APP.purchaseRecords.filter(record=>record.kind==='PARENT'&&record.groupId===group.id).forEach(record=>{const count=Math.max(0,Number(record.quantity||0)-Number(record.transferred||0));for(let i=0;i<count;i++)confirmed.push(record.speciesName)});leaves.forEach((leafId,index)=>{if(!confirmed[index])return;rp.sources[leafId].speciesName=confirmed[index];rp.sources[leafId].purchaseAllocation='CONFIRMED'});});return stage}",
  "function bindConfirmedParentSources(stage){const rp=stage?.resourcePlan;if(!rp)return stage;rp.groups.forEach(group=>{const leaves=group.leafIds.filter(leafId=>rp.sources[leafId]?.type==='PURCHASE'),confirmed=[];APP.purchaseRecords.filter(record=>record.kind==='PARENT'&&record.groupId===group.id&&group.allowed.some(species=>species.name===record.speciesName)).forEach(record=>{const count=Math.max(0,Number(record.quantity||0)-Number(record.consumed||0)-Number(record.transferred||0));for(let i=0;i<count;i++)confirmed.push(record.speciesName)});leaves.forEach((leafId,index)=>{if(!confirmed[index])return;rp.sources[leafId].speciesName=confirmed[index];rp.sources[leafId].purchaseAllocation='CONFIRMED'});});return stage}",
  'route-safe confirmed-parent binding',
);

replaceRequired(
  "function generate1(){if(APP.stage1||APP.stage2)invalidate('重新生成方案');APP.stage1=makeReconciledStage1();APP.stage2=null;renderAll();persist()}",
  "function confirmRouteReplacement(){const previous=APP.stage1?.species?.name,next=selected()?.name,changed=Boolean(previous&&next&&previous!==next);if(!changed||!APP.purchaseRecords.length)return true;if(!confirm('目标路线将从「'+previous+'」切换为「'+next+'」。\\n确认后会删除旧方案采购池中的全部亲本、道具、成交价和备注；长期库存不受影响。')){APP.target.speciesName=previous;document.getElementById('species-search').value=previous;normalizeTargetGender(findSpecies(previous));renderAll();persist();return false}APP.purchaseRecords=[];APP.overrides={};return true}\nfunction generate1(){if(!confirmRouteReplacement())return;if(APP.stage1||APP.stage2)invalidate('重新生成方案');APP.stage1=makeReconciledStage1();APP.stage2=null;renderAll();persist()}",
  'confirmed route replacement',
);

replaceRequired(
  'function persist(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify({schema:SCHEMA_VERSION,app:APP_VERSION,target:APP.target,pricing:APP.pricing,inventory:APP.inventory,items:APP.items,overrides:APP.overrides,purchaseRecords:APP.purchaseRecords,ui:APP.ui,stage1:persistedStage1(),stage2:APP.stage2,staleHistory:APP.staleHistory}))}catch(e){toast(\'本地保存失败：\'+e.message,\'bad\')}}',
  "function executionPlanIsConsistent(stage1,stage2){if(!stage1?.resourcePlan||!Array.isArray(stage2?.steps))return false;const rp=stage1.resourcePlan;for(const group of rp.groups){for(const leafId of group.leafIds){const source=rp.sources[leafId];if(source?.type==='PURCHASE'&&!group.allowed.some(species=>species.name===source.speciesName))return false}}for(const step of stage2.steps.filter(item=>item.kind==='BREEDING')){if(!Array.isArray(step.parentLoadouts)||step.parentLoadouts.length!==2)return false;const left=step.parentLoadouts[0]?.speciesName,right=step.parentLoadouts[1]?.speciesName,maternal=left==='百变怪'?right:left;if(!maternal||step.output?.speciesName!==eggSpeciesFor(maternal))return false}return true}\nfunction persist(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify({schema:SCHEMA_VERSION,app:APP_VERSION,target:APP.target,pricing:APP.pricing,inventory:APP.inventory,items:APP.items,overrides:APP.overrides,purchaseRecords:APP.purchaseRecords,ui:APP.ui,stage1:persistedStage1(),stage2:APP.stage2,staleHistory:APP.staleHistory}))}catch(e){toast('本地保存失败：'+e.message,'bad')}}",
  'execution-plan validation',
);

replaceRequired(
  "reviveStage1();repairStage2SourceLabels(APP.stage2);normalizeStoredInventory();if(migrated)APP.notice='已从 v1.0.18 迁移完整账本；执行方案、已确认步骤和来源步骤编号均已保留。'",
  "reviveStage1();repairStage2SourceLabels(APP.stage2);normalizeStoredInventory();if(migrated&&APP.stage2&&!executionPlanIsConsistent(APP.stage1,APP.stage2)){APP.stage2=null;APP.stage1=makeReconciledStage1();APP.notice='已从 v1.0.19 迁移目标、长期库存和采购记录；检测到旧执行方案的亲本或孵蛋物种不一致，已解除锁定，请重新确认资源并锁定。'}else if(migrated)APP.notice='已从 v1.0.19 迁移完整账本；执行方案校验通过并已保留。'",
  'safe migration',
);

writeFileSync(outputUrl, html);
console.log(fileURLToPath(outputUrl));

import { readFileSync, writeFileSync } from 'node:fs';

const sourcePath = new URL('../app/pokemmo-breeding-planner-v1.0.14-2026-08-25.html', import.meta.url);
const outputPath = new URL('../app/pokemmo-breeding-planner-v1.0.15-2026-08-25.html', import.meta.url);
let html = readFileSync(sourcePath, 'utf8')
  .replaceAll('v1.0.14', 'v1.0.15')
  .replaceAll('v1_0_14', 'v1_0_15')
  .replace("APP_VERSION='1.0.14'", "APP_VERSION='1.0.15'")
  .replace("PREVIOUS_STORAGE_KEY='pokemmo_breeding_planner_v1_0_13'", "PREVIOUS_STORAGE_KEY='pokemmo_breeding_planner_v1_0_14'")
  .replace('SCHEMA_VERSION=14', 'SCHEMA_VERSION=15')
  .replaceAll('pokedex-gen1-5-bootstrap-2026-08-24-v1.0.15', 'pokedex-gen1-5-bootstrap-2026-08-24-v1.0.9')
  .replaceAll('pokemmo-breeding-tree-acquisition-ledger-2026-08-24-v1.0.15', 'pokemmo-breeding-tree-acquisition-ledger-2026-08-24-v1.0.9')
  .replace("const BREEDING_OVERRIDES=", "const EGG_BASE_FOR={'大嘴雀':'烈雀','烈咬陆鲨':'圆陆鲨'};function eggSpeciesFor(name){return EGG_BASE_FOR[name]||name}\nconst BREEDING_OVERRIDES=")
  .replace("const speciesName=input.lineageRole==='TARGET_MAINLINE'?bt.name:(left==='百变怪'?right:left);", "const maternal=input.lineageRole==='TARGET_MAINLINE'?bt.name:(input.left.kind==='LEAF'?sources[input.left.id].speciesName:input.left.output.speciesName),speciesName=eggSpeciesFor(maternal==='百变怪'?(left==='百变怪'?right:left):maternal);")
  .replace("const allocationControl=progress.requirement?'<div class=\"small\" style=\"margin-top:10px\"><strong>指定购买物种</strong></div><div class=\"compact-control\"><div class=\"combo resource-combo\"><input type=\"text\" autocomplete=\"off\" role=\"combobox\" aria-autocomplete=\"list\" value=\"'+X(fallback)+'\" data-purchase-search=\"'+X(g.id)+'\" placeholder=\"搜索合法物种\" '+(unassigned?'':'disabled')+'></div><input type=\"number\" min=\"1\" max=\"'+unassigned+'\" value=\"1\" data-purchase-quantity=\"'+X(g.id)+'\" '+(unassigned?'':'disabled')+'><button class=\"btn\" data-purchase-add=\"'+X(g.id)+'\" '+(unassigned?'':'disabled')+'>'+(unassigned?'指定':'名额已满')+'</button></div><div class=\"micro\">'+roleHint+'</div>':'';", "const allocationControl='<div class=\"micro\" style=\"margin-top:10px\">每条待购记录可直接改选合法物种并确认购买；自动补位只是默认建议。</div>';")
  .replace("const purchaseRows=g.purchase.map(row=>{const key=g.id+'|'+row.speciesName,bought=", "const purchaseRows=g.purchase.map(row=>{const key=g.id+'|'+row.speciesName,bought=")
  .replace("<strong>'+(row.allocation==='MANUAL'?'指定购买':'自动补位')+'：'+X(row.speciesName)+'</strong>", "<strong>'+(row.allocation==='MANUAL'?'待购来源':'自动补位')+'：<input class=\"inline-purchase-species\" value=\"'+X(row.speciesName)+'\" data-buy-species-input=\"'+X(key)+'\" data-buy-group=\"'+X(g.id)+'\" data-buy-current=\"'+X(row.speciesName)+'\" aria-label=\"购买物种\"></strong>")
  .replace("data-buy-parent=\"'+X(g.id)+'\" data-buy-species=\"'+X(row.speciesName)+'\"", "data-buy-parent=\"'+X(g.id)+'\" data-buy-species=\"'+X(row.speciesName)+'\"")
  .replace("const buyParent=e.target.closest('[data-buy-parent]');if(buyParent){const groupId=buyParent.dataset.buyParent,speciesName=buyParent.dataset.buySpecies,key=groupId+'|'+speciesName", "const buyParent=e.target.closest('[data-buy-parent]');if(buyParent){const groupId=buyParent.dataset.buyParent,group=APP.stage1?.resourcePlan?.groups.find(item=>item.id===groupId),sourceInput=buyParent.closest('.purchase-source')?.querySelector('[data-buy-species-input]'),speciesName=sourceInput?.value?.trim()||buyParent.dataset.buySpecies,key=groupId+'|'+buyParent.dataset.buySpecies")
  .replace("group=APP.stage1?.resourcePlan?.groups.find(item=>item.id===groupId),quantity=Number", "quantity=Number")
  .replace(",result=confirmParentPurchase(group,speciesName,quantity,unitPrice,note);", ";const currentSpecies=buyParent.dataset.buySpecies;if(speciesName!==currentSpecies){const row=group.purchase.find(item=>item.speciesName===currentSpecies),target=group.purchase.find(item=>item.speciesName===speciesName),before=group.purchase.map(item=>({...item}));if(!row||!group.allowed.some(item=>item.name===speciesName)){toast('请选择当前路线允许的合法物种。','bad');return}row.quantity-=quantity;if(row.quantity<=0)group.purchase=group.purchase.filter(item=>item!==row);if(target)target.quantity+=quantity;else group.purchase.push({speciesName,quantity,allocation:'MANUAL'});const replacement=confirmParentPurchase(group,speciesName,quantity,unitPrice,note);if(!replacement.ok){group.purchase=before;APP.ui.purchaseErrorKey=key;APP.ui.purchaseErrorMessage=replacement.message;renderAll();toast(replacement.message,'bad');return}APP.ui.purchaseErrorKey=null;APP.ui.purchaseErrorMessage='';renderAll();persist();toast('已更换并登记购入 '+speciesName+' × '+quantity);return}const result=confirmParentPurchase(group,speciesName,quantity,unitPrice,note);")
  .replace('首次打开可迁移 v1.0.13 长期数据', '首次打开可迁移 v1.0.14 长期数据')
  .replace("已从 v1.0.13 迁移目标、价格、长期库存与道具库存", "已从 v1.0.14 迁移目标、价格、长期库存与道具库存")
  .replace("document.getElementById('data-version-badge').textContent='v1.0.14'", "document.getElementById('data-version-badge').textContent='v1.0.9'")
  .replace("document.getElementById('rules-version-badge').textContent='配种树 v1.0.14'", "document.getElementById('rules-version-badge').textContent='配种树 v1.0.9'");
writeFileSync(outputPath, html);
console.log(outputPath.pathname);

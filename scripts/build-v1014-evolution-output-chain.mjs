import { readFileSync, writeFileSync } from 'node:fs';

const sourcePath = new URL('../app/pokemmo-breeding-planner-v1.0.13-2026-08-25.html', import.meta.url);
const outputPath = new URL('../app/pokemmo-breeding-planner-v1.0.14-2026-08-25.html', import.meta.url);
let html = readFileSync(sourcePath, 'utf8')
  .replaceAll('v1.0.13', 'v1.0.14')
  .replaceAll('v1_0_13', 'v1_0_14')
  .replace("APP_VERSION='1.0.13'", "APP_VERSION='1.0.14'")
  .replace("PREVIOUS_STORAGE_KEY='pokemmo_breeding_planner_v1_0_12'", "PREVIOUS_STORAGE_KEY='pokemmo_breeding_planner_v1_0_13'")
  .replace('SCHEMA_VERSION=13', 'SCHEMA_VERSION=14')
  .replaceAll('pokedex-gen1-5-bootstrap-2026-08-24-v1.0.14', 'pokedex-gen1-5-bootstrap-2026-08-24-v1.0.9')
  .replaceAll('pokemmo-breeding-tree-acquisition-ledger-2026-08-24-v1.0.14', 'pokemmo-breeding-tree-acquisition-ledger-2026-08-24-v1.0.9')
  .replace("'尼多娜':['尼多兰','尼多兰 → 尼多娜']", "'尼多娜':['尼多兰','尼多兰 → 尼多娜'],'大嘴雀':['烈雀','烈雀 → 大嘴雀']")
  .replace("function parentLoadout(input,heldItem,rp){", "function parentLoadout(input,heldItem,rp,stepNoByNodeId){")
  .replace("return{speciesName:input.output.speciesName,gender:input.output.gender,source:'上一步产物',ivs:copy(input.output.ivs),nature:input.output.nature,heldItem}", "return{speciesName:input.output.speciesName,gender:input.output.gender,source:'第 '+(stepNoByNodeId[input.nodeId]||'?')+' 步产出 · '+input.output.speciesName,ivs:copy(input.output.ivs),nature:input.output.nature,heldItem}")
  .replace("const rp=stage1.resourcePlan,steps=rp.tree.nodes.map((n,index)=>{const sequence=index+1,items=parentItems(n),output=copy(n.output);", "const rp=stage1.resourcePlan,stepNoByNodeId=Object.fromEntries(rp.tree.nodes.map((node,index)=>[node.id,index+1])),steps=rp.tree.nodes.map((n,index)=>{const sequence=index+1,items=parentItems(n),output=copy(n.output);")
  .replace("parentLoadouts:[parentLoadout(n.left,items[0],rp),parentLoadout(n.right,items[1],rp)]", "parentLoadouts:[parentLoadout(n.left,items[0],rp,stepNoByNodeId),parentLoadout(n.right,items[1],rp,stepNoByNodeId)]")
  .replace("displayTitle:outputTitle(sequence,output),dependsOn:[rp.tree.root.id]", "displayTitle:'进化后处理：'+stage1.bt.name+' → '+stage1.species.name,dependsOn:[rp.tree.root.id]")
  .replace('首次打开可迁移 v1.0.12 长期数据', '首次打开可迁移 v1.0.13 长期数据')
  .replace("已从 v1.0.11 迁移目标、价格、长期库存与道具库存", "已从 v1.0.13 迁移目标、价格、长期库存与道具库存")
  .replace("document.getElementById('data-version-badge').textContent='v1.0.13'", "document.getElementById('data-version-badge').textContent='v1.0.9'")
  .replace("document.getElementById('rules-version-badge').textContent='配种树 v1.0.13'", "document.getElementById('rules-version-badge').textContent='配种树 v1.0.9'");
writeFileSync(outputPath, html);
console.log(outputPath.pathname);

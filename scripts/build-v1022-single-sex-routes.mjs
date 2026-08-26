import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const sourceUrl = new URL('../app/pokemmo-breeding-planner-v1.0.21-2026-08-25.html', import.meta.url);
const outputUrl = new URL('../app/pokemmo-breeding-planner-v1.0.22-2026-08-26.html', import.meta.url);
let html = readFileSync(sourceUrl, 'utf8');

function replaceRequired(search, replacement, label) {
  if (!html.includes(search)) throw new Error(`Missing v1.0.21 source fragment: ${label}`);
  html = html.replace(search, replacement);
}

function replaceFunction(name, replacement) {
  const start = html.indexOf(`function ${name}(`);
  if (start < 0) throw new Error(`Missing v1.0.21 function: ${name}`);
  const next = html.indexOf('\nfunction ', start + 10);
  if (next < 0) throw new Error(`Cannot find end of v1.0.21 function: ${name}`);
  html = html.slice(0, start) + replacement.trim() + html.slice(next);
}

html = html
  .replaceAll('v1.0.21', 'v1.0.22')
  .replaceAll('v1_0_21', 'v1_0_22')
  .replace("APP_VERSION='1.0.21'", "APP_VERSION='1.0.22'")
  .replaceAll('pokemmo-breeding-tree-acquisition-ledger-2026-08-24-v1.0.9', 'pokemmo-breeding-tree-single-sex-2026-08-26-v1.0.10')
  .replace("textContent='配种树 v1.0.9'", "textContent='配种树 v1.0.10'")
  .replace("PREVIOUS_STORAGE_KEY='pokemmo_breeding_planner_v1_0_20'", "PREVIOUS_STORAGE_KEY='pokemmo_breeding_planner_v1_0_21'")
  .replace('SCHEMA_VERSION=21', 'SCHEMA_VERSION=22')
  .replaceAll('2026-08-25', '2026-08-26')
  .replace(
    '实际亲本驱动整树孵化物种重算；进化不纳入执行计划 · 可迁移 v1.0.20 完整账本。',
    '开放纯雄百变怪主线；多V百变怪按阶段外购；全局禁止百变怪互配 · 可迁移 v1.0.21 完整账本。',
  )
  .replace('pokemmo-breeding-plan-v1.0.21-', 'pokemmo-breeding-plan-v1.0.22-');

replaceRequired(
  '无性别路线仅允许同种或百变怪配对；纯雄性及特殊 baby 入口在具体案例确认前只提供识别与阻断诊断。',
  '无性别路线仅允许同种或百变怪配对；纯雄目标逐阶段使用外购或库存百变怪；百变怪不能互相配种；成对产物家族继续阻断。',
  'rules limitation',
);

replaceFunction('activeDonorEggGroup', `
function activeDonorEggGroup(bt){if(!bt||isGenderlessRoute(bt)||isMaleOnlyRoute(bt))return null;if(bt.eggGroups.length===1)return bt.eggGroups[0];const selected=APP.target.donorEggGroupBySpecies?.[bt.name];return bt.eggGroups.includes(selected)?selected:null}
`);

replaceFunction('sexFee', `
function sexFee(s,g){if(!s||g==='RANDOM'||g==='N'||g==='GENDERLESS'||['genderless','female_only','male_only'].includes(s.genderType))return 0;if(s.genderType==='skewed_male')return 21000;if(s.genderType==='skewed_male_75'||s.genderType==='skewed_female_75')return 9000;return 5000}
`);

replaceFunction('confirmParentPurchase', `
function confirmParentPurchase(group,speciesName,quantity,unitPrice,note=''){
  const planned=group.purchase.find(row=>row.speciesName===speciesName)?.quantity||0,confirmed=confirmedQuantity('PARENT',group.id,speciesName),remaining=Math.max(0,planned-confirmed),amount=Math.max(1,Math.floor(Number(quantity||1)));
  if(!remaining)return{ok:false,message:'该物种的采购计划已经完成'};if(amount>remaining)return{ok:false,message:'该物种只剩 '+remaining+' 只待购'};
  const leaf=APP.stage1.resourcePlan.tree.leaves.find(item=>group.leafIds.includes(item.id)),price=Math.max(0,Number(unitPrice||0)),memo=String(note||''),existing=APP.purchaseRecords.find(record=>record.kind==='PARENT'&&record.groupId===group.id&&record.speciesName===speciesName&&record.unitPrice===price&&record.note===memo&&!record.consumed&&!record.transferred);if(existing)existing.quantity=Number(existing.quantity)+amount;else APP.purchaseRecords.push({id:id('purchase'),kind:'PARENT',groupId:group.id,speciesName,gender:speciesName==='百变怪'?'GENDERLESS':leaf.gender,ivEntries:copy(leafIvs(leaf)),nature:leaf.nature,quantity:amount,consumed:0,unitPrice:price,note:memo,confirmedAt:new Date().toISOString()});APP.stage1=makeReconciledStage1();invalidateExecutionForAcquisition('亲本采购变化');return{ok:true,remaining:remaining-amount}
}
`);

replaceFunction('executionPlanIsConsistent', `
function executionPlanIsConsistent(stage1,stage2){if(!stage1?.resourcePlan||!Array.isArray(stage2?.steps))return false;const rp=stage1.resourcePlan;for(const group of rp.groups){for(const leafId of group.leafIds){const source=rp.sources[leafId];if(source?.type==='PURCHASE'&&!group.allowed.some(species=>species.name===source.speciesName))return false}}for(const step of stage2.steps.filter(item=>item.kind==='BREEDING')){if(!Array.isArray(step.parentLoadouts)||step.parentLoadouts.length!==2)return false;const left=step.parentLoadouts[0]?.speciesName,right=step.parentLoadouts[1]?.speciesName;if(left==='百变怪'&&right==='百变怪')return false;const maternal=left==='百变怪'?right:left;if(!maternal||step.output?.speciesName!==eggSpeciesFor(maternal))return false}return true}
`);

replaceRequired(
  "function isGenderlessRoute(bt){return bt?.genderType==='genderless'}",
  "function isGenderlessRoute(bt){return bt?.genderType==='genderless'}\nfunction isMaleOnlyRoute(bt){return bt?.genderType==='male_only'}\nconst SPECIAL_PAIRED_OFFSPRING_IDS=new Set(['#029','#030','#031','#032','#033','#034','#313','#314']);",
  'route predicates',
);

replaceFunction('makeSpecies', `
function makeSpecies(row,index){
  const[id,name,eggGroups,genderType,femaleRate,canBreed,py]=row;
  const override=BREEDING_OVERRIDES[name],breedingTargetName=override?override[0]:(canBreed?name:null);
  let supportState=canBreed?'PLANNABLE':(override?'IDENTIFIABLE_ONLY':'NON_BREEDABLE');
  let supportReason=canBreed?'数据覆盖基础 IV、性格、性别和配种树规则。':override?'可识别目标与候选入口，但入口和后处理仍需案例确认。':'该对象没有可确认的基础繁殖入口。';
  if(NON_BREEDABLE.has(name)){supportState='NON_BREEDABLE';supportReason='该对象属于当前图鉴中明确不可通过基础孵蛋达成的对象。'}
  if(canBreed&&SPECIAL_PAIRED_OFFSPRING_IDS.has(id)){supportState='RULES_UNCONFIRMED';supportReason='该物种属于成对产物家族，实际孵化物种并非固定，当前版本不生成猜测路线。'}
  else if(canBreed&&genderType==='male_only')supportReason='纯雄目标使用目标家族主线与逐阶段百变怪配对；多V百变怪必须来自仓库或实际采购。';
  else if(canBreed&&genderType==='genderless')supportReason=name==='百变怪'?'百变怪可作为其他物种的配对亲本，但不能与百变怪互配，也不能通过配种保留自身家族。':'无性别路线只允许同一物种或百变怪作为配对亲本，不使用共享蛋组扩展。';
  return{index,id,name,eggGroups,genderType,femaleRate,canBreed:Boolean(canBreed),py:py||'',supportState,supportReason,breedingTargetName,evolutionChainHint:override?.[1]||null}
}
`);

replaceFunction('renderDonorEggGroup', `
function renderDonorEggGroup(){const select=document.getElementById('target-donor-egg-group'),hint=document.getElementById('target-donor-egg-group-hint'),bt=targetOf(selected());if(!bt||isGenderlessRoute(bt)||isMaleOnlyRoute(bt)){select.innerHTML='<option value="">不适用</option>';select.disabled=true;hint.textContent=isMaleOnlyRoute(bt)?'纯雄目标只使用逐阶段百变怪，不使用活跃捐赠蛋组。':isGenderlessRoute(bt)?'无性别路线不使用活跃捐赠蛋组。':'选择可规划目标后显示蛋组。';return}const groups=bt.eggGroups,current=activeDonorEggGroup(bt)||'';select.innerHTML=(groups.length>1?'<option value="">请选择一个蛋组</option>':'')+groups.map(group=>'<option value="'+X(group)+'">'+X(group)+'</option>').join('');select.value=current;select.disabled=groups.length===1;hint.textContent=groups.length===1?'单蛋组目标已自动锁定。':'整份方案的非百变怪捐赠亲本统一使用所选蛋组。'}
`);

replaceFunction('renderFacts', `
function renderFacts(){const root=document.getElementById('facts-panel'),s=selected(),bt=targetOf(s);if(!s){root.innerHTML='<div class="banner bad"><strong>目标未识别</strong><p>输入必须命中内置图鉴。</p></div>';return}const activeGroup=activeDonorEggGroup(bt),donorLabel=isMaleOnlyRoute(bt)?'不适用（纯雄仅百变怪）':isGenderlessRoute(bt)?'不适用':activeGroup||'未选择';root.innerHTML='<div class="fact-line"><span class="chip '+supportChip(s.supportState)+'">用户目标：'+supportLabel(s.supportState)+'</span><span class="chip '+supportChip(bt?.supportState)+'">育种目标：'+supportLabel(bt?.supportState)+'</span><span class="chip cyan">'+X(s.id)+'</span><span class="chip">蛋群：'+X(s.eggGroups.join(' / '))+'</span><span class="chip">活跃捐赠蛋组：'+X(donorLabel)+'</span><span class="chip">性别：'+genderText(s)+'</span></div><div class="kv-grid" style="margin-top:10px"><div class="kv"><div class="k">用户目标</div><div class="v">'+X(s.name)+'</div></div><div class="kv"><div class="k">育种目标</div><div class="v">'+X(bt?.name||'无')+'</div></div><div class="kv"><div class="k">目标 IV</div><div class="v">'+(selectedIvs().map(ivLabel).join(' + ')||'未设置')+'</div></div><div class="kv"><div class="k">目标性格</div><div class="v">'+(APP.target.nature==='None'?'不限制':APP.target.nature)+'</div></div></div>'}
`);

replaceFunction('diagnosis', `
function diagnosis(s,bt,ivs){
  if(!s)return{code:'TARGET_NOT_FOUND',outcomeClass:'unsupported',level:'bad',title:'目标未识别',explanation:'输入没有命中内置图鉴，系统不会自动替换成其他物种。',repair:'从图鉴名、编号或拼音别名中选择目标。'};
  if(s.supportState==='NON_BREEDABLE'&&!s.breedingTargetName)return{code:'TARGET_NON_BREEDABLE',outcomeClass:'mechanism-impossible',level:'bad',title:'目标不可繁殖',explanation:s.supportReason,repair:'更换为可繁殖对象。'};
  if(!bt)return{code:'NO_ENTRY',outcomeClass:'mechanism-impossible',level:'bad',title:'没有可确认的育种入口',explanation:'当前用户目标没有可解释的基础繁殖入口。',repair:'更换可繁殖目标，或等待规则案例补齐。'};
  if(bt.name==='百变怪')return{code:'DITTO_TARGET_UNAVAILABLE',outcomeClass:'mechanism-impossible',level:'bad',title:'百变怪不能作为育种目标',explanation:'百变怪不能互相配种；与其他物种配种时，孵化产物属于非百变怪方家族。',repair:'将百变怪作为其他可繁殖目标的配对亲本。'};
  if(s.supportState==='IDENTIFIABLE_ONLY'||bt.supportState==='IDENTIFIABLE_ONLY')return{code:'ENTRY_UNCONFIRMED',outcomeClass:'unsupported',level:'warn',title:'入口仅可识别',explanation:'系统识别了目标与候选入口，但该特殊入口尚未通过确认案例，因此不会生成假路线。',repair:'补充真实育种入口、产物和后处理案例。'};
  if(s.supportState==='RULES_UNCONFIRMED'||bt.supportState==='RULES_UNCONFIRMED')return{code:'RULES_UNCONFIRMED',outcomeClass:'unsupported',level:'warn',title:'成对产物规则未确认',explanation:bt.supportReason,repair:'等待该家族实际孵化物种规则确认。'};
  if(!isGenderlessRoute(bt)&&!isMaleOnlyRoute(bt)&&!activeDonorEggGroup(bt))return{code:'DONOR_EGG_GROUP_REQUIRED',outcomeClass:'unsupported',level:'warn',title:'请选择活跃捐赠蛋组',explanation:'该育种目标拥有多个蛋组，捐赠子树必须统一使用其中一个蛋组。',repair:'在目标设定中选择一个活跃捐赠蛋组。'};
  if(!ivs.length&&APP.target.nature==='None')return{code:'NO_CONSTRAINT',outcomeClass:'mechanism-impossible',level:'bad',title:'缺少目标约束',explanation:'至少需要一个目标 IV 或目标性格，规划才有明确对象。',repair:'勾选目标 IV 或指定性格。'};
  if(isGenderlessRoute(bt)&&APP.target.finalGender!=='GENDERLESS')return{code:'GENDER_CONSTRAINT_INVALID',outcomeClass:'mechanism-impossible',level:'bad',title:'性别约束不适用',explanation:'无性别目标必须使用锁定的无性别事实。',repair:'重新选择无性别目标以恢复锁定值。'};
  const explanation=isMaleOnlyRoute(bt)?'纯雄主线只与百变怪配种；每个多V百变怪阶段必须由仓库或实际采购提供，百变怪不能互相配种。':isGenderlessRoute(bt)?'无性别路线只使用目标物种自身或百变怪配对亲本，不收取性别选择费用。':'规则覆盖足够，下面会先显示树形资源分配，再锁定依赖有序的真实配种步骤。';
  return{code:'OK',outcomeClass:'plannable',level:'good',title:'可生成合法主方案',explanation,repair:null}
}
`);

replaceFunction('createTree', `
function createMaleOnlyTree(bt,ivs,nature){
  let nodeNo=0,leafNo=0;const nodes=[],leaves=[];
  const leaf=(type,requiredIvs,role,natureValue,speciesName,gender)=>{const values=requiredIvs.map(iv=>({key:iv.key,value:String(iv.value)})),x={kind:'LEAF',id:'leaf-'+(++leafNo),type,iv:values.length===1?copy(values[0]):null,ivs:values,gender,role,nature:natureValue,speciesName};leaves.push(x);return x};
  const target=(type,requiredIvs,natureValue)=>leaf(type,requiredIvs,'TARGET_MAINLINE',natureValue,bt.name,'M');
  const partner=requiredIvs=>leaf('DITTO_STAGE',requiredIvs,'DITTO_STAGE','None','百变怪','GENDERLESS');
  const makeNode=(left,right,outputIvs,branch,everstone,braces)=>{const node={kind:'NODE',id:'node-'+(++nodeNo),branch,lineageRole:'TARGET_MAINLINE',level:outputIvs.length,ivs:outputIvs.map(iv=>({key:iv.key,value:String(iv.value)})),left,right,outputGender:'M',items:{everstone,braces},dependsOn:left.kind==='NODE'?[left.id]:[]};node.output={id:'temp-'+node.id,speciesName:bt.name,ivs:copy(node.ivs),nature,gender:'M',label:bt.name+(node.ivs.length?' '+ivLabels(node.ivs):'')+(nature!=='None'?' · '+nature:'')};nodes.push(node);return node};
  let root;
  if(nature!=='None'){
    root=target('NATURE_0',[],nature);
    ivs.forEach((iv,index)=>{const required=ivs.slice(0,index+1),right=partner(required);root=makeNode(root,right,required,'MALE_ONLY_NATURE',1,[iv.key])});
  }else{
    root=target('IV_1',ivs.slice(0,1),'None');
    for(let index=1;index<ivs.length;index++){const right=partner(ivs.slice(1,index+1));root=makeNode(root,right,ivs.slice(0,index+1),'MALE_ONLY_PURE',0,[ivs[0].key,ivs[index].key])}
  }
  root.isRoot=true;if(root.kind==='LEAF')root.isTargetLeaf=true;
  return{routeType:'MALE_ONLY',nodes,leaves,root}
}
function createTree(bt,ivs,nature){
  if(isGenderlessRoute(bt))return createGenderlessTree(bt,ivs,nature);
  if(isMaleOnlyRoute(bt))return createMaleOnlyTree(bt,ivs,nature);
  let n=0,l=0;const nodes=[],leaves=[];
  function leaf(type,iv,gender,role){const x={kind:'LEAF',id:'leaf-'+(++l),type,iv:iv&&{key:iv.key,value:String(iv.value)},gender,role,nature:type==='NATURE_0'?nature:'None',speciesName:bt.name};leaves.push(x);return x}
  function pure(keys,outputGender,role){if(keys.length===1)return leaf('IV_1',keys[0],outputGender,role);const left=pure(keys.slice(0,-1),'F',role),right=pure(keys.slice(1),'M','DONOR'),node={kind:'NODE',id:'node-'+(++n),branch:'PURE',lineageRole:role,level:keys.length,ivs:keys.map(x=>({key:x.key,value:String(x.value)})),left,right,outputGender,items:{everstone:0,braces:[keys[0].key,keys[keys.length-1].key]},dependsOn:[left,right].filter(x=>x.kind==='NODE').map(x=>x.id)};node.output={id:'temp-'+node.id,speciesName:bt.name,ivs:node.ivs,nature:'None',gender:outputGender,label:bt.name+' '+ivLabels(node.ivs)};nodes.push(node);return node}
  function natureNode(keys,outputGender){if(!keys.length)return leaf('NATURE_0',null,'F','TARGET_MAINLINE');const left=natureNode(keys.slice(0,-1),'F'),right=pure(keys,'M','DONOR'),node={kind:'NODE',id:'node-'+(++n),branch:'NATURE',lineageRole:'TARGET_MAINLINE',level:keys.length,ivs:keys.map(x=>({key:x.key,value:String(x.value)})),left,right,outputGender,items:{everstone:1,braces:[keys[keys.length-1].key]},dependsOn:[left,right].filter(x=>x.kind==='NODE').map(x=>x.id)};node.output={id:'temp-'+node.id,speciesName:bt.name,ivs:node.ivs,nature,gender:outputGender,label:bt.name+(node.ivs.length?' '+ivLabels(node.ivs):'')+' · '+nature};nodes.push(node);return node}
  let root;if(nature!=='None'){if(ivs.length)root=natureNode(ivs,APP.target.finalGender);else{const left=leaf('NATURE_0',null,'F','TARGET_MAINLINE'),right=leaf('NEUTRAL',null,'M','DONOR');root={kind:'NODE',id:'node-'+(++n),branch:'NATURE',lineageRole:'TARGET_MAINLINE',level:0,ivs:[],left,right,outputGender:APP.target.finalGender,items:{everstone:1,braces:[]},dependsOn:[]};root.output={id:'temp-'+root.id,speciesName:bt.name,ivs:[],nature,gender:APP.target.finalGender,label:bt.name+' · '+nature};nodes.push(root)}}else root=pure(ivs,APP.target.finalGender,'TARGET_MAINLINE');if(root.kind==='LEAF')root.isTargetLeaf=true;root.isRoot=true;return{routeType:'GENDERED',nodes,leaves,root}
}
`);

replaceFunction('leafKey', `
function leafIvs(leaf){return Array.isArray(leaf.ivs)?leaf.ivs:(leaf.iv?[leaf.iv]:[])}
function leafKey(leaf){return[leaf.type,leaf.gender,leaf.role||'',leafIvs(leaf).map(iv=>iv.key+'-'+iv.value).join('+')||'0V',leaf.nature].join('|')}
`);

replaceFunction('legalSpecies', `
function legalSpecies(leaf,bt){
  if(leaf.role==='DITTO_STAGE')return[ditto()].filter(Boolean);
  if(isGenderlessRoute(bt))return leaf.isTargetLeaf||leaf.role==='GENDERLESS_MAINLINE'?[bt]:[...new Map([bt,ditto()].filter(Boolean).map(s=>[s.name,s])).values()];
  if(leaf.isTargetLeaf||leaf.role==='TARGET_MAINLINE')return[bt];
  const group=activeDonorEggGroup(bt);return APP.catalog.filter(s=>s.supportState==='PLANNABLE'&&s.canBreed&&(s.name==='百变怪'||(s.eggGroups.includes(group)&&(!lockedGender(s)||lockedGender(s)===leaf.gender))))
}
`);

replaceFunction('leafFit', `
function leafFit(item,leaf,bt,targetIvs){
  const s=findSpecies(item.speciesName);if(!s)return{level:'NO',reason:'物种未识别'};
  if(leaf.role==='DITTO_STAGE'){
    if(s.name!=='百变怪'||item.gender!=='GENDERLESS')return{level:'NO',reason:'该阶段必须使用百变怪'};
    const required=leafIvs(leaf),hasAll=required.every(iv=>item.ivEntries.some(entry=>entry.key===iv.key&&String(entry.value)===String(iv.value)));
    if(!hasAll)return{level:'NO',reason:'未携带该阶段所需的完整 IV 组合'};
    const extras=item.ivEntries.filter(entry=>targetIvs.some(iv=>entry.key===iv.key&&String(entry.value)===String(iv.value))&&!required.some(iv=>entry.key===iv.key&&String(entry.value)===String(iv.value)));
    return extras.length?{level:'WASTE',reason:'可用但包含该阶段之外的目标 IV'}:{level:'STRICT',reason:'严格符合 '+required.length+'V 百变怪阶段'}
  }
  if(isGenderlessRoute(bt)){
    if(item.gender!=='GENDERLESS')return{level:'NO',reason:'不是无性别个体'};
    if((leaf.isTargetLeaf||leaf.role==='GENDERLESS_MAINLINE')&&s.name!==bt.name)return{level:'NO',reason:'无性别主线必须是目标物种'};
    if(!leaf.isTargetLeaf&&leaf.role!=='GENDERLESS_MAINLINE'&&s.name!==bt.name&&s.name!=='百变怪')return{level:'NO',reason:'无性别配对亲本仅限同种或百变怪'}
  }else if(leaf.isTargetLeaf||leaf.role==='TARGET_MAINLINE'){if(s.name!==bt.name)return{level:'NO',reason:'不是目标物种主线'};if(leaf.gender!=='RANDOM'&&item.gender!==leaf.gender)return{level:'NO',reason:'性别不符合'}}else{const isDitto=s.name==='百变怪';if(isDitto){if(item.gender!=='GENDERLESS')return{level:'NO',reason:'百变怪必须登记为无性别'}}else{if(item.gender!==leaf.gender)return{level:'NO',reason:'性别不符合'};if(!s.eggGroups.includes(activeDonorEggGroup(bt)))return{level:'NO',reason:'不属于活跃捐赠蛋组'}}}
  if(leaf.type==='NATURE_0'){if(item.nature!==leaf.nature)return{level:'NO',reason:'性格不符合'};return item.ivEntries.some(e=>targetIvs.some(iv=>e.key===iv.key&&String(e.value)===String(iv.value)))?{level:'NO',reason:isGenderlessRoute(bt)?'性格 0V 主线亲本拥有目标 IV':'性格主线 0V 亲本拥有目标 IV'}:{level:'STRICT',reason:'严格符合目标性格 0V 主线条件'}}
  if(leaf.type==='NEUTRAL')return{level:'STRICT',reason:isGenderlessRoute(bt)?'仅性格路线无性别配对亲本':'仅性格路线雄性亲本'};
  const required=leafIvs(leaf);if(!required.every(iv=>item.ivEntries.some(e=>e.key===iv.key&&String(e.value)===String(iv.value))))return{level:'NO',reason:'未携带所需 IV'};
  const extras=item.ivEntries.filter(e=>targetIvs.some(iv=>e.key===iv.key&&String(e.value)===String(iv.value))&&!required.some(iv=>e.key===iv.key&&String(e.value)===String(iv.value)));
  return extras.length?{level:'WASTE',reason:'可用但会浪费高阶属性'}:{level:'STRICT',reason:'严格符合 '+required.length+'V 条件'}
}
`);

replaceFunction('groupsFor', `
function groupsFor(tree,bt){
  const map=new Map();
  tree.leaves.forEach(leaf=>{const key=leafKey(leaf),required=leafIvs(leaf);if(!map.has(key))map.set(key,{id:key,type:leaf.type,gender:leaf.gender,role:leaf.role||null,iv:leaf.iv,ivs:copy(required),nature:leaf.nature,leafIds:[],quantity:0,unitPrice:leaf.type==='DITTO_STAGE'?0:leaf.type==='NATURE_0'||leaf.type==='NEUTRAL'?Number(APP.pricing.natureBase||0):Number(APP.pricing.ivPrices[required[0]?.key]||0),allowed:legalSpecies(leaf,bt)});const g=map.get(key);g.leafIds.push(leaf.id);g.quantity++});return[...map.values()]
}
`);

replaceFunction('resourcePlan', `
function resourcePlan(s,bt,ivs,d){
  if(d.outcomeClass!=='plannable')return null;
  const activeGroup=activeDonorEggGroup(bt),tree=createTree(bt,orderedIvs(ivs),APP.target.nature),groups=groupsFor(tree,bt);groups.forEach(group=>{group.displayTitle=groupTitle(group);group.displayRole=groupRole(group,tree,activeGroup)});const allocation=allocate(groups,tree,bt,ivs);resolveTreeSpecies(tree,allocation.sources,bt);allocation.assigned=syncAllocation(groups,allocation.sources);const items=itemsFor(tree),parentYen=groups.reduce((sum,g)=>sum+g.purchase.reduce((n,p)=>n+p.quantity,0)*g.unitPrice,0),itemYen=items.filter(x=>x.currency==='yen').reduce((sum,x)=>sum+x.purchase*x.unit,0),itemBp=items.filter(x=>x.currency==='BP').reduce((sum,x)=>sum+x.purchase*x.unit,0),gender=costs(tree,bt),natureLeaves=tree.leaves.filter(x=>x.type==='NATURE_0').length,oneV=tree.leaves.filter(x=>x.type==='IV_1').length,dittoStages=tree.leaves.filter(x=>x.type==='DITTO_STAGE'),natureText=tree.routeType==='GENDERLESS'?'无性别目标性格 0V 主线亲本 1':tree.routeType==='MALE_ONLY'?APP.target.nature+' 纯雄目标家族 0V 主线亲本 1':APP.target.nature+' 雌性 0V 亲本 1';
  const assignedCount=[...allocation.assigned.values()].reduce((a,b)=>a+b,0),purchaseCount=groups.reduce((a,g)=>a+g.purchase.reduce((n,p)=>n+p.quantity,0),0),maleOnlyText=tree.routeType==='MALE_ONLY'?'；百变怪阶段 '+dittoStages.map(leaf=>leafIvs(leaf).length+'V（'+ivLabels(leafIvs(leaf))+'）').join('、')+'。多V百变怪不能由1V百变怪合成。':'';
  return{activeDonorEggGroup:activeGroup,tree,groups,items,sources:allocation.sources,statuses:allocation.statuses,assigned:allocation.assigned,parentYen,itemYen,itemBp,gender,leafTotal:tree.leaves.length,natureLeaves,oneV,dittoStages:dittoStages.length,breedingYen:parentYen+itemYen+Object.values(gender).filter(x=>typeof x==='number').reduce((a,b)=>a+b,0),summary:'基础亲本总数 '+tree.leaves.length+' = 1V 亲本 '+oneV+(natureLeaves?' + '+natureText:'')+'；库存 '+assignedCount+'，待购 '+purchaseCount+maleOnlyText}
}
`);

replaceFunction('inheritanceInstruction', `
function inheritanceInstruction(loadouts,routeType){if(routeType==='GENDERLESS'||routeType==='MALE_ONLY'||loadouts?.[0]?.speciesName==='百变怪')return'继承非百变怪方';return'继承母方'}
`);

replaceFunction('parentLoadout', `
function parentLoadout(input,heldItem,rp,stepNoByNodeId){
  if(input.kind==='LEAF'){const source=rp.sources[input.id],inventory=source.type==='INVENTORY'?APP.inventory.find(item=>item.id===source.inventoryId):null,gender=inventory?.gender||(source.speciesName==='百变怪'?'GENDERLESS':input.gender);return{speciesName:source.speciesName,gender,source:source.type==='INVENTORY'?'仓库':'市场',ivs:copy(leafIvs(input)),nature:input.nature,heldItem}}
  return{speciesName:input.output.speciesName,gender:input.output.gender,source:sourceStepLabel(input.id,input.output.speciesName,stepNoByNodeId),ivs:copy(input.output.ivs),nature:input.output.nature,heldItem}
}
`);

replaceFunction('buildStage2', `
function buildStage2(stage1){
  const rp=stage1.resourcePlan,stepNoByNodeId=Object.fromEntries(rp.tree.nodes.map((node,index)=>[node.id,index+1])),steps=rp.tree.nodes.map((n,index)=>{const sequence=index+1,items=parentItems(n),output=copy(n.output),parentLoadouts=[parentLoadout(n.left,items[0],rp,stepNoByNodeId),parentLoadout(n.right,items[1],rp,stepNoByNodeId)],inheritance=inheritanceInstruction(parentLoadouts,rp.tree.routeType),fixedMale=rp.tree.routeType==='MALE_ONLY';return{id:n.id,kind:'BREEDING',routeType:rp.tree.routeType,branch:n.branch,lineageRole:n.lineageRole||null,level:n.level,ivs:n.ivs,left:n.left.kind==='LEAF'?{type:'LEAF',leafId:n.left.id}:{type:'TEMP',id:n.left.output.id,nodeId:n.left.id},right:n.right.kind==='LEAF'?{type:'LEAF',leafId:n.right.id}:{type:'TEMP',id:n.right.output.id,nodeId:n.right.id},sequence,displayTitle:outputTitle(sequence,output,inheritance),inheritanceInstruction:inheritance,lockInstruction:fixedMale?'无需锁性别（固定雄性）':lockInstruction(output.gender),parentLoadouts,dependsOn:n.dependsOn,items:copy(n.items),output,isFinal:n.isRoot,status:'PENDING',batch:(n.lineageRole||'ROUTE')+'-'+n.branch+'-'+n.level+'-'+ivLabels(n.ivs)}});
  return{fingerprint:stage1.meta.fingerprint,stale:false,steps,temporaryPool:[],ledger:[],snapshots:{},initialInventory:copy(APP.inventory),initialItems:copy(APP.items),initialPurchaseRecords:copy(APP.purchaseRecords)}
}
`);

replaceFunction('groupTitle', `
function groupTitle(g){
  if(g.type==='DITTO_STAGE')return g.ivs.length+'V 百变怪 · '+ivLabels(g.ivs);
  const genderless=g.role==='GENDERLESS_MAINLINE'||g.role==='GENDERLESS_PAIRING_PARENT';
  if(g.type==='NATURE_0')return g.nature+' · '+(genderless?'无性别':sex(g.gender))+' · 0V';
  if(g.type==='NEUTRAL')return'仅性格路线 · '+(genderless?'无性别':sex(g.gender));
  return ivLabels(g.ivs?.length?g.ivs:[g.iv])+' · '+(genderless?'无性别':sex(g.gender))
}
`);

replaceFunction('groupRole', `
function groupRole(g,tree,activeGroup){
  if(g.role==='DITTO_STAGE')return'百变怪阶段';
  const mainline=g.role==='GENDERLESS_MAINLINE'||g.role==='TARGET_MAINLINE';
  if(mainline)return'目标物种';
  return tree.routeType==='GENDERLESS'?'配对亲本':activeGroup+'蛋组'
}
`);

replaceFunction('groupCard', `
function groupCard(g,rp,stage){
  const override=APP.overrides[g.id]||{},leaf=rp.tree.leaves.find(x=>x.id===g.leafIds[0]),manual=APP.inventory.filter(x=>leafFit(x,leaf,stage.bt,stage.ivs).level!=='NO'),progress=purchaseProgress(g),manualAllocated=g.purchase.filter(x=>x.allocation==='MANUAL').reduce((a,x)=>a+x.quantity,0),fallback=g.purchase.find(x=>x.allocation==='FALLBACK')?.speciesName||g.allowed.find(x=>x.name===stage.bt.name)?.name||g.allowed.find(x=>x.name!=='百变怪')?.name||g.allowed[0]?.name||stage.bt.name,genderless=rp.tree.routeType==='GENDERLESS',maleOnly=rp.tree.routeType==='MALE_ONLY',mainline=g.role==='GENDERLESS_MAINLINE'||g.role==='TARGET_MAINLINE',roleHint=g.role==='DITTO_STAGE'?'该阶段必须使用携带完整指定 IV 组合的百变怪；不能由低V百变怪互配合成。':genderless?(mainline?'无性别主线只能使用育种目标物种。':'无性别配对亲本仅可使用育种目标物种或百变怪。'):(mainline?'目标物种主线不能由百变怪或其他物种替代。':'普通亲本必须属于 '+rp.activeDonorEggGroup+' 蛋组；百变怪作为后备且不能互相配对。');
  const inventoryRows=g.inventory.length?'<div class="source-tag"><span>仓库：'+g.inventory.map(x=>APP.inventory.find(i=>i.id===x)?.speciesName||'库存').join('；')+'</span></div>':'';
  const purchaseRows=g.purchase.map(row=>{const key=g.id+'|'+row.speciesName,bought=Math.min(row.quantity,confirmedQuantity('PARENT',g.id,row.speciesName)),left=Math.max(0,row.quantity-bought),records=recordsFor('PARENT',g.id).filter(record=>record.speciesName===row.speciesName);return'<section class="purchase-source"><div class="purchase-source-head"><strong class="combo inline-purchase-combo">'+(row.allocation==='MANUAL'?'待购来源':'自动补位')+'：<input class="inline-purchase-species" value="'+X(row.speciesName)+'" data-buy-species-input="'+X(key)+'" data-buy-group="'+X(g.id)+'" data-buy-current="'+X(row.speciesName)+'" aria-label="购买物种"></strong><span class="small">计划 '+row.quantity+' · 已购 '+bought+' · 待购 '+left+'</span></div>'+(row.allocation==='MANUAL'&&!bought?'<div class="purchase-actions"><button class="purchase-action danger" data-purchase-remove="'+X(g.id)+'" data-purchase-source="'+X(row.speciesName)+'">移除指定来源</button></div>':'')+(left?'<div class="purchase-entry-form"><div class="purchase-field"><label>数量</label><input type="number" min="1" max="'+left+'" value="1" data-buy-quantity="'+X(key)+'"></div><div class="purchase-field"><label>成交单价</label><input type="number" min="0" value="'+g.unitPrice+'" data-buy-price="'+X(key)+'"></div><div class="purchase-field note"><label>备注</label><input value="" data-buy-note="'+X(key)+'" placeholder="可选"></div><button class="btn btn-good" data-buy-parent="'+X(g.id)+'" data-buy-species="'+X(row.speciesName)+'">确认购入</button></div>':'')+purchaseError(key)+purchaseHistory(records,'yen')+'</section>'}).join('');
  const reference=g.type==='DITTO_STAGE'?'参考价未设置；实际购入后按成交单价计入审计。':'参考价 '+yen(g.unitPrice)+' / 只';
  return'<article class="resource-card '+(g.type==='NATURE_0'?'nature':'')+'"><h4>'+X(g.displayTitle)+'</h4><div class="chips"><span class="chip '+(mainline?'violet':'cyan')+'">'+X(g.displayRole)+'</span><span class="chip">需求叶子 '+g.leafIds.length+'</span></div><div class="purchase-strip" style="margin-top:8px"><div class="metric"><div class="label">需求</div><div class="value">'+g.quantity+'</div></div><div class="metric"><div class="label">仓库</div><div class="value">'+g.inventory.length+'</div></div><div class="metric"><div class="label">待购</div><div class="value">'+progress.remaining+'</div></div><div class="metric"><div class="label">已购</div><div class="value">'+progress.confirmed+'</div></div></div><p class="small">'+reference+'</p>'+(manual.length?'<label class="small">手动仓库来源<select class="inline-select" data-group-inventory="'+X(g.id)+'"><option value="">自动严格匹配</option>'+manual.map(x=>{const fit=leafFit(x,leaf,stage.bt,stage.ivs),note=fit.level==='WASTE'?' · 会浪费额外目标 IV':x.speciesName==='百变怪'?' · 百变怪':'';return'<option value="'+x.id+'" '+(override.inventoryId===x.id?'selected':'')+'>'+X(x.speciesName)+' · '+x.quantity+' 只'+note+'</option>'}).join('')+'</select></label>':'')+'<div class="source-list">'+inventoryRows+purchaseRows+'</div><div class="micro" style="margin-top:10px">'+roleHint+'</div></article>'
}
`);

replaceFunction('renderStage1', `
function renderStage1(){
  const root=document.getElementById('stage1-results'),p=APP.stage1;if(!p){root.innerHTML='<div class="empty">修改左侧输入后生成第一阶段结果。</div>';document.getElementById('btn-generate-stage2').disabled=true;return}
  const d=p.diagnosis;let h='<div class="list">'+(p.meta.stale?'<div class="banner warn"><strong>输入已变化，需要重新生成</strong><p>旧方案仅保留用于对照；重新生成前不能锁定执行计划。</p></div>':'')+'<div class="banner '+(d.level==='good'?'good':d.level==='warn'?'warn':'bad')+'"><strong>'+d.title+'</strong><p>'+d.explanation+'</p>'+(d.repair?'<p><b>最小修复：</b>'+d.repair+'</p>':'')+'</div><div class="item"><h3>用户目标 / 育种目标</h3><p>用户目标：'+X(p.species?.name||'未识别')+'；育种目标：'+X(p.bt?.name||'无')+'</p><p>'+p.entry+'</p></div>';
  if(p.resourcePlan){const r=p.resourcePlan,genderless=r.tree.routeType==='GENDERLESS',maleOnly=r.tree.routeType==='MALE_ONLY',natureRole=genderless?'无性别 0V 主线 1':maleOnly?'固定雄性目标家族 0V 主线 1':'0V 雌性 1',routeNote=maleOnly?'<p class="micro">纯雄路线：左侧始终是目标家族主线，右侧是当前阶段所需的百变怪。多V百变怪不能由1V百变怪合成，必须来自仓库或实际采购；百变怪不能互相配种。</p>':genderless?'<p class="micro">无性别路线：左侧为目标物种主线；右侧只能使用同种或百变怪。无性别路线不收取性别选择费用。</p>':'';h+='<div class="item"><h3>确定性配种树</h3><p>'+r.summary+'</p><div class="tree-summary"><div class="tree-band"><strong>基础亲本</strong><span class="small">'+r.leafTotal+' 个</span></div><div class="tree-band"><strong>真实配种节点</strong><span class="small">'+r.tree.nodes.length+' 次</span></div><div class="tree-band"><strong>目标性格</strong><span class="small">'+(p.nature==='None'?'未指定':p.nature+' · '+natureRole)+'</span></div></div>'+routeNote+'<div class="resource-grid" style="margin-top:10px">'+r.groups.map(g=>groupCard(g,r,p)).join('')+'</div></div><div class="item"><h3>道具库存计划</h3><div class="item-audit">'+r.items.filter(x=>x.need).map(x=>'<div class="metric"><div class="label">'+x.label+'</div><div class="value">需 '+x.need+' / 仓库 '+x.have+' / 待购 '+x.purchase+'</div><div class="small">'+(x.currency==='BP'?x.unit+' BP':yen(x.unit))+' / 个</div></div>').join('')+'</div></div>'}
  root.innerHTML=h+'</div>';renderItemAcquisitionControls();renderPurchaseCombos();document.getElementById('btn-generate-stage2').disabled=d.outcomeClass!=='plannable'||p.meta.stale
}
`);

replaceFunction('persistedParentLoadout', `
function persistedParentLoadout(input,heldItem,stage){
  if(input.type==='LEAF'){const leaf=stage.resourcePlan.tree.leaves.find(x=>x.id===input.leafId),source=stage.resourcePlan.sources[input.leafId],inventory=source.type==='INVENTORY'?APP.inventory.find(item=>item.id===source.inventoryId):null,gender=inventory?.gender||(source.speciesName==='百变怪'?'GENDERLESS':leaf.gender);return{speciesName:source.speciesName,gender,source:source.type==='INVENTORY'?'仓库':'市场',ivs:copy(leafIvs(leaf)),nature:leaf.nature,heldItem}}
  const output=APP.stage2.steps.find(step=>step.id===input.nodeId)?.output;return{speciesName:output?.speciesName,gender:output?.gender,source:'上一步产物',ivs:output?.ivs||[],nature:output?.nature||'None',heldItem}
}
`);

replaceFunction('renderAudit', `
function renderAudit(){
  const root=document.getElementById('audit-results'),p=APP.stage1;if(!p?.resourcePlan){root.innerHTML='<div class="empty">生成可行路线后显示完整审计。</div>';return}
  const r=p.resourcePlan,completion=breedingCompletionName(p),fixedSex=['GENDERLESS','MALE_ONLY'].includes(r.tree.routeType),selectionRows=fixedSex?'<tr><td>性别选择费用</td><td>¥0</td><td>实际孵化物种为固定性别，不需要选择</td></tr>':'<tr><td>性格主线雌性选择</td><td>'+yen(r.gender.natureFemale)+'</td><td>每层左侧中间产物</td></tr><tr><td>纯 IV 雄性选择</td><td>'+yen(r.gender.pureMale)+'</td><td>每层右侧中间产物</td></tr><tr><td>最终性别选择</td><td>'+yen(r.gender.final)+'</td><td>只作用于树根</td></tr>';
  root.innerHTML='<div class="kv-grid"><div class="kv"><div class="k">用户目标</div><div class="v">'+X(p.species?.name||'未识别')+'</div></div><div class="kv"><div class="k">配种完成产物</div><div class="v">'+X(completion)+'</div><div class="small">后续进化不纳入执行计划</div></div><div class="kv"><div class="k">breeding yen</div><div class="v">'+yen(r.breedingYen)+'</div></div><div class="kv"><div class="k">breeding BP</div><div class="v">'+r.itemBp+' BP</div></div><div class="kv"><div class="k">基础亲本</div><div class="v">'+r.leafTotal+'</div></div><div class="kv"><div class="k">真实节点</div><div class="v">'+r.tree.nodes.length+'</div></div></div><div class="scroll-x" style="margin-top:10px"><table class="audit-table"><thead><tr><th>项目</th><th>金额</th><th>说明</th></tr></thead><tbody><tr><td>市场亲本</td><td>'+yen(r.parentYen)+'</td><td>计划专属待购输入；多V百变怪以05实际成交价为准</td></tr><tr><td>待购道具（yen）</td><td>'+yen(r.itemYen)+'</td><td>不变之石或金币 brace</td></tr><tr><td>待购道具（BP）</td><td>'+r.itemBp+' BP</td><td>不换算为金币</td></tr>'+selectionRows+'<tr><td>后续进化</td><td>不计入</td><td>不纳入执行计划</td></tr></tbody></table></div>'
}
`);

replaceRequired(
  "if(migrated&&APP.stage2&&!executionPlanIsConsistent(APP.stage1,APP.stage2)){APP.stage2=null;APP.notice='已从 v1.0.20 迁移目标、长期库存和采购记录；检测到旧执行方案的亲本或孵蛋物种不一致，已解除锁定，请重新确认资源并锁定。'}else if(migrated)APP.notice='已从 v1.0.20 迁移完整账本；已按实际亲本重算孵化物种、移除进化步骤并升级产物说明。'",
  "if(migrated&&APP.stage2&&!executionPlanIsConsistent(APP.stage1,APP.stage2)){APP.stage2=null;APP.notice='已从 v1.0.21 迁移目标、长期库存和采购记录；检测到旧执行方案与纯雄或百变怪规则不一致，已解除锁定，请重新确认资源并锁定。'}else if(migrated)APP.notice='已从 v1.0.21 迁移完整账本；纯雄路线已升级为逐阶段百变怪采购模型。'",
  'migration notice',
);

writeFileSync(outputUrl, html);
console.log(fileURLToPath(outputUrl));

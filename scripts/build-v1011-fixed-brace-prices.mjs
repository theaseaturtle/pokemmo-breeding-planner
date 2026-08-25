import { readFileSync, writeFileSync } from 'node:fs';

const sourcePath = new URL('../app/pokemmo-breeding-planner-v1.0.10-2026-08-25.html', import.meta.url);
const outputPath = new URL('../app/pokemmo-breeding-planner-v1.0.11-2026-08-25.html', import.meta.url);
let html = readFileSync(sourcePath, 'utf8')
  .replaceAll('v1.0.10', 'v1.0.11')
  .replaceAll('v1_0_10', 'v1_0_11')
  .replace("APP_VERSION='1.0.10'", "APP_VERSION='1.0.11'")
  .replaceAll('pokedex-gen1-5-bootstrap-2026-08-24-v1.0.10', 'pokedex-gen1-5-bootstrap-2026-08-24-v1.0.9')
  .replaceAll('pokemmo-breeding-tree-acquisition-ledger-2026-08-24-v1.0.10', 'pokemmo-breeding-tree-acquisition-ledger-2026-08-24-v1.0.9')
  .replace("PREVIOUS_STORAGE_KEY='pokemmo_breeding_planner_v1_0_9'", "PREVIOUS_STORAGE_KEY='pokemmo_breeding_planner_v1_0_10'")
  .replace('SCHEMA_VERSION=10', 'SCHEMA_VERSION=11')
  .replace("staleHistory:[],notice:''", "staleHistory:[],notice:''")
  .replace("everstone:0,brace:{}", "everstone:0,brace:{}")
  .replace("pricing:{braceMode:'YEN',purchaseMode:'MARKET',ivPrices:{},natureBase:0,everstone:0}", "pricing:{braceMode:'YEN',purchaseMode:'MARKET',ivPrices:{},natureBase:0,everstone:0,braceCurrencyByKey:{}}")
  .replace("Object.assign(APP.pricing,x.pricing||{});APP.pricing.braceMode='YEN';", "Object.assign(APP.pricing,x.pricing||{});APP.pricing.braceCurrencyByKey={...(APP.pricing.braceCurrencyByKey||{})};APP.pricing.braceMode='YEN';")
  .replace("const x=RULES.fixedBrace[APP.pricing.braceMode];rows.push({key:'brace:'+f.key,label:f.item,need:need.brace[f.key],have:Number(APP.items.brace[f.key]||0),currency:x.unit,unit:x.amount})", "const currency=APP.pricing.braceCurrencyByKey['brace:'+f.key]||'yen';rows.push({key:'brace:'+f.key,label:f.item,need:need.brace[f.key],have:Number(APP.items.brace[f.key]||0),currency,unit:currency==='BP'?750:10000})")
  .replace("function editPurchasePrice(recordId,unitPrice,note){const record=APP.purchaseRecords.find(item=>item.id===recordId);if(!record)return{ok:false,message:'采购记录不存在'};", "function editPurchasePrice(recordId,unitPrice,note){const record=APP.purchaseRecords.find(item=>item.id===recordId);if(!record)return{ok:false,message:'采购记录不存在'};if(record.kind==='ITEM'&&String(record.itemKey||'').startsWith('brace:'))return{ok:false,message:'锁个体道具价格固定为金币 10000 或 BP 750'};")
  .replace("return'<article class=\"metric item-acquisition\"><div class=\"label\">'+X(item.label)+'</div>", "const fixedBrace=item.key.startsWith('brace:');return'<article class=\"metric item-acquisition\"><div class=\"label\">'+X(item.label)+'</div>")
  .replace(`<input type="number" min="0" value="'+item.unit+'" data-buy-item-price="'+X(item.key)+'">`, `'+(fixedBrace?'<select data-buy-item-currency="'+X(item.key)+'"><option value="yen" '+(item.currency==='yen'?'selected':'')+'>金币 · 10000</option><option value="BP" '+(item.currency==='BP'?'selected':'')+'>BP · 750</option></select>':'<input type="number" min="0" value="'+item.unit+'" data-buy-item-price="'+X(item.key)+'">')+'`)
  .replace("quantity=Number(document.querySelector('[data-buy-item-quantity=\"'+CSS.escape(item.key)+'\"]')?.value||1),unitPrice=Number(document.querySelector('[data-buy-item-price=\"'+CSS.escape(item.key)+'\"]')?.value||0),note=", "quantity=Number(document.querySelector('[data-buy-item-quantity=\"'+CSS.escape(item.key)+'\"]')?.value||1),currencySelect=document.querySelector('[data-buy-item-currency=\"'+CSS.escape(item.key)+'\"]'),currency=currencySelect?.value||item.currency,unitPrice=item.key.startsWith('brace:')?(currency==='BP'?750:10000):Number(document.querySelector('[data-buy-item-price=\"'+CSS.escape(item.key)+'\"]')?.value||0);if(item.key.startsWith('brace:')){item.currency=currency;item.unit=unitPrice;APP.pricing.braceCurrencyByKey[item.key]=currency}const note=")
  .replace('首次打开可迁移 v1.0.9 长期数据', '首次打开可迁移 v1.0.10 长期数据')
  .replace("已从 v1.0.8 迁移目标、价格、长期库存与道具库存", "已从 v1.0.10 迁移目标、价格、长期库存与道具库存")
  .replace("document.getElementById('data-version-badge').textContent='v1.0.10'", "document.getElementById('data-version-badge').textContent='v1.0.9'")
  .replace("document.getElementById('rules-version-badge').textContent='配种树 v1.0.10'", "document.getElementById('rules-version-badge').textContent='配种树 v1.0.9'");
writeFileSync(outputPath, html);
console.log(outputPath.pathname);

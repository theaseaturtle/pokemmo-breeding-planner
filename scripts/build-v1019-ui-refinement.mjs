import { readFileSync, writeFileSync } from 'node:fs';

const sourcePath = new URL('../app/pokemmo-breeding-planner-v1.0.18-2026-08-25.html', import.meta.url);
const outputPath = new URL('../app/pokemmo-breeding-planner-v1.0.19-2026-08-25.html', import.meta.url);

const uiStyles = String.raw`
/* v1.0.19 focused-workbench refinement */
:root{
  --ink:#edf3f4;--muted:#9aabb1;--dim:#708188;--bg:#081115;
  --surface:#101c21;--surface2:#14242a;--surface3:#1a2d33;--line:#294047;
  --cyan:#61d0c8;--yellow:#d9b96c;--red:#dc7b7b;--green:#79c99d;
  --blue:#8baebd;--violet:#a9b7bd;--shadow:0 18px 52px #03101499;--radius:14px;
}
html{scroll-behavior:smooth;scroll-padding-top:84px}
body{background:radial-gradient(circle at 82% -10%,#163039 0,transparent 35rem),linear-gradient(180deg,#081115 0%,#0b1519 100%);font:500 14px/1.6 "Segoe UI Variable","Bahnschrift","PingFang SC","Microsoft YaHei",sans-serif}
body:before{content:"";position:fixed;inset:0;pointer-events:none;z-index:0;opacity:.16;background-image:radial-gradient(#b9d6d6 0.55px,transparent 0.55px);background-size:7px 7px;mask-image:linear-gradient(to bottom,#0008,transparent 70%)}
.skip-link{position:fixed;left:16px;top:12px;z-index:1000;padding:9px 12px;border-radius:7px;background:var(--cyan);color:#061013;font-weight:750;transform:translateY(-160%);transition:transform .2s ease}
.skip-link:focus{transform:translateY(0)}
.app{position:relative;z-index:1;max-width:1540px;padding:28px 24px 72px}
.masthead{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:32px;padding:10px 4px 24px;margin-bottom:14px;border-bottom:0}
.masthead h1{font-size:clamp(30px,3.2vw,48px);line-height:1.08;letter-spacing:-.035em;text-wrap:balance}
.lede{max-width:64ch;font-size:14px;line-height:1.7;text-wrap:pretty}
.eyebrow{letter-spacing:.16em;color:#7fd8d1}
.version-stack{display:grid;grid-template-columns:auto auto;align-content:start;gap:7px 8px;padding-top:4px}
.version-stack .badge{justify-content:center;border-radius:6px;background:#0d191d}
.workflow-nav{position:sticky;top:8px;z-index:300;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:1px;margin:0 0 18px;padding:5px;border:1px solid #355058;background:#0c171bd9;box-shadow:0 14px 38px #04101488;backdrop-filter:blur(16px);border-radius:12px}
.workflow-nav a{display:flex;align-items:center;gap:10px;min-width:0;padding:9px 12px;border-radius:8px;color:var(--muted);text-decoration:none;transition:background .2s ease,color .2s ease,transform .2s ease}
.workflow-nav a:hover,.workflow-nav a:focus-visible{background:#1a3036;color:var(--ink);transform:translateY(-1px)}
.workflow-nav b{color:var(--cyan);font:700 11px/1 ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.08em}
.workflow-nav span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;font-weight:650}
.layout{grid-template-columns:340px minmax(0,1fr);gap:20px}
.stack{gap:18px}.layout>aside{align-self:start}
.panel{background:#101c21f2;border-color:#263c43;border-radius:var(--radius);box-shadow:0 12px 32px #03101452}
.panel-head{min-height:52px;padding:14px 17px;background:#132329;border-bottom-color:#2a4249;border-radius:13px 13px 0 0}
.panel-head h2{font-size:13px;font-weight:750;letter-spacing:.015em}
.panel-body{padding:17px}.field{margin-bottom:15px}.field label{font-size:11.5px;font-weight:600;letter-spacing:.01em}
input,select{min-height:41px;border-color:#314a52;background:#122228;border-radius:7px;transition:border-color .2s ease,background .2s ease,box-shadow .2s ease}
input:hover,select:hover{border-color:#45636b}input:focus,select:focus{background:#172a30;box-shadow:0 0 0 3px #61d0c81c}
.hint,.small{font-size:12px;line-height:1.55}.micro{font-size:11.5px;line-height:1.55}
.btn{min-height:39px;border-radius:7px;border-color:#385159;background:#1a3036;font-weight:650;transition:background .2s ease,border-color .2s ease,transform .16s ease,opacity .2s ease}
.btn:hover:not(:disabled){filter:none;background:#213a41;border-color:#4c6b73;transform:translateY(-1px)}
.btn:active:not(:disabled){transform:translateY(1px) scale(.985)}
.btn-primary{background:#226c69;border-color:#4fb7b0}.btn-primary:hover:not(:disabled){background:#287b77;border-color:#69cec6}
.btn-good{background:#285b47;border-color:#4f8f72}.btn-danger{background:#542e32;border-color:#7f4b50}
.badge,.chip{border-radius:6px;background:#0e1a1e;font-weight:600}.badge.violet,.chip.violet{color:#b3c0c5;border-color:#526269}.badge.cyan,.chip.cyan{color:#77d8d0}
.iv-cell{border-color:#2a4148;border-left-color:#50636b;background:#122228;border-radius:7px}.iv-cell.active{border-color:#42726f;border-left-color:var(--cyan);background:#16302f}
.iv-hp,.iv-atk,.iv-def,.iv-spa,.iv-spd,.iv-spe{border-left-color:#50636b}.iv-cell.active.iv-hp,.iv-cell.active.iv-atk,.iv-cell.active.iv-def,.iv-cell.active.iv-spa,.iv-cell.active.iv-spd,.iv-cell.active.iv-spe{border-left-color:var(--cyan)}
.banner{padding:14px 15px;border-radius:8px;background:#132329}.banner.good{background:#173029}.banner.warn{background:#302919}.banner.bad{background:#332123}
.item{border:0;border-radius:9px;background:#14242a;padding:13px}.metric,.kv{border-color:#294148;background:#132329;border-radius:8px}
.resource-grid{gap:11px}.resource-card{border:0;border-top:2px solid #38545b;background:#132329;border-radius:9px;padding:13px}.resource-card.nature{border-top-color:#8fa4aa}
.purchase-source{border:0;border-left:2px solid #345159;background:#0c191d;padding:11px 12px;border-radius:6px}
.parent-box{border-color:#2b454c;background:#0c181c;border-radius:7px}.pair-grid{gap:12px}.breed-center{color:#80949a}
.step{padding:15px 16px 15px 20px;border-color:#2c464d;border-radius:9px;background:#13242a}.step:before{width:4px;border-radius:9px 0 0 9px}.step-title h3{font-size:14px;letter-spacing:-.01em}
.empty{padding:30px 20px;border-color:#334c54;background:#0d191d;color:#81939a}
.purchase-action{transition:background .18s ease,color .18s ease,transform .16s ease}.purchase-action:active:not(:disabled){transform:scale(.97)}
.toast{border-radius:8px;background:#1b3036;box-shadow:0 18px 50px #020b0eaa}
.footer{margin-top:28px;padding:18px 4px 0}
@media(max-width:1050px){.app{padding:20px 16px 58px}.masthead{grid-template-columns:1fr}.version-stack{grid-template-columns:repeat(4,max-content);justify-content:start}.layout{grid-template-columns:1fr}.workflow-nav{top:6px}}
@media(max-width:700px){html{scroll-padding-top:72px}.app{padding:14px 10px 44px}.masthead{gap:18px;padding:8px 2px 18px}.masthead h1{font-size:30px}.version-stack{grid-template-columns:repeat(2,max-content)}.workflow-nav{display:flex;overflow-x:auto;scrollbar-width:none}.workflow-nav::-webkit-scrollbar{display:none}.workflow-nav a{flex:0 0 auto;min-width:118px}.panel-head{align-items:flex-start;flex-direction:column}.panel-head>.actions{width:100%}.panel-head>.actions .btn{flex:1}.panel-body{padding:14px}.purchase-entry-form{gap:9px}}
@media print{.skip-link,.workflow-nav{display:none!important}}
`;

let html = readFileSync(sourcePath, 'utf8')
  .replaceAll('v1.0.18', 'v1.0.19')
  .replaceAll('v1_0_18', 'v1_0_19')
  .replace("APP_VERSION='1.0.18'", "APP_VERSION='1.0.19'")
  .replace("PREVIOUS_STORAGE_KEY='pokemmo_breeding_planner_v1_0_17'", "PREVIOUS_STORAGE_KEY='pokemmo_breeding_planner_v1_0_18'")
  .replace('SCHEMA_VERSION=18', 'SCHEMA_VERSION=19')
  .replaceAll('pokedex-gen1-5-bootstrap-2026-08-24-v1.0.19', 'pokedex-gen1-5-bootstrap-2026-08-24-v1.0.9')
  .replaceAll('pokemmo-breeding-tree-acquisition-ledger-2026-08-24-v1.0.19', 'pokemmo-breeding-tree-acquisition-ledger-2026-08-24-v1.0.9')
  .replace('<title>PokeMMO 配种执行规划器 · v1.0.19</title>', '<title>PokeMMO 配种执行规划器 · v1.0.19</title>\n<meta name="description" content="离线规划 PokeMMO 配种目标、亲本采购、道具消耗、执行步骤与实际成本。">\n<meta name="theme-color" content="#081115">')
  .replace('</style>', `${uiStyles}\n</style>`)
  .replace(/<body>\r?\n<div class="app">/, '<body>\n<a class="skip-link" href="#main-content">跳到规划工作台</a>\n<div class="app">')
  .replace('  <main class="layout">', '  <nav class="workflow-nav" aria-label="规划阶段"><a href="#phase-target"><b>01–03</b><span>目标与库存</span></a><a href="#phase-resources"><b>04–05</b><span>规则与资源</span></a><a href="#phase-execution"><b>06</b><span>执行计划</span></a><a href="#phase-audit"><b>07</b><span>结果审计</span></a></nav>\n  <main class="layout" id="main-content">')
  .replace('<section class="panel"><div class="panel-head"><h2>01 / 目标设定</h2>', '<section class="panel" id="phase-target"><div class="panel-head"><h2>01 / 目标设定</h2>')
  .replace('<section class="panel"><div class="panel-head"><h2>05 / 校验与资源方案</h2>', '<section class="panel" id="phase-resources"><div class="panel-head"><h2>05 / 校验与资源方案</h2>')
  .replace('<section class="panel"><div class="panel-head"><h2>06 / 执行计划</h2>', '<section class="panel" id="phase-execution"><div class="panel-head"><h2>06 / 执行计划</h2>')
  .replace('<section class="panel"><div class="panel-head"><h2>07 / 结果与版本审计</h2>', '<section class="panel" id="phase-audit"><div class="panel-head"><h2>07 / 结果与版本审计</h2>')
  .replace('首次打开可迁移 v1.0.17 长期数据', '首次打开可迁移 v1.0.18 长期数据')
  .replace("已从 v1.0.17 迁移完整账本", "已从 v1.0.18 迁移完整账本")
  .replace("document.getElementById('data-version-badge').textContent='v1.0.18'", "document.getElementById('data-version-badge').textContent='v1.0.9'")
  .replace("document.getElementById('rules-version-badge').textContent='配种树 v1.0.18'", "document.getElementById('rules-version-badge').textContent='配种树 v1.0.9'");

writeFileSync(outputPath, html);
console.log(outputPath.pathname);

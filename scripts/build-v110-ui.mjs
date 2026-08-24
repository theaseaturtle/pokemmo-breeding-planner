import { readFileSync, writeFileSync } from 'node:fs';

const sourcePath = new URL('../app/pokemmo-breeding-planner-v1.0.9-2026-08-24.html', import.meta.url);
const outputPath = new URL('../app/pokemmo-breeding-planner-v1.1.0-2026-08-24.html', import.meta.url);
const gsapPath = new URL('../workbench/package/dist/gsap.min.js', import.meta.url);
const scrollTriggerPath = new URL('../workbench/package/dist/ScrollTrigger.min.js', import.meta.url);
const geistPath = new URL('../workbench/geist/package/dist/fonts/geist-sans/Geist-Variable.woff2', import.meta.url);
const geistMonoPath = new URL('../workbench/geist/package/dist/fonts/geist-mono/GeistMono-Variable.woff2', import.meta.url);

const fontFace = `
@font-face{font-family:Geist;src:url(data:font/woff2;base64,${readFileSync(geistPath).toString('base64')}) format('woff2');font-weight:100 900;font-display:swap}
@font-face{font-family:GeistMono;src:url(data:font/woff2;base64,${readFileSync(geistMonoPath).toString('base64')}) format('woff2');font-weight:100 900;font-display:swap}`;

const tasteCss = `
${fontFace}
:root{--ink:#f3f1e8;--muted:#a7aaa3;--dim:#71766f;--bg:#070908;--surface:#101411;--surface2:#151b17;--surface3:#1b241d;--line:#303a32;--cyan:#b8f34a;--yellow:#e9c46a;--red:#ef7770;--green:#96d69d;--blue:#88bcd6;--violet:#b6a6d9;--shadow:0 22px 70px #0009;--radius:4px}
html{scroll-behavior:smooth;overflow-x:hidden}body{overflow-x:hidden;width:100%;max-width:100%;background:radial-gradient(circle at 78% 5%,#35451d55 0,transparent 30rem),radial-gradient(circle at 8% 38%,#183a3055 0,transparent 34rem),#070908;font-family:Geist,"PingFang SC","Microsoft YaHei",sans-serif;font-variant-numeric:tabular-nums}body:before{content:"";position:fixed;inset:0;z-index:-1;pointer-events:none;opacity:.11;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.25'/%3E%3C/svg%3E")}.app{max-width:1600px;padding:18px clamp(14px,2.5vw,42px) 120px}.taste-nav{position:sticky;top:12px;z-index:80;display:flex;justify-content:space-between;align-items:center;gap:18px;width:min(100%,1480px);margin:0 auto 42px;padding:10px 12px 10px 18px;border:1px solid #ffffff1a;background:#0b0f0ccc;backdrop-filter:blur(18px);box-shadow:0 12px 44px #0007}.taste-nav strong{font-family:GeistMono,monospace;font-size:11px;letter-spacing:.12em;text-transform:uppercase}.taste-nav-links{display:flex;align-items:center;gap:6px}.taste-nav a{color:var(--muted);font-size:12px;text-decoration:none;padding:8px 10px}.taste-nav a:hover{color:var(--ink);background:#ffffff09}.masthead{position:relative;display:grid;grid-template-columns:minmax(0,1.55fr) minmax(280px,.45fr);min-height:clamp(520px,72vh,760px);align-items:end;gap:clamp(40px,8vw,140px);padding:clamp(80px,12vh,150px) 0 72px;margin-bottom:0;border:0}.masthead:after{content:"";position:absolute;right:2%;top:11%;width:min(32vw,430px);aspect-ratio:1;border:1px solid #b8f34a33;border-radius:50%;background:radial-gradient(circle at 38% 34%,#b8f34a42,transparent 18%),radial-gradient(circle,#142015 0 38%,#b8f34a22 39% 40%,transparent 41%);filter:drop-shadow(0 0 70px #b8f34a22);z-index:-1}.eyebrow{font-family:GeistMono,monospace;color:var(--cyan);letter-spacing:.16em}.masthead h1{max-width:72rem;margin:18px 0 24px;font-size:clamp(3rem,6.7vw,7rem);line-height:.9;letter-spacing:-.065em;text-wrap:balance}.lede{max-width:64ch;font-size:clamp(16px,1.5vw,22px);line-height:1.55;color:#c5c9c1}.lede-word{opacity:.12}.version-stack{align-items:stretch;gap:0;border-top:1px solid var(--line)}.version-stack .badge{justify-content:space-between;border:0;border-bottom:1px solid var(--line);border-radius:0;padding:12px 0;font-family:GeistMono,monospace}.taste-marquee{overflow:hidden;margin:0 calc(-1 * clamp(14px,2.5vw,42px)) 88px;border-block:1px solid var(--line);background:#b8f34a;color:#0b0d0b}.taste-marquee-track{display:flex;width:max-content;gap:42px;padding:13px 0;font-family:GeistMono,monospace;font-size:12px;font-weight:700;letter-spacing:.11em;text-transform:uppercase;animation:taste-marquee 28s linear infinite}.taste-marquee-track span:after{content:"/";margin-left:42px;opacity:.4}@keyframes taste-marquee{to{transform:translateX(-50%)}}
.layout{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));grid-auto-flow:dense;gap:1px;align-items:start;background:var(--line);border:1px solid var(--line)}.layout>aside{grid-column:span 4}.layout>div{grid-column:span 8}.stack{gap:1px}.panel{border:0;border-radius:0;box-shadow:none;background:#0e120f;overflow:visible}.panel-head{min-height:64px;padding:18px 20px;border-bottom:1px solid var(--line);background:#121713}.panel-head h2{font-size:clamp(15px,1.2vw,19px);font-weight:570;letter-spacing:-.025em}.panel-body{padding:20px}.layout>aside .panel{transition:flex .55s cubic-bezier(.2,.8,.2,1),background .3s}.layout>aside .panel:hover{background:#131a15}.btn{border-radius:2px;transition:transform .22s ease,background .22s,color .22s,border-color .22s}.btn:hover:not(:disabled){filter:none;transform:translateY(-2px)}.btn:active:not(:disabled){transform:translateY(1px) scale(.985)}.btn-primary,.btn-good{background:var(--cyan);border-color:var(--cyan);color:#0b0e0b;font-weight:700}.btn-danger{background:#3b1d1d;border-color:#7e3a38;color:#ffc0bb}input,select{border-radius:2px;background:#0a0f0c;border-color:#344039}.metric,.kv,.item,.resource-card,.step,.banner,.parent-box,.purchase-source,.tree-band,.item-stock{border-radius:2px}.metric,.kv{background:#151b17}.resource-grid{grid-template-columns:repeat(12,minmax(0,1fr));grid-auto-flow:dense;gap:1px;background:var(--line)}.resource-card{grid-column:span 6;border:0;background:#131915}.rule-strip,.tree-summary,.item-audit{grid-auto-flow:dense}.step{margin:0 0 22px;padding:22px;background:#111713;border-color:#344038;transform-origin:50% 100%;box-shadow:0 24px 70px #0008}.step:hover{border-color:#b8f34a77}.step-title h3{font-size:clamp(15px,1.25vw,19px)}.pair-grid{gap:1px;background:var(--line)}.parent-box{border:0;background:#090d0a}.breed-center{background:#111713}.purchase-action{border-radius:2px}.audit-table td,.audit-table th{padding-block:12px}.footer{margin-top:100px;padding-top:30px}.taste-action{position:relative;margin-top:clamp(100px,14vw,220px);padding:clamp(70px,10vw,150px) clamp(24px,7vw,100px);overflow:hidden;background:#b8f34a;color:#0b0d0b}.taste-action:before{content:"";position:absolute;inset:-50%;background:radial-gradient(circle,#fff9 0,transparent 35%);transform:translate3d(35%,20%,0);opacity:.28}.taste-action h2{position:relative;max-width:72rem;margin:0;font-size:clamp(2.8rem,6vw,6.5rem);line-height:.94;letter-spacing:-.06em;text-wrap:balance}.taste-action p{position:relative;max-width:60ch;font-size:17px}.taste-action .btn{position:relative;background:#0b0d0b;color:#fff;border-color:#0b0d0b}.horizontal-accordions{display:grid;grid-template-columns:repeat(3,1fr);min-height:210px;margin:90px 0 0;border:1px solid var(--line);overflow:hidden}.horizontal-accordion{position:relative;padding:24px;border-right:1px solid var(--line);background:#0d120e;transition:background .5s,transform .5s}.horizontal-accordion:last-child{border-right:0}.horizontal-accordion:hover{background:#19221a;transform:translateY(-6px)}.horizontal-accordion strong{display:block;font-size:clamp(22px,2.4vw,38px);letter-spacing:-.04em}.horizontal-accordion p{max-width:34ch;color:var(--muted)}
@media(max-width:1050px){.masthead{grid-template-columns:1fr;min-height:auto;padding-top:80px}.masthead:after{width:48vw;opacity:.55}.layout>aside,.layout>div{grid-column:1/-1}.horizontal-accordions{grid-template-columns:1fr}.horizontal-accordion{border-right:0;border-bottom:1px solid var(--line)}.resource-card{grid-column:span 12}.taste-nav-links a{display:none}}
@media(max-width:650px){.masthead h1{font-size:clamp(3rem,15vw,5rem)}.masthead{padding-bottom:50px}.taste-marquee{margin-bottom:54px}.panel-body{padding:15px}.taste-action{margin-top:80px}.taste-action h2{font-size:clamp(2.7rem,14vw,4.4rem)}}
@media(prefers-reduced-motion:reduce){.taste-marquee-track{animation:none}.lede-word{opacity:1!important}.step{transform:none!important}}
.masthead{min-height:360px;grid-template-columns:minmax(0,1fr) minmax(260px,320px);align-items:end;gap:clamp(32px,6vw,88px);padding:72px 0 52px;margin-bottom:56px}.masthead:after{width:min(25vw,300px);opacity:.5}.masthead h1{max-width:900px;margin:14px 0 18px;font-size:clamp(3rem,5vw,5.4rem);line-height:.94}.lede{font-size:clamp(15px,1.25vw,19px)}
.layout{display:grid;grid-template-columns:minmax(280px,320px) minmax(0,1fr);grid-auto-flow:row;gap:16px;align-items:start;background:transparent;border:0}.layout>aside,.layout>section{grid-column:auto;min-width:0}.layout>.stack{gap:16px}.panel{border:1px solid var(--line);border-radius:4px;overflow:visible}.panel-head{min-height:58px;padding:15px 18px}.panel-body{padding:18px}.resource-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;background:transparent}.resource-card{grid-column:auto;border:1px solid var(--line)}.step{margin-bottom:12px;padding:18px;box-shadow:none;transform:none!important}.footer{margin-top:40px}.horizontal-accordions,.taste-marquee,.taste-action{display:none!important}
@media(max-width:1100px){.layout{grid-template-columns:1fr}.layout>aside,.layout>section{grid-column:1}.masthead{min-height:320px;grid-template-columns:1fr auto}.resource-grid{grid-template-columns:1fr}.taste-nav-links a{display:none}}
@media(max-width:720px){.app{padding-inline:12px}.taste-nav{top:6px;margin-bottom:20px}.taste-nav-links{gap:0}.masthead{min-height:auto;grid-template-columns:1fr;padding:54px 0 38px;margin-bottom:28px}.masthead:after{display:none}.masthead h1{font-size:clamp(2.6rem,13vw,4.2rem)}.version-stack{width:100%}.panel-head{align-items:flex-start;flex-wrap:wrap}.panel-head .actions{width:100%}.panel-head .actions .btn{flex:1}.rule-strip,.tree-summary,.item-audit{grid-template-columns:1fr}.pair-grid{grid-template-columns:1fr}.breed-center{min-height:56px}}
`;

const newHeader = `<nav class="taste-nav" aria-label="主要导航"><strong>Breeding Systems</strong><div class="taste-nav-links"><a href="#planner-workspace">规划工作台</a><a href="#stage2-results">执行路线</a><a href="#audit-results">成本审计</a><button class="btn btn-primary" type="button" onclick="document.getElementById('btn-generate-stage1').click()">生成方案</button></div></nav>
  <header class="masthead">
    <div><div class="eyebrow">Offline breeding intelligence</div><h1>把复杂配种变成一条可执行路线</h1><p class="lede">目标、素材、采购、依赖与成本不再散落。每一次选择都进入同一份可追溯的执行计划。</p></div>
    <div class="version-stack"><span class="badge cyan">APP v1.1.0 · 2026-08-24</span><span class="badge violet">DATA <span id="data-version-badge">...</span></span><span class="badge violet">RULES <span id="rules-version-badge">...</span></span><span class="badge warn" id="route-state-badge">尚未生成路线</span></div>
  </header>`;

const actionSection = '';

const motionScript = `
function initTasteMotion(){
  if(!window.gsap||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  gsap.from('.masthead h1',{y:24,opacity:0,duration:.7,ease:'power3.out'});
  gsap.from('.version-stack',{y:16,opacity:0,duration:.55,ease:'power2.out',delay:.08});
}
`;

let html = readFileSync(sourcePath, 'utf8');
html = html
  .replaceAll('v1.0.9', 'v1.1.0')
  .replaceAll('v1_0_9', 'v1_1_0')
  .replace("APP_VERSION='1.0.9'", "APP_VERSION='1.1.0'")
  .replaceAll('pokedex-gen1-5-bootstrap-2026-08-24-v1.1.0', 'pokedex-gen1-5-bootstrap-2026-08-24-v1.0.9')
  .replaceAll('pokemmo-breeding-tree-acquisition-ledger-2026-08-24-v1.1.0', 'pokemmo-breeding-tree-acquisition-ledger-2026-08-24-v1.0.9')
  .replace("PREVIOUS_STORAGE_KEY='pokemmo_breeding_planner_v1_0_8'", "PREVIOUS_STORAGE_KEY='pokemmo_breeding_planner_v1_0_9'")
  .replace('SCHEMA_VERSION=9', 'SCHEMA_VERSION=10')
  .replace("APP.notice='已从 v1.0.8 迁移目标、价格、长期库存与道具库存；旧执行方案未迁移。'", "APP.notice='已从 v1.0.9 迁移目标、价格、长期库存与道具库存；旧执行方案未迁移。'")
  .replace("document.getElementById('data-version-badge').textContent='v1.1.0'", "document.getElementById('data-version-badge').textContent='v1.0.9'")
  .replace("document.getElementById('rules-version-badge').textContent='配种树 v1.1.0'", "document.getElementById('rules-version-badge').textContent='配种树 v1.0.9'")
  .replace('</style>', `${tasteCss}</style>`)
  .replace(/<header class="masthead">[\s\S]*?<\/header>/, newHeader)
  .replace('<main class="layout">', '<main class="layout" id="planner-workspace">')
  .replace('</main>\n  <footer', `</main>${actionSection}\n  <footer`)
  .replaceAll('01 / 目标设定', '定义目标')
  .replaceAll('02 / 成本口径', '成本口径')
  .replaceAll('03 / 长期库存镜像', '长期库存')
  .replaceAll('04 / 规则边界与支持状态', '规则边界与支持状态')
  .replaceAll('05 / 校验与资源方案', '校验与资源方案')
  .replaceAll('06 / 执行计划', '执行计划')
  .replaceAll('07 / 结果与版本审计', '结果与成本审计')
  .replace('<script>', `<script>${readFileSync(gsapPath, 'utf8')}</script><script>${readFileSync(scrollTriggerPath, 'utf8')}</script><script>`)
  .replace(/init\(\);\s*<\/script>/, `${motionScript}\ninit();initTasteMotion();\n</script>`);

writeFileSync(outputPath, html);
console.log(outputPath.pathname);

import assert from 'node:assert/strict';
import {createServer} from 'vite';
import {chromium} from 'playwright';
import {mkdirSync,writeFileSync,existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {gameRoot} from '../scripts/game-paths.mjs';
const server=await createServer({configFile:'vite.config.js',server:{host:'127.0.0.1',port:5227}});await server.listen();
const browser=await chromium.launch({executablePath:existsSync('/tmp/chromium')?'/tmp/chromium':undefined,args:['--no-sandbox']});
mkdirSync('artifacts/controls-audio',{recursive:true});
const reports=[];
try {
for(const mobile of [false,true]) for(const theme of ['light','dark']) {
 const page=await browser.newPage({viewport:mobile?{width:390,height:844}:{width:1200,height:900},hasTouch:mobile,isMobile:mobile,colorScheme:theme});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:5227');
 await page.setContent(`<style>body{margin:0;padding:30px;font:18px/1.8 system-ui;background:${theme==='light'?'#f6f7f8':'#100b1d'};color:${theme==='light'?'#20192f':'#eee8ff'}}main{min-height:1800px}button{padding:15px;margin:20px}p{max-width:550px}#selection-input,#selection-editor{position:fixed;left:0;top:0;width:1px;height:1px;opacity:0;pointer-events:none}</style><button id=test-start>Start test</button><input id=selection-input value="Editable input"><span id=selection-editor contenteditable=true>Editable text</span><main><h1>DOM Virus control lab</h1><p>Drive around real words. Bite the page and follow the maze through the whitespace. Every game keeps its own state.</p><button>Build a base</button><p>Scroll naturally. The page carries its own game objects.</p></main>`);
 await page.evaluate(()=>{
  window.audioAudit={contexts:[],peak:0,active:0,notes:0,samples:[]};const Native=window.AudioContext;
  window.AudioContext=class extends Native{
   constructor(...args){super(...args);audioAudit.contexts.push(this);const analyser=this.createAnalyser();analyser.fftSize=256;this.auditAnalyser=analyser;}
   createGain(){const gain=super.createGain();const connect=gain.connect.bind(gain);gain.connect=(dest,...args)=>{if(dest===this.destination)connect(this.auditAnalyser);return connect(dest,...args)};return gain;}
   createOscillator(){const oscillator=super.createOscillator(),start=oscillator.start.bind(oscillator);oscillator.start=(...args)=>{audioAudit.notes++;audioAudit.active++;audioAudit.peak=Math.max(audioAudit.peak,audioAudit.active);return start(...args)};oscillator.addEventListener('ended',()=>audioAudit.active--);return oscillator;}
  };
 });
 for(const name of ['byte-runner','null-invaders','sherman-bytes','swarm-protocol']){
  const moduleURL='/@fs'+resolve(gameRoot(name),name==='swarm-protocol'?'src/swarm-widget.ts':'src/index.ts');
  await page.evaluate(async({url,name,theme})=>{
   const module=await import(url);const root=document.querySelector('main');
   if(name==='swarm-protocol'){const host=document.createElement('div');document.body.append(host);window.controller=module.mountSwarmGame(host,{root,theme,initiallyClosed:false,showLauncher:false,onEvent:e=>window.events.push(e)});window.swarmHost=host;}
   else window.controller=module[{ 'byte-runner':'createByteRunner','null-invaders':'createNullInvaders','sherman-bytes':'createShermanBytes'}[name]]({root,theme,seed:12,onEvent:e=>window.events.push(e)});
   window.events=[];document.querySelector('#test-start').onclick=e=>window.controller.start(e);
  },{url:moduleURL,name,theme});
  await page.evaluate(()=>document.body.style.userSelect='text');
  await page.locator('#test-start').click();await page.waitForTimeout(150);
  assert.equal(await page.evaluate(()=>getComputedStyle(document.body).userSelect),mobile?'none':'text',`${name}: mobile body selection policy`);
  if(mobile) {
   assert.equal(await page.locator('#selection-input').evaluate(el=>getComputedStyle(el).userSelect),'text');
   assert.equal(await page.locator('#selection-editor').evaluate(el=>getComputedStyle(el).userSelect),'text');
  }
  const host=name==='swarm-protocol'?page.locator('[data-swarm-ui]'):page.locator('[data-dom-virus-root]');
  const action=kind=>host.locator(name==='swarm-protocol'?`#${({fold:'minimize',exit:'close'}[kind]||kind)}`:`[data-action=${kind}]`);
  assert.equal(await host.locator('.game-actions button').count(),4);
  const labels=await host.locator('.game-actions button').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('aria-label')));
  assert.match(labels[0],/sound/);assert.equal(labels[1],'Pause game');assert.match(labels[2],/scoreboard/);assert.match(labels[3],/Close game/);
  if((await action('fold').getAttribute('aria-expanded'))==='true')await action('fold').click();
  await action('pause').click();assert.equal(await page.evaluate(()=>controller.getSnapshot().status),'paused');assert.equal(await action('pause').getAttribute('aria-label'),'Resume game');
  assert.equal(await page.evaluate(()=>getComputedStyle(document.body).userSelect),'text','pause restores native selection');
  assert.equal(await action('exit').isVisible(),true);await action('pause').click();
  // Toggle twice; preview confirms native sound from a trusted action even on a quiet board.
  await action('sound').click();await action('sound').click();await page.waitForTimeout(50);
  const sound=await page.evaluate(()=>{const ctx=audioAudit.contexts.at(-1),data=new Uint8Array(256);ctx.auditAnalyser.getByteTimeDomainData(data);return{state:ctx.state,signal:data.some(v=>v!==128),notes:audioAudit.notes,peak:audioAudit.peak}});
  assert.equal(sound.state,'running');assert.equal(sound.signal,true,`${name}: native synthesized waveform`);
  if(name==='sherman-bytes'&&mobile){
   const ability=host.locator('.touch [data-ability=cover]');assert.equal(await ability.isVisible(),true);await ability.click();
   const result=await page.evaluate(()=>({building:controller.getSnapshot().building,events:events.filter(e=>e.type==='build-start')}));
   assert.equal(result.building,'cover');assert.equal(result.events.length,1);
  }
  if(name==='null-invaders'||name==='sherman-bytes'){
   const before=await page.evaluate(()=>scrollY);await page.keyboard.down('Space');await page.waitForTimeout(220);await page.keyboard.up('Space');assert.equal(await page.evaluate(()=>scrollY),before);assert.ok(await page.evaluate(()=>events.some(e=>e.type==='fire')));
  }
  // Stable scoreboards never overflow the viewport or overlap action hit areas.
  const boxes=await host.locator('.game-actions button').evaluateAll(nodes=>nodes.map(n=>{const r=n.getBoundingClientRect();return {left:r.left,right:r.right,width:r.width,height:r.height}}));
  assert.ok(boxes.every(b=>b.left>=0&&b.right<=(mobile?390:1200)));if(mobile)assert.ok(boxes.every(b=>b.width>=44&&b.height>=44));
  await page.screenshot({path:`artifacts/controls-audio/${name}-${mobile?'mobile':'desktop'}-${theme}.png`});
  await action('pause').click();await page.waitForTimeout(50);assert.equal(await page.evaluate(()=>audioAudit.active),0,'pause ends active audio');
  await action('exit').click();await page.evaluate(()=>{controller.destroy();window.swarmHost?.remove();window.swarmHost=null});await page.waitForTimeout(50);
  assert.equal(await page.locator('[data-dom-virus-root],[data-dom-virus-attachment]').count(),0);
  assert.ok(await page.evaluate(()=>audioAudit.contexts.every(c=>c.state==='closed')));
  assert.equal(await page.evaluate(()=>getComputedStyle(document.body).userSelect),'text','Recall restores selection');
  assert.equal(await page.locator('[data-dom-virus-selection]').count(),0,'selection leases cleaned');
  reports.push({name,mobile,theme,sound,controls:labels});
 }
 assert.deepEqual(errors,[]);await page.close();
}
writeFileSync('artifacts/controls-audio/results.json',JSON.stringify(reports,null,2));console.log(`Verified ${reports.length} game/theme/device combinations: native audio, pause, mute, Recall, persistent controls and mobile build/fire.`);
}finally{await browser.close();await server.close()}

import assert from 'node:assert/strict';
import {createServer} from 'vite';
import {chromium} from 'playwright';
import {existsSync,mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
import { coreGameRoot as gameRoot } from '../scripts/game-paths.mjs';
const server=await createServer({configFile:'vite.config.js',server:{port:5215,host:'127.0.0.1'}});await server.listen();
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||(existsSync('/tmp/chromium')?'/tmp/chromium':undefined),args:['--no-sandbox']});
mkdirSync('artifacts/swarm-colors',{recursive:true});
const hasColor=(fill,hex)=>fill.includes(hex)||fill.replace(/\s/g,'').includes('rgb('+hex.slice(1).match(/../g).map(n=>parseInt(n,16)).join(',')+')');
try{
 for(const mobile of [false,true])for(const theme of ['light','dark']){
  const page=await browser.newPage({viewport:mobile?{width:390,height:844}:{width:900,height:700},isMobile:mobile,hasTouch:mobile,colorScheme:theme,reducedMotion:mobile?'reduce':'no-preference'}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:5215');
  await page.setContent(`<style>body{margin:0;background:${theme==='light'?'#f6f7f8':'#100b1d'};color:${theme==='light'?'#182331':'#fff'};font:16px system-ui}main{padding:32px}h1{font-size:28px}button{position:absolute;left:80px;top:250px;width:230px;height:72px;background:#8573ee;color:#17202a;border:1px solid;box-shadow:4px 4px #17202a;font:700 16px monospace;--swarm-power-color:#8573ee}</style><main><h1>Swarm: every bite counts.</h1><p>The original button stays in the DOM.</p><button data-swarm-target>REAL BUTTON</button></main>`);
  await page.evaluate(async({url,mobile})=>{
   const {createDomDefender}=await import(url);let now=0,id=0,seed=0xdecafbad;const frames=new Map();
   window.requestAnimationFrame=fn=>{frames.set(++id,fn);return id};window.cancelAnimationFrame=id=>frames.delete(id);performance.now=()=>now;
   Math.random=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296};
   const button=document.querySelector('button'),original=button.getAttribute('style'),events=[];let clicks=0;button.addEventListener('click',()=>clicks++);
   const engine=createDomDefender({document,reducedMotion:mobile,onEvent:e=>events.push(e)});
   const tick=(count=1)=>{for(let i=0;i<count;i++){now+=1000/60;const queue=[...frames.values()];frames.clear();for(const fn of queue)fn(now)}};
   window.qa={engine,button,events,tick,frames,original,get clicks(){return clicks},fill(){const raw=button.style.backgroundImage;return raw.includes('data:image')?decodeURIComponent(raw):raw},health(){return engine.getSnapshot().targets[0].health}};
   engine.start();
  },{url:'/@fs'+resolve(gameRoot('swarm-protocol'),'src/dom-defender.ts'),mobile});
  const first=await page.evaluate(()=>{const q=window.qa;for(let i=0;i<2000&&!q.events.some(e=>e.type==='damage');i++)q.tick();return {event:q.events.find(e=>e.type==='damage'),label:q.button.textContent,fill:q.fill()}});
  assert.equal(first.event?.health,98.85);assert.equal(first.label,'REAL BUTTON');
  await page.evaluate(()=>window.qa.tick(10));
  const fading=await page.evaluate(()=>window.qa.fill());assert.ok(hasColor(fading,'#74dfa1'));
  if(!mobile)assert.ok(fading.includes('color-mix'),'desktop first bite fades');
  else assert.ok(!fading.includes('color-mix'),'reduced motion changes immediately');
  for(const [stage,limit,color] of [['green',99,'#74dfa1'],['yellow',74,'#ffb96b'],['red',34,'#ff6b6b']]){
   const state=await page.evaluate(({limit})=>{const q=window.qa;for(let i=0;i<5000&&q.health()>limit;i++)q.tick();q.tick(36);q.engine.pause();const snapshot=q.engine.getSnapshot(),fill=q.fill();q.tick(60);return {health:q.health(),fill,paused:snapshot.elapsed===q.engine.getSnapshot().elapsed,label:q.button.textContent}}, {limit});
   assert.ok(state.health<=limit&&state.health>0,`${stage} health ${state.health}`);assert.ok(hasColor(state.fill,color),`${stage} fill`);assert.ok(!state.fill.includes('color-mix'),`${stage} settled`);assert.ok(state.paused);assert.equal(state.label,'REAL BUTTON');
   await page.screenshot({path:`artifacts/swarm-colors/${mobile?'mobile':'desktop'}-${theme}-${stage}.png`});
   await page.evaluate(()=>window.qa.engine.resume());
  }
  const restored=await page.evaluate(()=>{const q=window.qa;q.engine.destroy();q.button.click();return {style:q.button.getAttribute('style'),original:q.original,clicks:q.clicks,frames:q.frames.size,overlays:document.querySelectorAll('[data-swarm-overlay]').length}});
  assert.equal(restored.style,restored.original);assert.equal(restored.clicks,1);assert.equal(restored.frames,0);assert.equal(restored.overlays,0);assert.deepEqual(errors,[]);await page.close();
 }
 console.log('Swarm first bite, mint/yellow/red stages, native button ownership, pause, Recall, desktop/mobile, light/dark, and reduced motion passed.');
}finally{await browser.close();await server.close()}

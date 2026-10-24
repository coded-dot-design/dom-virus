import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
export async function checkMobileControls(page, runtimeURL) {
  await page.setViewportSize({width:390,height:844});
  const siteStyle=await page.addStyleTag({content:readFileSync(new URL("../site-kit/style.css",import.meta.url),"utf8")});
  const result = await page.evaluate(async url => {
    const {createArcade}=await import(url);
    const duplicateBar=document.createElement("div");duplicateBar.className="session-bar";document.body.append(duplicateBar);
    const siteBarHidden=getComputedStyle(duplicateBar).display==="none";duplicateBar.remove();
    let api, built=0;
    const game=createArcade({id:'touch-regression',title:'Touch regression',color:'#6de',hint:'',hud:'arcade',capabilities:{fire:true},actions:[{id:'cover',key:'KeyB',label:'B · Cover 2'}],create(context){api=context;return{reset(){},update(){},draw(){},action(){built++;},snapshot(){return {score:0,lives:3,wave:1};}}}}, {root:document.body});
    game.start();
    const root=document.querySelector('[data-dom-virus-root]').shadowRoot;
    const hud=root.querySelector('.hud'), pad=root.querySelector('.touch'), up=pad.querySelector('[data-k=ArrowUp]'), fire=pad.querySelector('[data-k=Space]');
    // Synthetic pointer IDs have no native capture; verify the real handlers with
    // a capture stub; native pointer capture is checked separately below.
    for(const el of [up,fire]) el.setPointerCapture=()=>{};
    const send=(el,type,id)=>el.dispatchEvent(new PointerEvent(type,{pointerId:id,pointerType:'touch',bubbles:true,composed:true,cancelable:true}));
    const zoomLocked=document.documentElement.style.touchAction==='pan-x pan-y';
    const compact=hud.classList.contains('compact')&&pad.parentNode===root&&getComputedStyle(pad).display==='flex';
    const ability=pad.querySelector('[data-ability=cover]');
    ability.click();
    const mobileBuild=built===1 && getComputedStyle(ability).display!=='none';
    const headerOrder=[...root.querySelectorAll('.game-actions [data-action]')].map(e=>e.dataset.action).join(',')==='sound,pause,fold,exit';
    send(up,'pointerdown',1);send(fire,'pointerdown',2);
    const simultaneous=api.input.keys.has('ArrowUp')&&api.firing;
    send(up,'pointerup',1);
    const independent=!api.input.keys.has('ArrowUp')&&api.firing;
    send(fire,'pointercancel',2);
    const cancel=!api.firing;
    send(fire,'pointerdown',3);game.pause();
    const pauseClears=!api.firing&&api.input.keys.size===0&&document.documentElement.style.touchAction==='';
    send(up,'pointerdown',4);
    const pausedIgnores=api.input.keys.size===0;
    game.resume();api.finish();
    const ended=!hud.classList.contains('compact')&&pad.hidden&&root.querySelector('[data-action=fold]').getAttribute('aria-expanded')==='true';
    game.destroy();
    return {siteBarHidden,zoomLocked,compact,mobileBuild,headerOrder,simultaneous,independent,cancel,pauseClears,pausedIgnores,ended};
  },runtimeURL);
  for(const [name,value] of Object.entries(result))assert.equal(value,true,name);
  console.log('Mobile controls: independent held inputs, cancellation, pause and compact results verified.',result);
  await page.evaluate(async url => {
    const {createArcade}=await import(url);
    window.__touchTest=createArcade({id:'touch-trusted',title:'Touch',color:'#6de',hint:'',hud:'arcade',capabilities:{fire:true},create(api){window.__touchApi=api;return{reset(){},update(){},draw(){},snapshot(){return{score:0,lives:3,wave:1};}}}});
    window.__touchTest.start();
  },runtimeURL);
  const points = await page.evaluate(() => [...document.querySelector('[data-dom-virus-root]').shadowRoot.querySelectorAll('.touch [data-k=ArrowUp],.touch [data-k=Space]')].map((el,id)=>{const r=el.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2,id};}));
  const session=await page.context().newCDPSession(page);
  await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:points});
  assert.equal(await page.evaluate(()=>window.__touchApi.input.keys.has('ArrowUp')&&window.__touchApi.firing),true,'trusted two-finger movement + fire');
  // CDP touchEnd releases the complete gesture. Individual pointer releases
  // and their independent key ownership are covered above.
  await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  assert.equal(await page.evaluate(()=>window.__touchApi.input.keys.size===0&&!window.__touchApi.firing),true,'capture release clears held input');
  await page.evaluate(()=>{window.__touchTest.destroy();delete window.__touchTest;delete window.__touchApi;});
  await session.detach();
  await siteStyle.evaluate(el=>el.remove());
  await page.setViewportSize({width:1440,height:1000});
}

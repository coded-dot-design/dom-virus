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
    const hud=root.querySelector('.hud'), pad=root.querySelector('.touch'), stick=pad.querySelector('.tc-stick'), knob=stick.querySelector('.tc-knob'), fire=pad.querySelector('.tc-fire[data-k=Space]');
    const sr=stick.getBoundingClientRect(), cx=sr.left+sr.width/2, cy=sr.top+sr.height/2, reach=sr.width*.36;
    // Synthetic pointer IDs have no native capture; verify the real handlers with
    // a capture stub; native pointer capture is checked separately below.
    for(const el of [stick,fire]) el.setPointerCapture=()=>{};
    const send=(el,type,id,dx=0,dy=0)=>el.dispatchEvent(new PointerEvent(type,{pointerId:id,pointerType:'touch',clientX:cx+dx,clientY:cy+dy,bubbles:true,composed:true,cancelable:true}));
    const stickA11y=stick.getAttribute('role')==='application'&&/drag/.test(stick.getAttribute('aria-label'))&&getComputedStyle(stick).touchAction==='none'&&getComputedStyle(fire).touchAction==='none'&&getComputedStyle(stick).userSelect==='none';
    const keys=()=>[...api.input.keys].sort().join(',');
    const zoomLocked=document.documentElement.style.touchAction==='pan-x pan-y';
    const compact=hud.classList.contains('compact')&&pad.parentNode===root&&getComputedStyle(pad).display==='flex';
    const ability=pad.querySelector('[data-ability=cover]');
    ability.click();
    const mobileBuild=built===1 && getComputedStyle(ability).display!=='none';
    const headerOrder=[...root.querySelectorAll('.game-actions [data-action]')].map(e=>e.dataset.action).join(',')==='sound,pause,fold,exit';
    send(stick,'pointerdown',1,0,-reach);send(fire,'pointerdown',2);
    const simultaneous=keys()==='ArrowUp,Space'&&api.firing&&stick.classList.contains('down')&&fire.classList.contains('down');
    const dead=(send(stick,'pointermove',1,reach*.1,0),api.input.keys.has('Space')&&!api.input.keys.has('ArrowRight')&&!api.input.keys.has('ArrowUp'));
    send(stick,'pointermove',1,reach*2,reach*2);
    const diagonal=keys()==='ArrowDown,ArrowRight,Space'&&/translate3d\(/.test(knob.style.transform)&&Math.abs(parseFloat(knob.style.transform.slice(12))-reach*Math.SQRT1_2)<1;
    send(stick,'pointermove',1,-reach,0);
    const left=keys()==='ArrowLeft,Space';
    send(stick,'pointerup',1);
    const recentred=knob.style.transform===''&&!stick.classList.contains('down');
    const independent=keys()==='Space'&&api.firing;
    send(fire,'pointercancel',2);
    const cancel=!api.firing&&!fire.classList.contains('down');
    send(fire,'pointerdown',3);game.pause();
    const pauseClears=!api.firing&&api.input.keys.size===0&&document.documentElement.style.touchAction==='';
    send(stick,'pointerdown',4,0,-reach);
    const pausedIgnores=api.input.keys.size===0;
    game.resume();api.finish();
    const ended=!hud.classList.contains('compact')&&pad.hidden&&root.querySelector('[data-action=fold]').getAttribute('aria-expanded')==='true';
    game.destroy();
    return {siteBarHidden,zoomLocked,compact,stickA11y,mobileBuild,headerOrder,simultaneous,dead,diagonal,left,recentred,independent,cancel,pauseClears,pausedIgnores,ended};
  },runtimeURL);
  for(const [name,value] of Object.entries(result))assert.equal(value,true,name);
  console.log('Mobile controls: independent held inputs, cancellation, pause and compact results verified.',result);
  await page.evaluate(async url => {
    const {createArcade}=await import(url);
    window.__touchTest=createArcade({id:'touch-trusted',title:'Touch',color:'#6de',hint:'',hud:'arcade',capabilities:{fire:true},create(api){window.__touchApi=api;return{reset(){},update(){},draw(){},snapshot(){return{score:0,lives:3,wave:1};}}}});
    window.__touchTest.start();
  },runtimeURL);
  const points = await page.evaluate(() => [...document.querySelector('[data-dom-virus-root]').shadowRoot.querySelectorAll('.touch .tc-stick,.touch [data-k=Space]')].map((el,id)=>{const r=el.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2,id,reach:r.width*.36};}));
  const [stickPoint,firePoint]=points.map(({x,y,id})=>({x,y,id}));
  const session=await page.context().newCDPSession(page);
  const held=async()=>{await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));return page.evaluate(()=>[...window.__touchApi.input.keys].sort().join(','));};
  await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...stickPoint,y:stickPoint.y-points[0].reach},firePoint]});
  assert.equal(await held(),'ArrowUp,Space','trusted two-finger movement + fire');
  assert.equal(await page.evaluate(()=>window.__touchApi.firing),true);
  // The stick keeps tracking a captured finger that leaves its bounds.
  await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{...stickPoint,x:stickPoint.x+200,y:stickPoint.y+4},firePoint]});
  assert.equal(await held(),'ArrowRight,Space','captured drag beyond the stick');
  await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{...stickPoint,x:stickPoint.x+90,y:stickPoint.y-90},firePoint]});
  assert.equal(await held(),'ArrowRight,ArrowUp,Space','8-way diagonal');
  // CDP touchEnd releases the complete gesture. Individual pointer releases
  // and their independent key ownership are covered above.
  await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  assert.equal(await page.evaluate(()=>window.__touchApi.input.keys.size===0&&!window.__touchApi.firing),true,'capture release clears held input');
  await page.evaluate(()=>{window.__touchTest.destroy();delete window.__touchTest;delete window.__touchApi;});
  await session.detach();
  await siteStyle.evaluate(el=>el.remove());
  await page.setViewportSize({width:1440,height:1000});
}

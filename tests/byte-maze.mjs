import assert from 'node:assert/strict';
/** Deterministic real-DOM simulation: small clearable level, then a full viewport. */
export async function checkByteMaze(page, sourceURL) {
  const results = await page.evaluate(async sourceURL => {
    window.scrollTo(0,0);
    const {createGame}=await import(sourceURL.runner);
    const {createBoard}=await import(sourceURL.board);
    const root=document.createElement('section');root.style.cssText='position:absolute;left:20px;top:20px;width:900px;height:68px;';document.body.append(root);
    const board=createBoard(document,{root});board.measure(0,true);
    let finished=false; const events=[];
    const api={board,options:{document,root,theme:'dark'},input:{keys:new Set(),pointer:{x:0,y:0,active:false},mode:'keyboard',fire:false},width:1440,height:1000,time:0,random:()=>.62,reducedMotion:true,emit:(type,data)=>events.push({type,...data}),burst(){},popup(){},move(){},finish(){finished=true;}};
    const game=createGame(api);game.reset();game.draw();
    const start=game.snapshot();
    const move=(key,steps)=>{api.input.keys=new Set([key]);for(let i=0;i<steps;i++){api.time+=.02;game.update(.02);game.draw();}};
    move('ArrowLeft',100);move('ArrowRight',310);api.input.keys.clear();for(let i=0;i<80;i++){api.time+=.02;game.update(.02);game.draw();}
    const level=game.snapshot();
    const levelClear=events.some(e=>e.type==='level-clear')&&level.wave>=2;
    const power=events.some(e=>e.type==='power');
    const onlyCollected=start.pelletsRemaining>0&&events.some(e=>e.type==='pellet')&&level.score>0;
    board.destroy();const cleaned=!root.querySelector('dom-virus-attachment');root.remove();
    return {levelClear,power,onlyCollected,cleaned,finished,events:events.filter(e=>e.type==='level-start'||e.type==='level-clear')};
  },sourceURL);
  assert.equal(results.levelClear,true,JSON.stringify(results));assert.equal(results.power,true);assert.equal(results.onlyCollected,true);assert.equal(results.cleaned,true);assert.equal(results.finished,false);
  console.log('Byte Runner food trails: pellets, power, full level progression and DOM cleanup',results.events);
  await page.evaluate(async urls=>{
    window.scrollTo(0,0);
    const {createByteRunner}=await import(urls.runner.replace('simulation.ts','index.ts'));
    const root=document.createElement('div');root.id='maze-native-proof';root.style.cssText='position:absolute;left:0;top:0;width:100%;height:2400px;';document.body.append(root);
    const button=document.createElement('button');button.textContent='Native wall';button.style.cssText='position:absolute;left:40%;top:350px;width:160px;height:60px';root.append(button);
    window.mazeProof={root,game:createByteRunner({root,seed:12,theme:'light'})};window.mazeProof.game.start();window.mazeProof.game.pause();
  },sourceURL);
  const pellet=page.locator('#maze-native-proof dom-virus-attachment [data-byte-pellet]').first();
  const a=await pellet.boundingBox();
  await page.evaluate(()=>window.scrollBy(0,100));
  const b=await pellet.boundingBox();assert.ok(Math.abs(a.y-b.y-100)<1,'paused pellets scroll with native parent');
  await page.evaluate(()=>window.mazeProof.root.style.transform='translate(12px,9px)');
  const c=await pellet.boundingBox();assert.ok(Math.abs(c.x-b.x-12)<1&&Math.abs(c.y-b.y-9)<1,'paused sprites follow native transforms');
  await page.setViewportSize({width:390,height:844});
  await page.evaluate(()=>window.mazeProof.game.resume());await page.waitForTimeout(650);
  const mobile=await page.evaluate(()=>({state:window.mazeProof.game.getSnapshot(),width:document.querySelector('#maze-native-proof').shadowRoot?.clientWidth,food:document.querySelector('#maze-native-proof dom-virus-attachment').shadowRoot.querySelectorAll('[data-byte-food] > *').length}));
  assert.equal(mobile.state.status,'running');assert.ok(mobile.state.pelletsRemaining>0);assert.equal(mobile.state.score,0,'reflow never awards food points');assert.ok(mobile.food<2000);
  await page.evaluate(()=>{window.mazeProof.game.destroy();window.mazeProof.root.remove();delete window.mazeProof;window.scrollTo(0,0);});
  assert.equal(await page.locator('[data-byte-maze]').count(),0);
  await page.setViewportSize({width:1440,height:1000});
  console.log('Byte Runner paused native scroll/transform, mobile reflow and cleanup verified');
}

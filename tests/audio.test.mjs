import test from 'node:test';
import assert from 'node:assert/strict';
import {createGameAudio} from '../src/audio.ts';
function fixture() {
  const counts={contexts:0,closed:0,voices:0,active:0};
  class Param {value=0;setValueAtTime(){}exponentialRampToValueAtTime(){}linearRampToValueAtTime(){}cancelScheduledValues(){}}
  class Context {
    currentTime=0;state='running';destination={};
    constructor(){counts.contexts++}
    createGain(){return {gain:new Param(),connect(){},disconnect(){}}}
    createOscillator(){counts.voices++;let alive=false;return {frequency:new Param(),connect(){},disconnect(){if(alive){counts.active--;alive=false}},start(){alive=true;counts.active++},stop(){},onended:null}}
    resume(){this.state='running';return Promise.resolve()}
    close(){this.state='closed';counts.closed++;return Promise.resolve()}
  }
  const storage=new Map(), win={AudioContext:Context,navigator:{userActivation:{isActive:false}},localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)}};
  const doc={defaultView:win,hidden:false};return{doc,win,counts};
}
test('sound is gesture-only, capped, silenced on pause, and closed on Recall',()=>{
  const f=fixture(),audio=createGameAudio(f.doc,'byte-runner');
  audio.play('start');audio.unlock();assert.equal(f.counts.contexts,0);
  audio.unlock({isTrusted:true});
  for(const type of ['power','fire','hurt','kill','start','letter','fruit'])audio.play(type);
  assert.equal(f.counts.active,6);assert.equal(f.counts.contexts,1);
  audio.silence();assert.equal(f.counts.active,0);
  audio.play('start');assert.equal(f.counts.active,0,'pause invalidates unlock');
  audio.unlock({isTrusted:true});f.doc.hidden=true;audio.play('start');assert.equal(f.counts.active,0);
  f.doc.hidden=false;audio.close();assert.equal(f.counts.closed,1);
  audio.unlock({isTrusted:true});audio.play('start');assert.equal(f.counts.active,2);
  audio.close();assert.equal(f.counts.active,0);assert.equal(f.counts.closed,2);
});
test('mute persists and no unsupported event or browser allocates audio',()=>{
  const f=fixture(),audio=createGameAudio(f.doc,'null-invaders');
  audio.toggle();audio.unlock({isTrusted:true});assert.equal(f.counts.contexts,0);
  assert.equal(createGameAudio(f.doc,'null-invaders').enabled,false);
  audio.toggle();audio.unlock({isTrusted:true});
  for(let i=0;i<100;i++)audio.play('unknown-'+i);
  assert.equal(f.counts.voices,0);audio.close();
  delete f.win.AudioContext;const unavailable=createGameAudio(f.doc,'x');assert.equal(unavailable.available,false);unavailable.unlock({isTrusted:true});unavailable.play('start');
});

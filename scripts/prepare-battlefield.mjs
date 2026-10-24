import {existsSync,readFileSync,mkdirSync,rmSync,cpSync} from 'node:fs';
import {resolve,dirname} from 'node:path';import {execFileSync} from 'node:child_process';import{createHash}from'node:crypto';
const pin=JSON.parse(readFileSync('battlefield.json','utf8'));
if(!/^[\w.-]+$/.test(pin.ref))throw Error('Invalid Battlefield pin');
const sibling=resolve('../dom-battlefield');
const root=existsSync(resolve(sibling,'src/model.ts'))?sibling:resolve('.apps/dom-battlefield',pin.ref);
if(!existsSync(resolve(root,'package.json'))){mkdirSync(dirname(root),{recursive:true});execFileSync('git',['clone','--depth','1','--branch',pin.ref,'https://github.com/coded-dot-design/dom-battlefield.git',root],{stdio:'inherit'});}
const pkg=JSON.parse(readFileSync(resolve(root,'package.json'),'utf8'));
if(pkg.name!=='@coded-design/dom-battlefield'||pkg.version!==pin.version)throw Error('Battlefield version does not match its site pin');
const manifest=JSON.parse(readFileSync(resolve(root,'dist/build.json'),'utf8'));
if(manifest.version!==pin.version)throw Error('Stale Battlefield build');
for(const [file,hash] of Object.entries(manifest.files)){
 if(file.includes('..')||file.startsWith('/'))throw Error('Invalid Battlefield asset path');
 if(createHash('sha256').update(readFileSync(resolve(root,'dist',file))).digest('hex')!==hash)throw Error(`Battlefield asset mismatch: ${file}`);
}
const dest=resolve('site/generated/public/battlefield');rmSync(dest,{recursive:true,force:true});mkdirSync(dest,{recursive:true});cpSync(resolve(root,'dist'),dest,{recursive:true});
console.log(`Battlefield ${pin.version}: verified standalone app copied to /battlefield/.`);

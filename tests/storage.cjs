const fs=require('fs'),path=require('path'),assert=require('assert');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
(async()=>{
 const browser=await chromium.launch({...(process.env.CHROME_PATH ? {executablePath:process.env.CHROME_PATH} : {}),headless:true});
 try {
 const context=await browser.newContext();
 await context.route('http://khailife.test/**',r=>{const p=new URL(r.request().url()).pathname;const f=path.join(__dirname,'..',p==='/'?'index.html':p);try {r.fulfill({body:fs.readFileSync(f),contentType:f.endsWith('.js')?'text/javascript':f.endsWith('.css')?'text/css':'text/html'});}catch{r.fulfill({status:404,body:''});}});
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://khailife.test/#gpa');await page.locator('#gpa-export').waitFor();
 const seed=await page.evaluate(()=>JSON.parse(JSON.stringify(KhaiLife.store.get())));
 seed.gpa.semesters[0].courses[0].process='7';
 // Fresh context simulates legacy localStorage already at quota.
 const legacy=await browser.newContext();await legacy.route('http://khailife.test/**',r=>{const p=new URL(r.request().url()).pathname;const f=path.join(__dirname,'..',p==='/'?'index.html':p);try{r.fulfill({body:fs.readFileSync(f),contentType:f.endsWith('.js')?'text/javascript':f.endsWith('.css')?'text/css':'text/html'});}catch{r.fulfill({status:404,body:''});}});
 await legacy.addInitScript(s=>{if(!localStorage.getItem('seeded')){localStorage.setItem('khailife_v3',JSON.stringify(s));localStorage.setItem('seeded','1');try{for(let i=0;i<100;i++)localStorage.setItem('filler'+i,'x'.repeat(100000));}catch{}}},seed);
 const p=await legacy.newPage();p.on('pageerror',e=>errors.push(e.message));await p.goto('http://khailife.test/#gpa');await p.locator('#gpa-export').waitFor();
 assert.equal(await p.locator('input[data-field="process"]').first().inputValue(),'7');
 await p.locator('input[data-field="exam"]').first().fill('9');await p.locator('input[data-field="exam"]').first().dispatchEvent('change');
 await p.waitForFunction(()=>KhaiLife.store.status()==='Đã lưu trên thiết bị');
 await p.reload();await p.locator('#gpa-export').waitFor();assert.equal(await p.locator('input[data-field="exam"]').first().inputValue(),'9');
 assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem('khailife_v3')).gpa.semesters[0].courses[0].process),'7');
 assert(await p.evaluate(async()=>{const before=JSON.parse(JSON.stringify(KhaiLife.store.get()));const next=JSON.parse(JSON.stringify(before));next.gpa.semesters[0].courses[0].exam='6';await KhaiLife.store.replace(next);return KhaiLife.store.previous().gpa.semesters[0].courses[0].exam==='9';}));
 await p.reload();await p.locator('#gpa-export').waitFor();assert.equal(await p.locator('input[data-field="exam"]').first().inputValue(),'6');
 assert(await p.evaluate(async()=>{await KhaiLife.store.replace(KhaiLife.store.previous());return KhaiLife.store.get().gpa.semesters[0].courses[0].exam==='9';}));
 assert(await p.evaluate(async()=>{const original=IDBDatabase.prototype.transaction;IDBDatabase.prototype.transaction=function(){throw new DOMException('Full','QuotaExceededError')};const ok=await KhaiLife.store.persist(false);let rejected=false;try{await KhaiLife.store.replace(KhaiLife.store.get())}catch{rejected=true}IDBDatabase.prototype.transaction=original;return !ok&&rejected&&!KhaiLife.store.storageOkay();}));
 assert(await p.evaluate(async()=>{await Promise.all([KhaiLife.store.persist(false),KhaiLife.store.persist(false)]);return KhaiLife.store.storageOkay();}));
 assert.deepEqual(errors,[]);console.log('PASS: full localStorage migration, GPA edit/reload, legacy retained, atomic import, restore after reload, write failure status, import rejection, queued recovery.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});

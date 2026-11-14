import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {sources,entries} from './content.mjs';
import vm from 'node:vm';
const html=readFileSync(new URL('./dist/index.html',import.meta.url),'utf8');
assert.equal(html,readFileSync(new URL('./dist/Ambedkar_Muslim_League_Direct_Action_Day.html',import.meta.url),'utf8'));
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(ids.length,new Set(ids).size,'Duplicate document ID');
for(const m of html.matchAll(/href="#([^"\s]+)"/g))assert(ids.includes(m[1]),'Missing internal anchor '+m[1]);
for(const e of entries){assert(sources[e.source]);assert(e.locator&&e.supports&&e.limit);assert(ids.includes(e.id));if(e.page)assert(Number.isInteger(e.page)&&e.page>0);}
const embedded=JSON.parse(html.match(/<script id="evidence-data" type="application\/json">([\s\S]*?)<\/script>/)[1]);assert.deepEqual(embedded.entries,entries);assert.deepEqual(embedded.sources,sources);
new vm.Script(readFileSync(new URL('./client.js',import.meta.url),'utf8'));
assert(!/<script[^>]+src=|<link[^>]+stylesheet/i.test(html),'Unexpected external asset');
assert.equal(entries.find(e=>e.id==='E01').page,405);assert.equal(entries.find(e=>e.id==='E04').page,100);
assert(html.includes('printed page unverified'),'Missing locator qualification');
console.log('Passed: offline parity, embedded evidence, all anchors, unique IDs, source references, client syntax and PDF locators.');

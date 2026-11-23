import test from 'node:test';
import assert from 'node:assert/strict';
import {buildMetrics, createBookmarkStore, createProgressStore, fitBasisWidth, pageIndexAt, positionAt, resolveDestination, documentKey, shouldResume, visibleRange} from '../src/core.js';
const memory = () => {const map=new Map();return {getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k)}};

test('书签保存、改名和删除后重新打开仍恢复，文档间互不串用', () => {
 const storage=memory(), store=createBookmarkStore(storage,'book-a');
 const added=store.add({page:2,offset:0.25,label:'第一章'});
 store.rename(added.id,'需要复习');
 assert.deepEqual(createBookmarkStore(storage,'book-a').list().map(({page,offset,label})=>({page,offset,label})),[{page:2,offset:0.25,label:'需要复习'}]);
 assert.deepEqual(createBookmarkStore(storage,'book-b').list(),[]);
 store.remove(added.id);assert.deepEqual(createBookmarkStore(storage,'book-a').list(),[]);
});
test('损坏的数据、未知 schema 与写入失败不能覆盖原书签，也不能谎报成功', () => {
 for(const raw of ['{broken','{"version":2,"bookmarks":[]}','{"version":1,"bookmarks":[{"page":0}]}']) {
  let writes=0;const store=createBookmarkStore({getItem:()=>raw,setItem:()=>writes++},'book');
  assert.throws(()=>store.list());assert.throws(()=>store.add({page:1,offset:0,label:'x'}));assert.equal(writes,0);
 }
 const store=createBookmarkStore({getItem:()=>null,setItem:()=>{throw new Error('quota')}},'book');
 assert.throws(()=>store.add({page:1,offset:0,label:'x'}),/quota/);assert.deepEqual(store.list(),[]);
});
test('拒绝无效页码和位置，允许同一页的多个阅读位置', () => {
 const store=createBookmarkStore(memory(),'book');
 for(const value of [{page:0,offset:0},{page:1.5,offset:0},{page:1,offset:NaN},{page:1,offset:1.1}])assert.throws(()=>store.add({...value,label:'x'}));
 store.add({page:3,offset:0.1,label:'A'});store.add({page:3,offset:0.7,label:'B'});assert.equal(store.list().length,2);
});
test('命名与显式章节目标均解析到正确页码和页内位置',async()=>{
 const doc={numPages:5,getDestination:async n=>n==='chapter'?[{num:9,gen:0},{name:'XYZ'},0,600,null]:null,getPageIndex:async ref=>{assert.deepEqual(ref,{num:9,gen:0});return 2},getPage:async()=>({getViewport:()=>({height:800,convertToViewportPoint:(x,y)=>[x,800-y]})})};
 assert.deepEqual(await resolveDestination(doc,'chapter'),{page:3,offset:0.25});
 assert.deepEqual(await resolveDestination(doc,[1,{name:'Fit'}]),{page:2,offset:0});
 assert.deepEqual(await resolveDestination(doc,[2,{name:'FitH'},400]),{page:3,offset:0.5});
 assert.deepEqual(await resolveDestination(doc,[2,{name:'XYZ'},null,null,null]),{page:3,offset:0});
 await assert.rejects(()=>resolveDestination(doc,'missing'));
 await assert.rejects(()=>resolveDestination(doc,[99,{name:'Fit'}]));
});
test('同一 PDF 复制或重开仍是同一书签集合，内容变化后分离',async()=>{
 const a=new Uint8Array([37,80,68,70]);
 assert.equal(await documentKey(a),await documentKey(a.slice()));
 assert.notEqual(await documentKey(a),await documentKey(new Uint8Array([37,80,68,71])));
});

test('视口顶部所在的页才是当前页：封面比正文矮时不误记下一页',()=>{
 const sizes=[{width:252,height:327},{width:590,height:792},{width:590,height:792}];
 const table=buildMetrics(sizes,0.58,12,12);
 assert.deepEqual(positionAt(table.tops,table.heights,0),{page:1,offset:0});
 assert.equal(table.tops[1]-table.heights[0]-table.tops[0],12);
 assert.deepEqual(positionAt(table.tops,table.heights,table.tops[1]),{page:2,offset:0});
 assert.deepEqual(positionAt(table.tops,table.heights,table.tops[1]+table.heights[1]/2),{page:2,offset:0.5});
 assert.deepEqual(positionAt(table.tops,table.heights,-40),{page:1,offset:0});
 assert.deepEqual(positionAt(table.tops,table.heights,table.total),{page:3,offset:1});
});

test('绝对定位尺寸表与二分查找在混合页尺寸下仍然精确',()=>{
 const sizes=[{width:100,height:200},{width:300,height:400},{width:300,height:400},{width:50,height:100}];
 const table=buildMetrics(sizes,2,10,10);
 assert.deepEqual(Array.from(table.tops),[10,420,1230,2040]);
 assert.deepEqual(Array.from(table.heights),[400,800,800,200]);
 assert.deepEqual(Array.from(table.widths),[200,600,600,100]);
 assert.equal(table.width,600);
 assert.equal(table.total,2040+200+10);
 assert.equal(pageIndexAt(table.tops,0),0);
 assert.equal(pageIndexAt(table.tops,419),0);
 assert.equal(pageIndexAt(table.tops,420),1);
 assert.equal(pageIndexAt(table.tops,1e9),3);
 assert.deepEqual(visibleRange(table.tops,table.heights,0,500),{first:0,last:1});
 assert.deepEqual(visibleRange(table.tops,table.heights,0,500,500),{first:0,last:1});
 assert.deepEqual(visibleRange(table.tops,table.heights,table.total,500),{first:3,last:3});
});

test('适应宽度取出现最多的页宽，个别封面不把整本撑歪',()=>{
 assert.equal(fitBasisWidth([{width:252,height:327},{width:590,height:792},{width:590,height:792}]),590);
 assert.equal(fitBasisWidth([{width:612,height:792}]),612);
 assert.equal(fitBasisWidth([{width:500,height:1},{width:500,height:1},{width:700,height:1}]),500);
});

test('FitR 矩形目录定位到矩形顶部，不静默跳到页首',async()=>{
 const doc={numPages:1,getPage:async()=>({getViewport:()=>({height:800,convertToViewportPoint:(x,y)=>[x,800-y]})})};
 assert.deepEqual(await resolveDestination(doc,[0,{name:'FitR'},100,100,400,600]),{page:1,offset:0.25});
});

test('升级后直接读取旧 v1 书签，读取不重写已有数据',()=>{
 const raw='{"version":1,"bookmarks":[{"id":"existing-bookmark","page":69,"offset":0.25,"label":"原有阅读位置","createdAt":"2026-10-20T04:00:00.000Z"}]}';
 let writes=0;
 const storage={getItem:key=>key==='dsh-pdf-bookmarks:v1:existing-document'?raw:null,setItem:()=>writes++};
 assert.deepEqual(createBookmarkStore(storage,'existing-document').list(),[{id:'existing-bookmark',page:69,offset:0.25,label:'原有阅读位置',createdAt:'2026-10-20T04:00:00.000Z'}]);
 assert.equal(writes,0);
});

test('自动续读位置独立存储、按文档隔离且忽略损坏数据', () => {
 const storage=memory(), store=createProgressStore(storage,'doc-a');
 assert.equal(store.read(),null);
 store.write({page:7,offset:0.4});
 assert.deepEqual(createProgressStore(storage,'doc-a').read(),{page:7,offset:0.4});
 assert.equal(createProgressStore(storage,'doc-b').read(),null);
 assert.match(storage.getItem('dsh-pdf-bookmarks:progress:v1:doc-a'),/"updatedAt":"/);
 for(const bad of ['{broken','{"version":2,"page":1,"offset":0}','{"version":1,"page":0,"offset":0}','{"version":1,"page":1,"offset":2}']) {
  assert.equal(createProgressStore({getItem:()=>bad,setItem:()=>{}},'doc').read(),null);
 }
 store.clear();assert.equal(store.read(),null);
});

test('存储不可用时只退化为不续读，不抛异常', () => {
 const denied={getItem:()=>{throw new Error('denied')},setItem:()=>{throw new Error('denied')}};
 assert.equal(createProgressStore(denied,'doc').read(),null);
 assert.throws(()=>createProgressStore(denied,'doc').write({page:2,offset:0}),/denied/);
});

test('只有离开开头且页码有效时才自动续读', () => {
 assert.equal(shouldResume(null,10),false);
 assert.equal(shouldResume({page:1,offset:0},10),false);
 assert.equal(shouldResume({page:1,offset:0.01},10),false);
 assert.equal(shouldResume({page:1,offset:0.5},10),true);
 assert.equal(shouldResume({page:5,offset:0},10),true);
 assert.equal(shouldResume({page:11,offset:0},10),false);
 assert.equal(shouldResume({page:5,offset:0},undefined),false);
});

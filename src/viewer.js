import React, {useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';
import {buildMetrics, createBookmarkStore, createProgressStore, documentKey, fitBasisWidth, positionAt, resolveDestination, shouldResume, visibleRange} from './core.js';
import css from './viewer.css';
const h = React.createElement;
/** 页间距与首尾留白，同时写进绝对定位的累计偏移与样式，避免布局与命中计算各算一套。 */
const GAP = 12;
const PAD = 12;
/** 已渲染位图的保留张数：滚动来回时直接复用，避免重复光栅化。 */
const CACHE = 8;
const describe = error => error instanceof Error ? error.message : String(error);
/** 渲染密度上限：每 CSS 像素最多 2 个设备像素，2 倍屏已足够清晰，3 倍屏像素量翻倍收益很小。 */
const renderDensity = () => Math.min(window.devicePixelRatio || 1, 2);
function Button({children, title, ...props}) {return h('button', {type:'button', title, ...props}, children)}

/**
 * 页面尺寸表：真正的高度/宽度是绝对定位与目录跳转的前提，先量好再挂载，
 * 避免"边渲染边长高"造成的滚动漂移与重复渲染。超大文档只采样前 32 页，
 * 其余按出现最多的尺寸估计并在后台逐页校准。
 */
async function readSizes(document, signal, onProgress) {
 const total = document.numPages, sample = total > 2000, limit = sample ? Math.min(32, total) : total;
 const sizes = [];
 for (let start = 1; start <= limit; start += 32) {
  signal.throwIfAborted();
  const end = Math.min(start + 31, limit);
  const batch = [];
  for (let page = start; page <= end; page++) batch.push(page);
  const measured = await Promise.all(batch.map(async page => {
   try {
    const proxy = await document.getPage(page);
    const viewport = proxy.getViewport({scale: 96 / 72});
    proxy.cleanup();
    return {width: viewport.width, height: viewport.height};
   } catch (error) {
    return null;
   }
  }));
  for (const view of measured) {
   if (view) sizes.push(view);
   else if (sizes.length) sizes.push({...sizes[sizes.length - 1]});
   else throw new Error('无法读取页面尺寸');
  }
  if (end < limit) onProgress?.(end, total);
 }
 if (sample) {
  const width = fitBasisWidth(sizes);
  const height = sizes.find(size => Math.round(size.width * 10) / 10 === Math.round(width * 10) / 10)?.height || sizes[0].height;
  while (sizes.length < total) sizes.push({width, height});
 }
 return {sizes, prepared: limit};
}

export function createViewer(loadEngine, fallback) {
 class Boundary extends React.Component {
  state = {failed:false};
  static getDerivedStateFromError() {return {failed:true}}
  componentDidCatch(error) {console.warn('[dsh-pdf-bookmarks] 预览已隔离', error)}
  render() {return this.state.failed ? h('div',{className:'dpb-status',role:'alert'},'增强预览暂不可用。',h(Button,{onClick:fallback},'使用内置 PDF 预览')) : this.props.children}
 }
 return function SafeViewer(props) {
  return h(Boundary,{key:props.resourceAddress},h(Viewer,{...props,loadEngine,fallback}));
 };
}

/**
 * 页位图渲染器：独占 Worker、串行渲染、按当前页优先、离开窗口立即取消并保留已完成的位图。
 * React 只负责几何（绝对定位的页框），位图与文字层都在这里管理，滚动不再触发整表重渲染。
 */
function createRenderer({engine, pdf, ownerDocument, textClass}) {
 const entries = new Map(), queue = new Map();
 let clock = 0, running = false, active = null, disposed = false, focus = 1, textChain = Promise.resolve();
 const ensure = page => {
  let entry = entries.get(page);
  if (!entry) {
   const canvas = ownerDocument.createElement('canvas');
   canvas.className = 'dpb-canvas';
   canvas.setAttribute('role', 'img');
   canvas.setAttribute('aria-label', `PDF 第 ${page} 页`);
   entry = {canvas, bitmap:'', text:null, textKey:'', host:null, used:0, failure:null};
   entries.set(page, entry);
  }
  return entry;
 };
 const evict = () => {
  let mounted = 0;
  for (const entry of entries.values()) if (entry.host) mounted++;
  const limit = Math.max(CACHE, mounted);
  if (entries.size <= limit) return;
  const candidates = [...entries.entries()].filter(([, entry]) => !entry.host).sort((left, right) => left[1].used - right[1].used);
  for (const [page, entry] of candidates) {
   if (entries.size <= limit) break;
   entry.canvas.width = entry.canvas.height = 0;
   entries.delete(page);
  }
 };
 const showFailure = (entry, error) => {
  if (!entry.host || entry.failure) return;
  const node = ownerDocument.createElement('div');
  node.className = 'dpb-page-error';
  node.setAttribute('role', 'alert');
  node.textContent = `此页渲染失败：${describe(error)}`;
  entry.host.root.append(node);
  entry.failure = node;
 };
 const clearFailure = entry => {entry.failure?.remove(); entry.failure = null};
 const requestText = (page, key) => {
  entryText: {
   const entry = entries.get(page);
   if (!entry?.host) break entryText;
   entry.textKey = key;
   const mounted = () => {
    const current = entries.get(page);
    return current?.host && current.textKey === key && !disposed;
   };
   textChain = textChain.then(async () => {
    await new Promise(resolve => setTimeout(resolve, 60));
    if (!mounted()) return;
    let proxy;
    try {
     proxy = await pdf.getPage(page);
     if (!mounted()) return;
     const task = engine.pdfTextRenderer(entries.get(page).host.text)(proxy, proxy.getViewport({scale: 96 / 72}));
     entries.get(page).text = task;
     await task.promise;
    } catch {} finally {proxy?.cleanup?.()}
   }).catch(() => {});
  }
 };
 const draw = async (page, job) => {
  const entry = entries.get(page);
  if (!entry?.host || disposed) return false;
  const controller = new AbortController();
  active = {page, controller};
  try {
   const buffer = ownerDocument.createElement('canvas');
   try {
    await engine.renderPdfPage(pdf, page, buffer, controller.signal, job.ratio, undefined);
    if (disposed || controller.signal.aborted) return false;
    entry.canvas.width = buffer.width;
    entry.canvas.height = buffer.height;
    entry.canvas.getContext('2d').drawImage(buffer, 0, 0);
    entry.canvas.dataset.rendered = job.key;
    clearFailure(entry);
    return true;
   } finally {buffer.width = buffer.height = 0}
  } catch (error) {
   if (!controller.signal.aborted) showFailure(entry, error);
   return false;
  } finally {active = null}
 };
 const finalize = (page, job) => {
  const entry = entries.get(page);
  if (!entry) return;
  entry.bitmap = job.key;
  if (entry.host && entry.textKey !== job.key) requestText(page, job.key);
 };
 const pump = async () => {
  if (running || disposed) return;
  running = true;
  try {
   while (!disposed && queue.size) {
    let pick = null;
    for (const [page, job] of queue) {
     const score = Math.abs(page - focus), choice = !pick || score < pick.score || (score === pick.score && page < pick.page);
     if (choice) pick = {page, job, score};
    }
    queue.delete(pick.page);
    const entry = entries.get(pick.page);
    if (!entry?.host || disposed) continue;
    if (await draw(pick.page, pick.job)) finalize(pick.page, pick.job);
   }
  } finally {running = false}
 };
 const enqueue = (page, job) => {queue.set(page, job); pump()};
 return {
  /** 挂载页框：位图仍然匹配就直接复用，否则排队渲染（旧位图保留到新位图就绪，缩放时不会闪白）。 */
  mount(page, hosts, job) {
   const entry = ensure(page);
   entry.host = hosts;
   entry.used = ++clock;
   if (entry.canvas.parentNode !== hosts.canvas) hosts.canvas.append(entry.canvas);
   if (entry.bitmap !== job.key) enqueue(page, job)
   else if (entry.textKey !== job.key) requestText(page, job.key);
   evict();
  },
  unmount(page) {
   const entry = entries.get(page);
   if (!entry) return;
   entry.host = null;
   entry.used = ++clock;
   queue.delete(page);
   if (active?.page === page) active.controller.abort();
   entry.text?.cancel?.();
   entry.text = null;
   entry.textKey = '';
   evict();
  },
  /** 当前页改变（含目录跳转）时重排优先级：远处的排队项直接丢掉、在途渲染中止，避免跳转后被上一屏的渲染拖住。 */
  focus(page) {
   focus = page;
   for (const queued of queue.keys()) if (Math.abs(queued - page) > 3) queue.delete(queued);
   if (active && Math.abs(active.page - page) > 3) active.controller.abort();
  },
  isMounted(page) {return Boolean(entries.get(page)?.host)},
  dispose() {
   disposed = true;
   queue.clear();
   active?.controller.abort();
   for (const entry of entries.values()) {
    entry.text?.cancel?.();
    entry.canvas.width = entry.canvas.height = 0;
   }
   entries.clear();
  }
 };
}

function Viewer({content, resourceAddress, scrollportRef, useTabInfo, loadEngine, fallback}) {
 const {tab} = useTabInfo();
 const root = useRef(null), scroll = useRef(null), frame = useRef(0);
 const sizes = useRef(null), metrics = useRef(null), anchor = useRef(null), resumeAt = useRef(null);
 const progress = useRef(null), latest = useRef(null), saveTimer = useRef(0), restored = useRef(false);
 const renderer = useRef(null), heightRef = useRef(800);
 const [pageRenderer,setPageRenderer] = useState(null);
 const [loaded,setLoaded] = useState(null), [error,setError] = useState(''), [notice,setNotice] = useState('');
 const [outline,setOutline] = useState(null), [store,setStore] = useState(null), [bookmarks,setBookmarks] = useState([]);
 const [open,setOpen] = useState(true), [section,setSection] = useState('outline'), [current,setCurrent] = useState(1);
 const [zoom,setZoom] = useState('fit'), [fitWidth,setFitWidth] = useState(0), [narrow,setNarrow] = useState(false);
 const [editing,setEditing] = useState(null), [attempt,setAttempt] = useState(0), [resume,setResume] = useState(null);
 const [tableVersion,setTableVersion] = useState(0), [span,setSpan] = useState({first:0,last:0}), [preparing,setPreparing] = useState('');
 const bytes = content.kind === 'bytes' ? content.data : null;
 const textClass = loaded?.engine?.textClass || '';

 useEffect(() => {
  const controller=new AbortController();let session;
  const signal=tab?.signal ? AbortSignal.any([controller.signal,tab.signal]) : controller.signal;
  setLoaded(null);setOutline(null);setStore(null);setBookmarks([]);setError('');setNotice('');setCurrent(1);setResume(null);setPreparing('');
  resumeAt.current=null;restored.current=false;latest.current=null;sizes.current=null;anchor.current=null;
  if(bytes) (async()=>{
   let engine;
   try {engine=await loadEngine()} catch(err) {console.warn('[dsh-pdf-bookmarks] 引擎不可用，回退内置预览',err);if(!signal.aborted)fallback();return}
   signal.throwIfAborted();
   session=engine.openPdf(bytes,signal,err=>{if(!signal.aborted)setError('PDF 渲染进程异常，请重试或使用内置预览')});
   // 内容键与 PDF 解析、尺寸表并行算：没有 crypto.subtle 的环境要跑纯 JS SHA-256（27 MB 约 0.7 s），
   // 串在首屏前面就是白等这 0.7 s。
   const keying=documentKey(bytes);keying.catch(()=>{});
   const document=await session.document;
   signal.throwIfAborted();
   const table=await readSizes(document,signal,(done,total)=>setPreparing(`正在准备页面 ${done} / ${total}`));
   signal.throwIfAborted();
   const key=await keying;
   try {progress.current=createProgressStore(window.localStorage,key);const saved=progress.current.read();if(shouldResume(saved,document.numPages))resumeAt.current=saved} catch(err) {progress.current=null;console.warn('[dsh-pdf-bookmarks] 阅读进度不可用',err)}
   setPreparing('');
   sizes.current=table.sizes;
   setTableVersion(value=>value+1);
   setLoaded({document,engine,prepared:table.prepared});
   try {const next=createBookmarkStore(window.localStorage,key);const saved=next.list();if(!signal.aborted){setStore(next);setBookmarks(saved)}} catch(err) {if(!signal.aborted)setNotice('无法读取本地书签，原数据已保留：'+describe(err))}
   try {const items=await document.getOutline();if(!signal.aborted)setOutline(items||[])} catch(err) {if(!signal.aborted){setOutline([]);setNotice('文档目录读取失败，仍可使用个人书签：'+describe(err))}}
  })().catch(err=>{if(!signal.aborted)setError(err?.name==='PasswordException'?'此 PDF 需要密码，请使用其他查看器打开':describe(err))});
  return ()=>{controller.abort();session?.dispose();if(saveTimer.current){clearTimeout(saveTimer.current);saveTimer.current=0}if(restored.current&&latest.current)try{progress.current?.write(latest.current)}catch{}};
 },[bytes,tab?.signal,attempt,loadEngine,fallback]);

 /** 超大文档（>2000 页）只在打开时采样前 32 页，其余按出现最多的尺寸估计，再在后台逐页校准。 */
 useEffect(()=>{
  if(!loaded)return;
  const table=sizes.current,document=loaded.document;
  let stopped=false,changed=0,page=loaded.prepared+1;
  (async()=>{
   while(page<=document.numPages&&!stopped&&page>loaded.prepared){
    const batch=Math.min(page+32,document.numPages+1);
    for (;page<batch&&!stopped;page++){
     const proxy=await document.getPage(page);
     const viewport=proxy.getViewport({scale:96/72});
     if(!renderer.current?.isMounted(page))proxy.cleanup();
     const target=table[page-1];
     if(target.width!==viewport.width||target.height!==viewport.height){table[page-1]={width:viewport.width,height:viewport.height};changed++}
     if(stopped)break;
    }
    if(changed){changed=0;setTableVersion(value=>value+1)}
   }
  })().catch(err=>console.warn('[dsh-pdf-bookmarks] 页面尺寸读取中断',err));
  return ()=>{stopped=true};
 },[loaded]);

 useEffect(()=>{
  const node=root.current;if(!node)return;
  const observer=new ResizeObserver(()=>setNarrow(node.clientWidth<640));observer.observe(node);return ()=>observer.disconnect();
 },[]);
 const bindScroll=useCallback(node=>{scroll.current=node;if(typeof scrollportRef==='function')scrollportRef(node);else if(scrollportRef)scrollportRef.current=node},[scrollportRef]);

 /** 视口尺寸：高度直接用于可见范围；宽度（适应宽度）延迟合并，避免拖动侧栏时逐帧重渲染。 */
 useLayoutEffect(()=>{
  const node=scroll.current;
  if(!node)return;
  const settle=()=>setFitWidth(node.clientWidth);
  heightRef.current=node.clientHeight||800;
  settle();
  if(typeof ResizeObserver!=='undefined'){
   let timer=0;
   const observer=new ResizeObserver(()=>{
    heightRef.current=node.clientHeight||800;
    clearTimeout(timer);
    timer=setTimeout(()=>{if(node.isConnected){settle();sync()}},120);
   });
   observer.observe(node);
   return ()=>{observer.disconnect();clearTimeout(timer)};
  }
 },[loaded,open,narrow]);
 useEffect(()=>()=>cancelAnimationFrame(frame.current),[]);

 const scale=useMemo(()=>{
  if(!sizes.current?.length)return 1;
  return zoom==='fit'?Math.max(0.1,((fitWidth||600)-24)/fitBasisWidth(sizes.current)):Number(zoom);
 },[zoom,fitWidth,tableVersion]);
 const layout=useMemo(()=>sizes.current?buildMetrics(sizes.current,scale,GAP,PAD):null,[scale,tableVersion]);

 const persist=useCallback(position=>{
  if(!progress.current||!restored.current||!position)return;
  try {progress.current.write(position)} catch(err) {console.warn('[dsh-pdf-bookmarks] 阅读进度保存失败',err);progress.current=null}
 },[]);
 const scheduleSave=useCallback(position=>{
  latest.current=position;if(saveTimer.current)clearTimeout(saveTimer.current);
  saveTimer.current=setTimeout(()=>{saveTimer.current=0;persist(latest.current)},600);
 },[persist]);

 /** 滚动唯一的 O(log n) 记账：只读 scrollTop，不再遍历页框。 */
 const sync=useCallback(()=>{
  const node=scroll.current,table=metrics.current;
  if(!node||!table)return;
  const top=node.scrollTop,height=node.clientHeight||heightRef.current;
  const range=visibleRange(table.tops,table.heights,top,height,height);
  const position=positionAt(table.tops,table.heights,top);
  anchor.current=position;
  setSpan(previous=>previous.first===range.first&&previous.last===range.last?previous:range);
  setCurrent(previous=>previous===position.page?previous:position.page);
  if(restored.current)scheduleSave(position);
 },[scheduleSave]);

 useLayoutEffect(()=>{
  const node=scroll.current,previous=metrics.current;
  metrics.current=layout;
  if(!node||!layout)return;
  const position=anchor.current;
  if(previous&&previous!==layout&&position) node.scrollTop=landing(layout,position);
  sync();
 },[layout,sync]);

 const onScroll=useCallback(()=>{cancelAnimationFrame(frame.current);frame.current=requestAnimationFrame(sync)},[sync]);

 useEffect(()=>{
  if(!loaded)return;
  const instance=createRenderer({engine:loaded.engine,pdf:loaded.document,ownerDocument:window.document});
  renderer.current=instance;
  setPageRenderer(instance);
  return ()=>{instance.dispose();renderer.current=null;setPageRenderer(null)};
 },[loaded]);

 /** 跳转只依赖尺寸表，落地即准，不必等目标页渲染完成。 */
 const jump=useCallback((position,close=true)=>{
  const node=scroll.current,table=metrics.current;
  if(!node||!table)return;
  if(!Number.isInteger(position.page)||position.page<1||position.page>table.count){setNotice('书签目标超出当前文档页数');return}
  const index=position.page-1;
  node.scrollTop=landing(table,position);
  setCurrent(position.page);
  sync();
  if(close&&narrow)setOpen(false);
 },[narrow,sync]);

 useEffect(()=>{
  if(!loaded||!layout||restored.current)return;
  if(!resumeAt.current){restored.current=true;return}
  const position=resumeAt.current;resumeAt.current=null;
  jump(position,false);
  restored.current=true;latest.current=position;setResume({page:position.page});
 },[loaded,layout,jump]);

 useEffect(()=>{renderer.current?.focus(current)},[current,pageRenderer]);

 useEffect(()=>{
  const flush=()=>{if(saveTimer.current){clearTimeout(saveTimer.current);saveTimer.current=0}if(restored.current&&latest.current)persist(latest.current)};
  const hidden=()=>{if(document.visibilityState==='hidden')flush()};
  window.addEventListener('pagehide',flush);document.addEventListener('visibilitychange',hidden);
  return ()=>{window.removeEventListener('pagehide',flush);document.removeEventListener('visibilitychange',hidden);flush()};
 },[persist]);

 const visit=async destination=>{try{setResume(null);jump(await resolveDestination(loaded.document,destination));setNotice('')}catch(err){setNotice(describe(err))}};
 const mutate=operation=>{try{operation();setBookmarks(store.list());setNotice('')}catch(err){setNotice('书签未保存：'+describe(err))}};
 const add=()=>{if(!store)return;mutate(()=>{const position=anchor.current||{page:1,offset:0};const item=store.add({...position,label:`第 ${position.page} 页`});setEditing(item.id);setSection('mine');setOpen(true)})};
 const refresh=()=>{try{setBookmarks(store.list())}catch(err){setNotice('书签读取失败：'+describe(err))}};
 const restart=()=>{if(saveTimer.current){clearTimeout(saveTimer.current);saveTimer.current=0}try{progress.current?.clear()}catch{}setResume(null);restored.current=true;latest.current={page:1,offset:0};jump({page:1,offset:0},false)};
 useEffect(()=>{
  if(!store)return;window.addEventListener('storage',refresh);return ()=>window.removeEventListener('storage',refresh);
 },[store]);

 const ratio=scale*renderDensity();
 const sheets=[];
 if(layout){
  const pageWidth=Math.max(layout.width+PAD*2,fitWidth||0);
  for(let page=span.first+1;page<=span.last+1;page++){
   const index=page-1;
   sheets.push(h(Sheet,{key:page,renderer:pageRenderer,page,top:layout.tops[index],left:(pageWidth-layout.widths[index])/2,width:layout.widths[index],height:layout.heights[index],ratio,textClass}));
  }
 }
 return h('div',{className:'dpb-root',ref:root,'data-pdf-bookmarks':true},
  h('style',null,css),
  h('div',{className:'dpb-toolbar',role:'toolbar','aria-label':'PDF 阅读工具'},
   h(Button,{'aria-expanded':open,'aria-label':'切换书签导航',onClick:()=>setOpen(!open),title:'目录和书签'},'☰'),
   h('span',{className:'dpb-pages'},loaded?h('input',{'aria-label':'当前页',type:'number',min:1,max:loaded.document.numPages,value:current,onChange:event=>{const page=Number(event.target.value);if(page>=1&&page<=loaded.document.numPages){setResume(null);jump({page,offset:0},false)}}}):'…',loaded&&` / ${loaded.document.numPages}`),
   h('span',{className:'dpb-spacer'}),
   h('select',{'aria-label':'缩放比例',value:zoom,onChange:event=>setZoom(event.target.value)},h('option',{value:'fit'},'适应宽度'),...[0.5,0.75,1,1.25,1.5,2].map(value=>h('option',{key:value,value},`${value*100}%`))),
   h(Button,{onClick:add,disabled:!store,'aria-label':'添加当前阅读位置为书签',title:'添加书签'},'☆ 书签')),
  notice&&h('div',{className:'dpb-notice',role:'status'},notice,h(Button,{onClick:()=>setNotice(''),'aria-label':'关闭提示'},'×')),
  resume&&h('div',{className:'dpb-notice dpb-resume',role:'status'},`已回到上次阅读位置：第 ${resume.page} 页`,h(Button,{onClick:restart},'回到开头'),h(Button,{onClick:()=>setResume(null),'aria-label':'关闭续读提示'},'×')),
  error?h('div',{className:'dpb-status',role:'alert'},h('p',null,error),h(Button,{onClick:()=>setAttempt(attempt+1)},'重试'),h(Button,{onClick:fallback},'使用内置 PDF 预览')):
  !layout?h('div',{className:'dpb-status',role:'status'},preparing||'正在打开 PDF…'):
  h('div',{className:'dpb-content'+(narrow?' dpb-narrow':'')},
   open&&h('nav',{className:'dpb-nav','aria-label':'PDF 书签导航'},
    h('div',{className:'dpb-tabs',role:'tablist','aria-label':'导航类型'},
     h(Button,{role:'tab','aria-selected':section==='outline',onClick:()=>setSection('outline')},'文档目录'),
     h(Button,{role:'tab','aria-selected':section==='mine',onClick:()=>setSection('mine')},'我的书签')),
    h('div',{className:'dpb-nav-body'},section==='outline'?
     outline===null?h('p',{className:'dpb-empty'},'正在读取目录…'):outline.length?h(Outline,{items:outline,visit}):h('p',{className:'dpb-empty'},'此 PDF 没有内置目录。可在“我的书签”中添加阅读位置。'):
     bookmarks.length?h('ul',{className:'dpb-bookmarks'},bookmarks.map(item=>h('li',{key:item.id},editing===item.id?
      h(BookmarkName,{item,save:label=>{mutate(()=>store.rename(item.id,label));setEditing(null)},cancel:()=>setEditing(null)}):
      h(React.Fragment,null,h(Button,{className:'dpb-bookmark-link',onClick:()=>{setResume(null);jump(item)},title:item.label},h('span',null,item.label),h('small',null,`第 ${item.page} 页`)),
       h(Button,{'aria-label':`重命名书签 ${item.label}`,onClick:()=>setEditing(item.id),title:'重命名'},'✎'),
       h(Button,{'aria-label':`删除书签 ${item.label}`,onClick:()=>mutate(()=>store.remove(item.id)),title:'删除'},'×'))))):
     h('p',{className:'dpb-empty'},store?'还没有阅读书签。点击工具栏“☆ 书签”收藏当前位置。':'本地书签暂不可用，仍可阅读文档和使用目录。')),
    h('div',{className:'dpb-nav-footer'},'书签保存在本机，PDF 原文件不变')),
   h('div',{className:'dpb-scroll',ref:bindScroll,onScroll,onWheel:()=>{},'aria-label':'PDF 文档页面',tabIndex:0},
    h('div',{className:'dpb-paper-list',style:{height:layout.total,width:Math.max(layout.width+PAD*2,fitWidth||0)}},sheets))));
}

function Outline({items,visit}) {
 return h('ul',{className:'dpb-outline'},items.map((item,index)=>h(OutlineItem,{key:index,item,visit})));
}
function OutlineItem({item,visit}) {
 const [expanded,setExpanded]=useState(true), children=item.items?.length>0;
 return h('li',null,h('div',{className:'dpb-outline-row'},children?h(Button,{'aria-label':`${expanded?'收起':'展开'} ${item.title}`,'aria-expanded':expanded,onClick:()=>setExpanded(!expanded)},expanded?'⌄':'›'):h('span',{className:'dpb-tree-spacer'}),
  h(Button,{className:'dpb-outline-link',disabled:!item.dest,title:item.dest?item.title:'此项没有文档内跳转目标',onClick:()=>visit(item.dest)},item.title||'未命名章节')),
  children&&expanded&&h(Outline,{items:item.items,visit}));
}
function BookmarkName({item,save,cancel}) {
 const [value,setValue]=useState(item.label),input=useRef(null);
 useEffect(()=>{input.current?.focus();input.current?.select()},[]);
 return h('form',{className:'dpb-name',onSubmit:event=>{event.preventDefault();if(value.trim())save(value)}},
  h('input',{ref:input,'aria-label':'书签名称',value,maxLength:200,onChange:event=>setValue(event.target.value),onKeyDown:event=>{if(event.key==='Escape')cancel()}}),
  h(Button,{type:'submit',disabled:!value.trim()},'保存'),h(Button,{onClick:cancel,'aria-label':'取消修改书签'},'取消'));
}
/** 目标页在滚动内容里的落点：文档开头保持 0（不裁掉首端留白），其余向上取整以免整像素对齐后退回上一页。 */
function landing(table, position) {
 const index = position.page - 1;
 const offset = Math.max(0, Math.min(1, position.offset || 0));
 if (index === 0 && offset === 0) return 0;
 return Math.max(0, Math.ceil(table.tops[index] + table.heights[index] * offset));
}

/** 只渲染几何；位图由渲染器按当前页优先挂到 canvas 容器里，滚动不会引起整表重渲染。 */
function Sheet({renderer,page,top,left,width,height,ratio,textClass}) {
 const root=useRef(null),canvas=useRef(null),text=useRef(null);
 useLayoutEffect(()=>{
  if(!renderer)return;
  renderer.mount(page,{root:root.current,canvas:canvas.current,text:text.current},{key:String(ratio),ratio});
  return ()=>renderer.unmount(page);
 },[renderer,page,ratio]);
 return h('section',{ref:root,className:'dpb-page','data-bookmark-page':page,style:{top,left,width,height},'aria-label':`第 ${page} 页`},
  h('div',{ref:canvas,className:'dpb-canvas'}),
  h('div',{ref:text,className:`dpb-text ${textClass}`}));
}

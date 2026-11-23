import {sha256HexChunked} from './sha256.js';

/**
 * 生成随机 id。
 * 不用 `crypto.randomUUID()` 裸调用：它和 `crypto.subtle` 一样只在安全上下文里有，
 * 通过 http 域名访问时是 undefined（书签保存会当场抛错）。
 */
export function newId(cryptoRef = globalThis.crypto) {
 if (typeof cryptoRef?.randomUUID === 'function') {
  try { return cryptoRef.randomUUID(); } catch {}
 }
 const bytes = new Uint8Array(16);
 if (typeof cryptoRef?.getRandomValues === 'function') cryptoRef.getRandomValues(bytes);
 else for (let i = 0; i < bytes.length; i += 1) bytes[i] = Math.floor(Math.random() * 256);
 bytes[6] = (bytes[6] & 0x0f) | 0x40;
 bytes[8] = (bytes[8] & 0x3f) | 0x80;
 const hex = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
 return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/** 书签只保存导航元数据；写入成功后才返回新结果。 */
export function createBookmarkStore(storage, documentKey) {
 const key = `dsh-pdf-bookmarks:v1:${documentKey}`;
 const read = () => {
  const raw = storage.getItem(key);
  if (raw === null) return [];
  const parsed = JSON.parse(raw);
  if (parsed?.version !== 1 || !Array.isArray(parsed.bookmarks)) throw new Error('书签数据版本不支持，原数据已保留');
  for (const item of parsed.bookmarks) validate(item, true);
  return parsed.bookmarks;
 };
 const write = (items) => storage.setItem(key, JSON.stringify({version: 1, bookmarks: items}));
 return {
  list: read,
  add(value) {
   validate(value);
   const items = read();
   const item = {...value, label: value.label.trim(), id: newId(), createdAt: new Date().toISOString()};
   write([...items, item]); return item;
  },
  rename(id, label) {
   if (typeof label !== 'string' || !label.trim()) throw new Error('请输入书签名称');
   write(read().map(item => item.id === id ? {...item, label: label.trim()} : item));
  },
  remove(id) { write(read().filter(item => item.id !== id)); }
 };
}
function validate(value, stored = false) {
 if (!value || !Number.isInteger(value.page) || value.page < 1 || !Number.isFinite(value.offset) || value.offset < 0 || value.offset > 1 || typeof value.label !== 'string' || !value.label.trim() || (stored && typeof value.id !== 'string')) throw new Error('书签数据无效，原数据已保留');
}
/**
 * 文档内容键 = 整份内容的 SHA-256（小写十六进制）。
 *
 * `crypto.subtle` 只在安全上下文（https / localhost / file）里存在，通过 http 域名访问 DSH 时
 * 它是 undefined，直接调用会抛 `Cannot read properties of undefined (reading 'digest')`，
 * 于是整份 PDF 打不开。这里保留原生实现（快），缺失时退到自带的纯 JS SHA-256 ——
 * 两者输出逐字节一致，因此书签/续读的键在任何环境下都相同，已有数据不需要迁移。
 * 降级路径分片计算并让出主线程，27 MB 的文档也不会把界面卡住。
 */
const keyCache = new WeakMap();
export async function documentKey(bytes, cryptoRef = globalThis.crypto) {
 const cached = keyCache.get(bytes);
 if (cached !== undefined) return cached;
 let key;
 const subtle = cryptoRef?.subtle;
 if (typeof subtle?.digest === 'function') {
  try {
   const digest = await subtle.digest('SHA-256', bytes);
   key = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
  } catch { /* 引擎拒绝时退到纯 JS，输出相同 */ }
 }
 if (key === undefined) key = await sha256HexChunked(bytes);
 keyCache.set(bytes, key);
 return key;
}
/** PDF 目录的零起算索引或引用转换为阅读器的一起算页码。 */
export async function resolveDestination(document, destination) {
 const target = typeof destination === 'string' ? await document.getDestination(destination) : destination;
 if (!Array.isArray(target) || target.length < 2) throw new Error('此目录项没有有效的文档内位置');
 const index = Number.isInteger(target[0]) ? target[0] : await document.getPageIndex(target[0]);
 if (!Number.isInteger(index) || index < 0 || index >= document.numPages) throw new Error('目录目标超出文档页数');
 const page = index + 1, mode = target[1]?.name;
 const y = mode === 'XYZ' ? target[3] : mode === 'FitR' ? target[5] : ['FitH', 'FitBH'].includes(mode) ? target[2] : null;
 let offset = 0;
 if (Number.isFinite(y)) {
  const viewport = (await document.getPage(page)).getViewport({scale: 1});
  const point = viewport.convertToViewportPoint(Number.isFinite(target[2]) && mode === 'XYZ' ? target[2] : 0, y);
  offset = Math.min(1, Math.max(0, point[1] / viewport.height));
 }
 return {page, offset};
}

/** 自动续读位置：与书签分键存储，损坏或不可写时只退化为“不续读”。 */
export function createProgressStore(storage, documentKey) {
 const key = `dsh-pdf-bookmarks:progress:v1:${documentKey}`;
 const valid = value => value && Number.isInteger(value.page) && value.page >= 1 && Number.isFinite(value.offset) && value.offset >= 0 && value.offset <= 1;
 return {
  read() {
   let raw;
   try { raw = storage.getItem(key); } catch { return null; }
   if (raw === null || raw === undefined) return null;
   let parsed;
   try { parsed = JSON.parse(raw); } catch { return null; }
   if (parsed?.version !== 1 || !valid(parsed)) return null;
   return {page: parsed.page, offset: parsed.offset};
  },
  write(position) {
   if (!valid(position)) return;
   storage.setItem(key, JSON.stringify({version: 1, page: position.page, offset: position.offset, updatedAt: new Date().toISOString()}));
  },
  clear() { try { storage.removeItem?.(key); } catch {} }
 };
}

/** 只有确实离开开头才自动续读，避免每次打开都提示；超出当前页数视为失效。 */
export function shouldResume(position, numPages) {
 if (!position || !Number.isInteger(position.page) || !Number.isInteger(numPages)) return false;
 if (position.page < 1 || position.page > numPages) return false;
 return position.page > 1 || (Number.isFinite(position.offset) && position.offset > 0.02);
}

/** 页面尺寸表换算为绝对定位所需的累计偏移（CSS px）。sizes 为 96/72 比例的视口尺寸。 */
export function buildMetrics(sizes, scale, gap, pad) {
 const count = sizes.length, tops = new Float64Array(count), heights = new Float64Array(count), widths = new Float64Array(count);
 let y = pad, widest = 0;
 for (let index = 0; index < count; index++) {
  const size = sizes[index];
  tops[index] = y;
  widths[index] = size.width * scale;
  heights[index] = size.height * scale;
  y += heights[index] + gap;
  if (widths[index] > widest) widest = widths[index];
 }
 return {count, tops, heights, widths, width: widest, total: Math.max(pad, y - gap + pad)};
}

/** 视口顶部所在页（0 起算）；y 超出末尾时收敛到最后一页。 */
export function pageIndexAt(tops, y) {
 let low = 0, high = tops.length - 1, found = 0;
 while (low <= high) {
  const middle = (low + high) >> 1;
  if (tops[middle] <= y) {found = middle; low = middle + 1} else high = middle - 1;
 }
 return found;
}

/** 视口 [top, top+height) 内的页范围（0 起算，含 overscan）。 */
export function visibleRange(tops, heights, top, height, overscan = 0) {
 const first = pageIndexAt(tops, top - overscan), limit = top + height + overscan;
 let last = first;
 while (last + 1 < tops.length && tops[last + 1] < limit) last++;
 return {first, last};
}

/**
 * 视口顶部所在页与页内相对位置。以顶边而非"可见面积最大"为准：
 * 它与 jump 的落点严格互逆（同一位置读出来再跳回去一定回到原处），
 * 缩放着窗、封面比正文小时也不会把"当前页"算成下一页。
 */
export function positionAt(tops, heights, top) {
 const index = pageIndexAt(tops, top), height = heights[index] || 1;
 return {page: index + 1, offset: Math.max(0, Math.min(1, (top - tops[index]) / height))};
}

/** 适应宽度以出现最多的页宽为准：个别封面/插页与正文尺寸不同时，不该用第 1 页把整本撑歪。 */
export function fitBasisWidth(sizes) {
 const counts = new Map();
 for (const size of sizes) {
  const width = Math.round(size.width * 10) / 10;
  counts.set(width, (counts.get(width) || 0) + 1);
 }
 let best = 0, bestCount = 0;
 for (const [width, count] of counts) if (count > bestCount || (count === bestCount && width > best)) {best = width; bestCount = count}
 return best || 1;
}

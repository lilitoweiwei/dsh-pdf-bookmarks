// dsh-pdf-bookmarks: small, exception-isolated entry; PDF engine loads only when used.
try { window.__ModuleLoader__?.load({id:'dsh-pdf-bookmarks',factory:(require)=>{try {const module={exports:{}};const exports=module.exports;
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/client.js
var client_exports = {};
__export(client_exports, {
  apply: () => apply,
  inject: () => inject
});
module.exports = __toCommonJS(client_exports);

// src/viewer.js
var import_react = __toESM(require("react"), 1);

// src/sha256.js
var K = new Uint32Array([
  1116352408,
  1899447441,
  3049323471,
  3921009573,
  961987163,
  1508970993,
  2453635748,
  2870763221,
  3624381080,
  310598401,
  607225278,
  1426881987,
  1925078388,
  2162078206,
  2614888103,
  3248222580,
  3835390401,
  4022224774,
  264347078,
  604807628,
  770255983,
  1249150122,
  1555081692,
  1996064986,
  2554220882,
  2821834349,
  2952996808,
  3210313671,
  3336571891,
  3584528711,
  113926993,
  338241895,
  666307205,
  773529912,
  1294757372,
  1396182291,
  1695183700,
  1986661051,
  2177026350,
  2456956037,
  2730485921,
  2820302411,
  3259730800,
  3345764771,
  3516065817,
  3600352804,
  4094571909,
  275423344,
  430227734,
  506948616,
  659060556,
  883997877,
  958139571,
  1322822218,
  1537002063,
  1747873779,
  1955562222,
  2024104815,
  2227730452,
  2361852424,
  2428436474,
  2756734187,
  3204031479,
  3329325298
]);
function createSha256() {
  let h0 = 1779033703, h1 = 3144134277, h2 = 1013904242, h3 = 2773480762;
  let h4 = 1359893119, h5 = 2600822924, h6 = 528734635, h7 = 1541459225;
  const w = new Uint32Array(64);
  const tail = new Uint8Array(64);
  let tailLen = 0, total = 0, closed = false;
  function compress(src, off) {
    for (let i = 0; i < 16; i++) {
      const j = off + (i << 2);
      w[i] = (src[j] << 24 | src[j + 1] << 16 | src[j + 2] << 8 | src[j + 3]) >>> 0;
    }
    for (let i = 16; i < 64; i++) {
      const x = w[i - 15], y = w[i - 2];
      const s0 = (x >>> 7 | x << 25) ^ (x >>> 18 | x << 14) ^ x >>> 3;
      const s1 = (y >>> 17 | y << 15) ^ (y >>> 19 | y << 13) ^ y >>> 10;
      w[i] = w[i - 16] + s0 + w[i - 7] + s1 >>> 0;
    }
    let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h8 = h7;
    for (let i = 0; i < 64; i++) {
      const S1 = (e >>> 6 | e << 26) ^ (e >>> 11 | e << 21) ^ (e >>> 25 | e << 7);
      const ch = e & f ^ ~e & g;
      const t1 = h8 + S1 + ch + K[i] + w[i] >>> 0;
      const S0 = (a >>> 2 | a << 30) ^ (a >>> 13 | a << 19) ^ (a >>> 22 | a << 10);
      const maj = a & b ^ a & c ^ b & c;
      const t2 = S0 + maj >>> 0;
      h8 = g;
      g = f;
      f = e;
      e = d + t1 >>> 0;
      d = c;
      c = b;
      b = a;
      a = t1 + t2 >>> 0;
    }
    h0 = h0 + a >>> 0;
    h1 = h1 + b >>> 0;
    h2 = h2 + c >>> 0;
    h3 = h3 + d >>> 0;
    h4 = h4 + e >>> 0;
    h5 = h5 + f >>> 0;
    h6 = h6 + g >>> 0;
    h7 = h7 + h8 >>> 0;
  }
  return {
    update(data) {
      if (closed) throw new Error("SHA-256 \u5DF2\u7ED3\u675F\uFF0C\u4E0D\u80FD\u7EE7\u7EED\u5199\u5165");
      const n = data.length;
      if (n === 0) return this;
      total += n;
      let i = 0;
      if (tailLen > 0) {
        const need = Math.min(64 - tailLen, n);
        tail.set(data.subarray(0, need), tailLen);
        tailLen += need;
        i = need;
        if (tailLen < 64) return this;
        compress(tail, 0);
        tailLen = 0;
      }
      for (; i + 64 <= n; i += 64) compress(data, i);
      if (i < n) {
        tail.set(data.subarray(i), 0);
        tailLen = n - i;
      }
      return this;
    },
    digestHex() {
      if (closed) throw new Error("SHA-256 \u5DF2\u7ECF\u8BA1\u7B97\u8FC7");
      const bits = total * 8;
      const padLen = tailLen < 56 ? 64 - tailLen : 128 - tailLen;
      const pad = new Uint8Array(padLen);
      pad[0] = 128;
      const view = new DataView(pad.buffer);
      view.setUint32(padLen - 8, Math.floor(bits / 4294967296));
      view.setUint32(padLen - 4, bits >>> 0);
      let i = 0;
      if (tailLen > 0) {
        i = 64 - tailLen;
        tail.set(pad.subarray(0, i), tailLen);
        compress(tail, 0);
        tailLen = 0;
      }
      for (; i + 64 <= padLen; i += 64) compress(pad, i);
      if (i !== padLen) throw new Error("SHA-256 \u8865\u9F50\u5931\u8D25");
      closed = true;
      let out = "";
      for (const h8 of [h0, h1, h2, h3, h4, h5, h6, h7]) out += h8.toString(16).padStart(8, "0");
      return out;
    }
  };
}
function yieldTask() {
  if (typeof MessageChannel === "function") {
    return new Promise((resolve) => {
      const channel = new MessageChannel();
      channel.port1.onmessage = () => {
        channel.port1.close();
        resolve();
      };
      channel.port2.postMessage(0);
    });
  }
  return new Promise((resolve) => setTimeout(resolve, 0));
}
async function sha256HexChunked(bytes, { chunkSize = 262144, slice = null } = {}) {
  const view = slice ? bytes.subarray(slice.start ?? 0, slice.end ?? bytes.length) : bytes;
  const hash = createSha256();
  if (view.length <= chunkSize * 2) return hash.update(view).digestHex();
  for (let offset = 0; offset < view.length; offset += chunkSize) {
    hash.update(view.subarray(offset, Math.min(offset + chunkSize, view.length)));
    if (offset + chunkSize < view.length) await yieldTask();
  }
  return hash.digestHex();
}

// src/core.js
function newId(cryptoRef = globalThis.crypto) {
  if (typeof cryptoRef?.randomUUID === "function") {
    try {
      return cryptoRef.randomUUID();
    } catch {
    }
  }
  const bytes = new Uint8Array(16);
  if (typeof cryptoRef?.getRandomValues === "function") cryptoRef.getRandomValues(bytes);
  else for (let i = 0; i < bytes.length; i += 1) bytes[i] = Math.floor(Math.random() * 256);
  bytes[6] = bytes[6] & 15 | 64;
  bytes[8] = bytes[8] & 63 | 128;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
function createBookmarkStore(storage, documentKey2) {
  const key = `dsh-pdf-bookmarks:v1:${documentKey2}`;
  const read = () => {
    const raw = storage.getItem(key);
    if (raw === null) return [];
    const parsed = JSON.parse(raw);
    if (parsed?.version !== 1 || !Array.isArray(parsed.bookmarks)) throw new Error("\u4E66\u7B7E\u6570\u636E\u7248\u672C\u4E0D\u652F\u6301\uFF0C\u539F\u6570\u636E\u5DF2\u4FDD\u7559");
    for (const item of parsed.bookmarks) validate(item, true);
    return parsed.bookmarks;
  };
  const write = (items) => storage.setItem(key, JSON.stringify({ version: 1, bookmarks: items }));
  return {
    list: read,
    add(value) {
      validate(value);
      const items = read();
      const item = { ...value, label: value.label.trim(), id: newId(), createdAt: (/* @__PURE__ */ new Date()).toISOString() };
      write([...items, item]);
      return item;
    },
    rename(id, label) {
      if (typeof label !== "string" || !label.trim()) throw new Error("\u8BF7\u8F93\u5165\u4E66\u7B7E\u540D\u79F0");
      write(read().map((item) => item.id === id ? { ...item, label: label.trim() } : item));
    },
    remove(id) {
      write(read().filter((item) => item.id !== id));
    }
  };
}
function validate(value, stored = false) {
  if (!value || !Number.isInteger(value.page) || value.page < 1 || !Number.isFinite(value.offset) || value.offset < 0 || value.offset > 1 || typeof value.label !== "string" || !value.label.trim() || stored && typeof value.id !== "string") throw new Error("\u4E66\u7B7E\u6570\u636E\u65E0\u6548\uFF0C\u539F\u6570\u636E\u5DF2\u4FDD\u7559");
}
var keyCache = /* @__PURE__ */ new WeakMap();
async function documentKey(bytes, cryptoRef = globalThis.crypto) {
  const cached = keyCache.get(bytes);
  if (cached !== void 0) return cached;
  let key;
  const subtle = cryptoRef?.subtle;
  if (typeof subtle?.digest === "function") {
    try {
      const digest = await subtle.digest("SHA-256", bytes);
      key = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
    } catch {
    }
  }
  if (key === void 0) key = await sha256HexChunked(bytes);
  keyCache.set(bytes, key);
  return key;
}
async function resolveDestination(document2, destination) {
  const target = typeof destination === "string" ? await document2.getDestination(destination) : destination;
  if (!Array.isArray(target) || target.length < 2) throw new Error("\u6B64\u76EE\u5F55\u9879\u6CA1\u6709\u6709\u6548\u7684\u6587\u6863\u5185\u4F4D\u7F6E");
  const index = Number.isInteger(target[0]) ? target[0] : await document2.getPageIndex(target[0]);
  if (!Number.isInteger(index) || index < 0 || index >= document2.numPages) throw new Error("\u76EE\u5F55\u76EE\u6807\u8D85\u51FA\u6587\u6863\u9875\u6570");
  const page = index + 1, mode = target[1]?.name;
  const y = mode === "XYZ" ? target[3] : mode === "FitR" ? target[5] : ["FitH", "FitBH"].includes(mode) ? target[2] : null;
  let offset = 0;
  if (Number.isFinite(y)) {
    const viewport = (await document2.getPage(page)).getViewport({ scale: 1 });
    const point = viewport.convertToViewportPoint(Number.isFinite(target[2]) && mode === "XYZ" ? target[2] : 0, y);
    offset = Math.min(1, Math.max(0, point[1] / viewport.height));
  }
  return { page, offset };
}
function createProgressStore(storage, documentKey2) {
  const key = `dsh-pdf-bookmarks:progress:v1:${documentKey2}`;
  const valid = (value) => value && Number.isInteger(value.page) && value.page >= 1 && Number.isFinite(value.offset) && value.offset >= 0 && value.offset <= 1;
  return {
    read() {
      let raw;
      try {
        raw = storage.getItem(key);
      } catch {
        return null;
      }
      if (raw === null || raw === void 0) return null;
      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch {
        return null;
      }
      if (parsed?.version !== 1 || !valid(parsed)) return null;
      return { page: parsed.page, offset: parsed.offset };
    },
    write(position) {
      if (!valid(position)) return;
      storage.setItem(key, JSON.stringify({ version: 1, page: position.page, offset: position.offset, updatedAt: (/* @__PURE__ */ new Date()).toISOString() }));
    },
    clear() {
      try {
        storage.removeItem?.(key);
      } catch {
      }
    }
  };
}
function shouldResume(position, numPages) {
  if (!position || !Number.isInteger(position.page) || !Number.isInteger(numPages)) return false;
  if (position.page < 1 || position.page > numPages) return false;
  return position.page > 1 || Number.isFinite(position.offset) && position.offset > 0.02;
}
function buildMetrics(sizes, scale, gap, pad) {
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
  return { count, tops, heights, widths, width: widest, total: Math.max(pad, y - gap + pad) };
}
function pageIndexAt(tops, y) {
  let low = 0, high = tops.length - 1, found = 0;
  while (low <= high) {
    const middle = low + high >> 1;
    if (tops[middle] <= y) {
      found = middle;
      low = middle + 1;
    } else high = middle - 1;
  }
  return found;
}
function visibleRange(tops, heights, top, height, overscan = 0) {
  const first = pageIndexAt(tops, top - overscan), limit = top + height + overscan;
  let last = first;
  while (last + 1 < tops.length && tops[last + 1] < limit) last++;
  return { first, last };
}
function positionAt(tops, heights, top) {
  const index = pageIndexAt(tops, top), height = heights[index] || 1;
  return { page: index + 1, offset: Math.max(0, Math.min(1, (top - tops[index]) / height)) };
}
function fitBasisWidth(sizes) {
  const counts = /* @__PURE__ */ new Map();
  for (const size of sizes) {
    const width = Math.round(size.width * 10) / 10;
    counts.set(width, (counts.get(width) || 0) + 1);
  }
  let best = 0, bestCount = 0;
  for (const [width, count] of counts) if (count > bestCount || count === bestCount && width > best) {
    best = width;
    bestCount = count;
  }
  return best || 1;
}

// src/viewer.css
var viewer_default = '.dpb-root{--dpb-bg:var(--dsw-alias-bg-primary,oklch(98% .004 250));--dpb-label:var(--dsw-alias-label-primary,oklch(24% .012 250));--dpb-muted:var(--dsw-alias-label-secondary,oklch(53% .012 250));--dpb-border:var(--dsw-alias-border-primary,oklch(87% .008 250));--dpb-accent:var(--dsw-alias-label-link,oklch(52% .18 264));display:flex;flex-direction:column;min-height:0;height:100%;width:100%;color:var(--dpb-label);background:var(--dpb-bg);font:12px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;white-space:normal}.dpb-root *{box-sizing:border-box}.dpb-root button,.dpb-root select,.dpb-root input{font:inherit;color:inherit;border:1px solid transparent;border-radius:5px;background:transparent}.dpb-root button{cursor:pointer;padding:4px 7px;white-space:nowrap}.dpb-root button:hover,.dpb-root select:hover{background:color-mix(in oklch,var(--dpb-label) 7%,transparent)}.dpb-root button:disabled{opacity:.45;cursor:default}.dpb-root :is(button,select,input):focus-visible{outline:2px solid var(--dpb-accent);outline-offset:1px}.dpb-toolbar{display:flex;align-items:center;gap:6px;min-height:38px;padding:4px 8px;border-bottom:1px solid var(--dpb-border);flex:none}.dpb-spacer{flex:1}.dpb-pages{display:flex;align-items:center;gap:4px;font-variant-numeric:tabular-nums;white-space:nowrap;color:var(--dpb-muted)}.dpb-pages input{width:43px;padding:3px;text-align:center;border-color:var(--dpb-border);appearance:textfield}.dpb-pages input::-webkit-inner-spin-button{appearance:none}.dpb-toolbar select{max-width:100px;padding:3px}.dpb-content{flex:1;display:flex;position:relative;min-height:0;overflow:hidden}.dpb-nav{width:204px;flex:none;min-height:0;display:flex;flex-direction:column;border-right:1px solid var(--dpb-border);background:var(--dpb-bg);z-index:2}.dpb-narrow .dpb-nav{position:absolute;left:0;top:0;bottom:0;width:min(240px,82%);box-shadow:4px 0 16px color-mix(in oklch,var(--dpb-label) 12%,transparent)}.dpb-tabs{display:flex;gap:4px;padding:7px 8px;border-bottom:1px solid var(--dpb-border)}.dpb-tabs button{flex:1;color:var(--dpb-muted)}.dpb-tabs [aria-selected=true]{color:var(--dpb-label);font-weight:600;background:color-mix(in oklch,var(--dpb-label) 7%,transparent)}.dpb-nav-body{flex:1;overflow:auto;padding:6px 4px}.dpb-nav-footer{font-size:10px;color:var(--dpb-muted);border-top:1px solid var(--dpb-border);padding:8px 10px}.dpb-empty{color:var(--dpb-muted);padding:8px 10px;line-height:1.8;margin:0}.dpb-outline,.dpb-bookmarks{list-style:none;margin:0;padding:0}.dpb-outline .dpb-outline{padding-left:14px}.dpb-outline-row{display:flex;align-items:baseline;min-height:31px}.dpb-outline-row>button:first-child,.dpb-tree-spacer{width:23px;flex:none;padding-inline:2px}.dpb-root .dpb-outline-link{min-width:0;flex:1;text-align:left;white-space:normal;overflow-wrap:anywhere;padding:5px 4px;line-height:1.6}.dpb-bookmarks li{display:flex;align-items:center;gap:1px;border-bottom:1px solid color-mix(in oklch,var(--dpb-border) 50%,transparent)}.dpb-root .dpb-bookmark-link{min-width:0;flex:1;display:flex;flex-direction:column;align-items:flex-start;text-align:left;padding:7px;white-space:normal;overflow-wrap:anywhere}.dpb-bookmark-link small{font-size:10px;color:var(--dpb-muted);margin-top:2px}.dpb-name{display:flex;flex-wrap:wrap;gap:4px;padding:7px;width:100%}.dpb-name input{width:100%;padding:5px;border-color:var(--dpb-border)}.dpb-name button{border-color:var(--dpb-border)}.dpb-scroll{flex:1;min-width:0;min-height:0;overflow:auto;background:var(--dsw-alias-bg-document-preview,oklch(92% .008 250));overflow-anchor:none}.dpb-paper-list{position:relative;width:max-content;min-width:100%;margin-inline:auto}.dpb-page{position:absolute;background:oklch(99.7% .001 250);box-shadow:0 1px 5px oklch(20% .01 250/.15);overflow:hidden}.dpb-canvas{position:absolute;inset:0}.dpb-canvas canvas{display:block;width:100%;height:100%}.dpb-text{position:absolute;inset:0;overflow:clip}.dpb-status{padding:24px;display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:10px;flex:1;color:var(--dpb-muted)}.dpb-status p{width:100%;text-align:center;overflow-wrap:anywhere}.dpb-status button{border-color:var(--dpb-border)}.dpb-notice{display:flex;justify-content:space-between;align-items:center;padding:6px 10px;color:var(--dpb-muted);border-bottom:1px solid var(--dpb-border);overflow-wrap:anywhere}.dpb-page-error{position:absolute;inset:0;padding:20px;color:var(--dpb-muted)}\n@media(prefers-color-scheme:dark){.dpb-root{--dpb-bg:var(--dsw-alias-bg-primary,oklch(24% .012 250));--dpb-label:var(--dsw-alias-label-primary,oklch(91% .006 250));--dpb-muted:var(--dsw-alias-label-secondary,oklch(70% .012 250));--dpb-border:var(--dsw-alias-border-primary,oklch(37% .014 250))}.dpb-scroll{background:var(--dsw-alias-bg-document-preview,oklch(18% .01 250))}}\n.dpb-resume{color:var(--dpb-label);background:color-mix(in oklch,var(--dpb-accent) 9%,transparent)}\n';

// src/viewer.js
var h = import_react.default.createElement;
var GAP = 12;
var PAD = 12;
var CACHE = 8;
var describe = (error) => error instanceof Error ? error.message : String(error);
var renderDensity = () => Math.min(window.devicePixelRatio || 1, 2);
function Button({ children, title, ...props }) {
  return h("button", { type: "button", title, ...props }, children);
}
async function readSizes(document2, signal, onProgress) {
  const total = document2.numPages, sample = total > 2e3, limit = sample ? Math.min(32, total) : total;
  const sizes = [];
  for (let start = 1; start <= limit; start += 32) {
    signal.throwIfAborted();
    const end = Math.min(start + 31, limit);
    const batch = [];
    for (let page = start; page <= end; page++) batch.push(page);
    const measured = await Promise.all(batch.map(async (page) => {
      try {
        const proxy = await document2.getPage(page);
        const viewport = proxy.getViewport({ scale: 96 / 72 });
        proxy.cleanup();
        return { width: viewport.width, height: viewport.height };
      } catch (error) {
        return null;
      }
    }));
    for (const view of measured) {
      if (view) sizes.push(view);
      else if (sizes.length) sizes.push({ ...sizes[sizes.length - 1] });
      else throw new Error("\u65E0\u6CD5\u8BFB\u53D6\u9875\u9762\u5C3A\u5BF8");
    }
    if (end < limit) onProgress?.(end, total);
  }
  if (sample) {
    const width = fitBasisWidth(sizes);
    const height = sizes.find((size) => Math.round(size.width * 10) / 10 === Math.round(width * 10) / 10)?.height || sizes[0].height;
    while (sizes.length < total) sizes.push({ width, height });
  }
  return { sizes, prepared: limit };
}
function createViewer(loadEngine, fallback) {
  class Boundary extends import_react.default.Component {
    state = { failed: false };
    static getDerivedStateFromError() {
      return { failed: true };
    }
    componentDidCatch(error) {
      console.warn("[dsh-pdf-bookmarks] \u9884\u89C8\u5DF2\u9694\u79BB", error);
    }
    render() {
      return this.state.failed ? h("div", { className: "dpb-status", role: "alert" }, "\u589E\u5F3A\u9884\u89C8\u6682\u4E0D\u53EF\u7528\u3002", h(Button, { onClick: fallback }, "\u4F7F\u7528\u5185\u7F6E PDF \u9884\u89C8")) : this.props.children;
    }
  }
  return function SafeViewer(props) {
    return h(Boundary, { key: props.resourceAddress }, h(Viewer, { ...props, loadEngine, fallback }));
  };
}
function createRenderer({ engine, pdf, ownerDocument, textClass }) {
  const entries = /* @__PURE__ */ new Map(), queue = /* @__PURE__ */ new Map();
  let clock = 0, running = false, active = null, disposed = false, focus = 1, textChain = Promise.resolve();
  const ensure = (page) => {
    let entry = entries.get(page);
    if (!entry) {
      const canvas = ownerDocument.createElement("canvas");
      canvas.className = "dpb-canvas";
      canvas.setAttribute("role", "img");
      canvas.setAttribute("aria-label", `PDF \u7B2C ${page} \u9875`);
      entry = { canvas, bitmap: "", text: null, textKey: "", host: null, used: 0, failure: null };
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
    const node = ownerDocument.createElement("div");
    node.className = "dpb-page-error";
    node.setAttribute("role", "alert");
    node.textContent = `\u6B64\u9875\u6E32\u67D3\u5931\u8D25\uFF1A${describe(error)}`;
    entry.host.root.append(node);
    entry.failure = node;
  };
  const clearFailure = (entry) => {
    entry.failure?.remove();
    entry.failure = null;
  };
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
        await new Promise((resolve) => setTimeout(resolve, 60));
        if (!mounted()) return;
        let proxy;
        try {
          proxy = await pdf.getPage(page);
          if (!mounted()) return;
          const task = engine.pdfTextRenderer(entries.get(page).host.text)(proxy, proxy.getViewport({ scale: 96 / 72 }));
          entries.get(page).text = task;
          await task.promise;
        } catch {
        } finally {
          proxy?.cleanup?.();
        }
      }).catch(() => {
      });
    }
  };
  const draw = async (page, job) => {
    const entry = entries.get(page);
    if (!entry?.host || disposed) return false;
    const controller = new AbortController();
    active = { page, controller };
    try {
      const buffer = ownerDocument.createElement("canvas");
      try {
        await engine.renderPdfPage(pdf, page, buffer, controller.signal, job.ratio, void 0);
        if (disposed || controller.signal.aborted) return false;
        entry.canvas.width = buffer.width;
        entry.canvas.height = buffer.height;
        entry.canvas.getContext("2d").drawImage(buffer, 0, 0);
        entry.canvas.dataset.rendered = job.key;
        clearFailure(entry);
        return true;
      } finally {
        buffer.width = buffer.height = 0;
      }
    } catch (error) {
      if (!controller.signal.aborted) showFailure(entry, error);
      return false;
    } finally {
      active = null;
    }
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
          const score = Math.abs(page - focus), choice = !pick || score < pick.score || score === pick.score && page < pick.page;
          if (choice) pick = { page, job, score };
        }
        queue.delete(pick.page);
        const entry = entries.get(pick.page);
        if (!entry?.host || disposed) continue;
        if (await draw(pick.page, pick.job)) finalize(pick.page, pick.job);
      }
    } finally {
      running = false;
    }
  };
  const enqueue = (page, job) => {
    queue.set(page, job);
    pump();
  };
  return {
    /** 挂载页框：位图仍然匹配就直接复用，否则排队渲染（旧位图保留到新位图就绪，缩放时不会闪白）。 */
    mount(page, hosts, job) {
      const entry = ensure(page);
      entry.host = hosts;
      entry.used = ++clock;
      if (entry.canvas.parentNode !== hosts.canvas) hosts.canvas.append(entry.canvas);
      if (entry.bitmap !== job.key) enqueue(page, job);
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
      entry.textKey = "";
      evict();
    },
    /** 当前页改变（含目录跳转）时重排优先级：远处的排队项直接丢掉、在途渲染中止，避免跳转后被上一屏的渲染拖住。 */
    focus(page) {
      focus = page;
      for (const queued of queue.keys()) if (Math.abs(queued - page) > 3) queue.delete(queued);
      if (active && Math.abs(active.page - page) > 3) active.controller.abort();
    },
    isMounted(page) {
      return Boolean(entries.get(page)?.host);
    },
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
function Viewer({ content, resourceAddress, scrollportRef, useTabInfo, loadEngine, fallback }) {
  const { tab } = useTabInfo();
  const root = (0, import_react.useRef)(null), scroll = (0, import_react.useRef)(null), frame = (0, import_react.useRef)(0);
  const sizes = (0, import_react.useRef)(null), metrics = (0, import_react.useRef)(null), anchor = (0, import_react.useRef)(null), resumeAt = (0, import_react.useRef)(null);
  const progress = (0, import_react.useRef)(null), latest = (0, import_react.useRef)(null), saveTimer = (0, import_react.useRef)(0), restored = (0, import_react.useRef)(false);
  const renderer = (0, import_react.useRef)(null), heightRef = (0, import_react.useRef)(800);
  const [pageRenderer, setPageRenderer] = (0, import_react.useState)(null);
  const [loaded, setLoaded] = (0, import_react.useState)(null), [error, setError] = (0, import_react.useState)(""), [notice, setNotice] = (0, import_react.useState)("");
  const [outline, setOutline] = (0, import_react.useState)(null), [store, setStore] = (0, import_react.useState)(null), [bookmarks, setBookmarks] = (0, import_react.useState)([]);
  const [open, setOpen] = (0, import_react.useState)(true), [section, setSection] = (0, import_react.useState)("outline"), [current, setCurrent] = (0, import_react.useState)(1);
  const [zoom, setZoom] = (0, import_react.useState)("fit"), [fitWidth, setFitWidth] = (0, import_react.useState)(0), [narrow, setNarrow] = (0, import_react.useState)(false);
  const [editing, setEditing] = (0, import_react.useState)(null), [attempt, setAttempt] = (0, import_react.useState)(0), [resume, setResume] = (0, import_react.useState)(null);
  const [tableVersion, setTableVersion] = (0, import_react.useState)(0), [span, setSpan] = (0, import_react.useState)({ first: 0, last: 0 }), [preparing, setPreparing] = (0, import_react.useState)("");
  const bytes = content.kind === "bytes" ? content.data : null;
  const textClass = loaded?.engine?.textClass || "";
  (0, import_react.useEffect)(() => {
    const controller = new AbortController();
    let session;
    const signal = tab?.signal ? AbortSignal.any([controller.signal, tab.signal]) : controller.signal;
    setLoaded(null);
    setOutline(null);
    setStore(null);
    setBookmarks([]);
    setError("");
    setNotice("");
    setCurrent(1);
    setResume(null);
    setPreparing("");
    resumeAt.current = null;
    restored.current = false;
    latest.current = null;
    sizes.current = null;
    anchor.current = null;
    if (bytes) (async () => {
      let engine;
      try {
        engine = await loadEngine();
      } catch (err) {
        console.warn("[dsh-pdf-bookmarks] \u5F15\u64CE\u4E0D\u53EF\u7528\uFF0C\u56DE\u9000\u5185\u7F6E\u9884\u89C8", err);
        if (!signal.aborted) fallback();
        return;
      }
      signal.throwIfAborted();
      session = engine.openPdf(bytes, signal, (err) => {
        if (!signal.aborted) setError("PDF \u6E32\u67D3\u8FDB\u7A0B\u5F02\u5E38\uFF0C\u8BF7\u91CD\u8BD5\u6216\u4F7F\u7528\u5185\u7F6E\u9884\u89C8");
      });
      const keying = documentKey(bytes);
      keying.catch(() => {
      });
      const document2 = await session.document;
      signal.throwIfAborted();
      const table = await readSizes(document2, signal, (done, total) => setPreparing(`\u6B63\u5728\u51C6\u5907\u9875\u9762 ${done} / ${total}`));
      signal.throwIfAborted();
      const key = await keying;
      try {
        progress.current = createProgressStore(window.localStorage, key);
        const saved = progress.current.read();
        if (shouldResume(saved, document2.numPages)) resumeAt.current = saved;
      } catch (err) {
        progress.current = null;
        console.warn("[dsh-pdf-bookmarks] \u9605\u8BFB\u8FDB\u5EA6\u4E0D\u53EF\u7528", err);
      }
      setPreparing("");
      sizes.current = table.sizes;
      setTableVersion((value) => value + 1);
      setLoaded({ document: document2, engine, prepared: table.prepared });
      try {
        const next = createBookmarkStore(window.localStorage, key);
        const saved = next.list();
        if (!signal.aborted) {
          setStore(next);
          setBookmarks(saved);
        }
      } catch (err) {
        if (!signal.aborted) setNotice("\u65E0\u6CD5\u8BFB\u53D6\u672C\u5730\u4E66\u7B7E\uFF0C\u539F\u6570\u636E\u5DF2\u4FDD\u7559\uFF1A" + describe(err));
      }
      try {
        const items = await document2.getOutline();
        if (!signal.aborted) setOutline(items || []);
      } catch (err) {
        if (!signal.aborted) {
          setOutline([]);
          setNotice("\u6587\u6863\u76EE\u5F55\u8BFB\u53D6\u5931\u8D25\uFF0C\u4ECD\u53EF\u4F7F\u7528\u4E2A\u4EBA\u4E66\u7B7E\uFF1A" + describe(err));
        }
      }
    })().catch((err) => {
      if (!signal.aborted) setError(err?.name === "PasswordException" ? "\u6B64 PDF \u9700\u8981\u5BC6\u7801\uFF0C\u8BF7\u4F7F\u7528\u5176\u4ED6\u67E5\u770B\u5668\u6253\u5F00" : describe(err));
    });
    return () => {
      controller.abort();
      session?.dispose();
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
        saveTimer.current = 0;
      }
      if (restored.current && latest.current) try {
        progress.current?.write(latest.current);
      } catch {
      }
    };
  }, [bytes, tab?.signal, attempt, loadEngine, fallback]);
  (0, import_react.useEffect)(() => {
    if (!loaded) return;
    const table = sizes.current, document2 = loaded.document;
    let stopped = false, changed = 0, page = loaded.prepared + 1;
    (async () => {
      while (page <= document2.numPages && !stopped && page > loaded.prepared) {
        const batch = Math.min(page + 32, document2.numPages + 1);
        for (; page < batch && !stopped; page++) {
          const proxy = await document2.getPage(page);
          const viewport = proxy.getViewport({ scale: 96 / 72 });
          if (!renderer.current?.isMounted(page)) proxy.cleanup();
          const target = table[page - 1];
          if (target.width !== viewport.width || target.height !== viewport.height) {
            table[page - 1] = { width: viewport.width, height: viewport.height };
            changed++;
          }
          if (stopped) break;
        }
        if (changed) {
          changed = 0;
          setTableVersion((value) => value + 1);
        }
      }
    })().catch((err) => console.warn("[dsh-pdf-bookmarks] \u9875\u9762\u5C3A\u5BF8\u8BFB\u53D6\u4E2D\u65AD", err));
    return () => {
      stopped = true;
    };
  }, [loaded]);
  (0, import_react.useEffect)(() => {
    const node = root.current;
    if (!node) return;
    const observer = new ResizeObserver(() => setNarrow(node.clientWidth < 640));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  const bindScroll = (0, import_react.useCallback)((node) => {
    scroll.current = node;
    if (typeof scrollportRef === "function") scrollportRef(node);
    else if (scrollportRef) scrollportRef.current = node;
  }, [scrollportRef]);
  (0, import_react.useLayoutEffect)(() => {
    const node = scroll.current;
    if (!node) return;
    const settle = () => setFitWidth(node.clientWidth);
    heightRef.current = node.clientHeight || 800;
    settle();
    if (typeof ResizeObserver !== "undefined") {
      let timer = 0;
      const observer = new ResizeObserver(() => {
        heightRef.current = node.clientHeight || 800;
        clearTimeout(timer);
        timer = setTimeout(() => {
          if (node.isConnected) {
            settle();
            sync();
          }
        }, 120);
      });
      observer.observe(node);
      return () => {
        observer.disconnect();
        clearTimeout(timer);
      };
    }
  }, [loaded, open, narrow]);
  (0, import_react.useEffect)(() => () => cancelAnimationFrame(frame.current), []);
  const scale = (0, import_react.useMemo)(() => {
    if (!sizes.current?.length) return 1;
    return zoom === "fit" ? Math.max(0.1, ((fitWidth || 600) - 24) / fitBasisWidth(sizes.current)) : Number(zoom);
  }, [zoom, fitWidth, tableVersion]);
  const layout = (0, import_react.useMemo)(() => sizes.current ? buildMetrics(sizes.current, scale, GAP, PAD) : null, [scale, tableVersion]);
  const persist = (0, import_react.useCallback)((position) => {
    if (!progress.current || !restored.current || !position) return;
    try {
      progress.current.write(position);
    } catch (err) {
      console.warn("[dsh-pdf-bookmarks] \u9605\u8BFB\u8FDB\u5EA6\u4FDD\u5B58\u5931\u8D25", err);
      progress.current = null;
    }
  }, []);
  const scheduleSave = (0, import_react.useCallback)((position) => {
    latest.current = position;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveTimer.current = 0;
      persist(latest.current);
    }, 600);
  }, [persist]);
  const sync = (0, import_react.useCallback)(() => {
    const node = scroll.current, table = metrics.current;
    if (!node || !table) return;
    const top = node.scrollTop, height = node.clientHeight || heightRef.current;
    const range = visibleRange(table.tops, table.heights, top, height, height);
    const position = positionAt(table.tops, table.heights, top);
    anchor.current = position;
    setSpan((previous) => previous.first === range.first && previous.last === range.last ? previous : range);
    setCurrent((previous) => previous === position.page ? previous : position.page);
    if (restored.current) scheduleSave(position);
  }, [scheduleSave]);
  (0, import_react.useLayoutEffect)(() => {
    const node = scroll.current, previous = metrics.current;
    metrics.current = layout;
    if (!node || !layout) return;
    const position = anchor.current;
    if (previous && previous !== layout && position) node.scrollTop = landing(layout, position);
    sync();
  }, [layout, sync]);
  const onScroll = (0, import_react.useCallback)(() => {
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(sync);
  }, [sync]);
  (0, import_react.useEffect)(() => {
    if (!loaded) return;
    const instance = createRenderer({ engine: loaded.engine, pdf: loaded.document, ownerDocument: window.document });
    renderer.current = instance;
    setPageRenderer(instance);
    return () => {
      instance.dispose();
      renderer.current = null;
      setPageRenderer(null);
    };
  }, [loaded]);
  const jump = (0, import_react.useCallback)((position, close = true) => {
    const node = scroll.current, table = metrics.current;
    if (!node || !table) return;
    if (!Number.isInteger(position.page) || position.page < 1 || position.page > table.count) {
      setNotice("\u4E66\u7B7E\u76EE\u6807\u8D85\u51FA\u5F53\u524D\u6587\u6863\u9875\u6570");
      return;
    }
    const index = position.page - 1;
    node.scrollTop = landing(table, position);
    setCurrent(position.page);
    sync();
    if (close && narrow) setOpen(false);
  }, [narrow, sync]);
  (0, import_react.useEffect)(() => {
    if (!loaded || !layout || restored.current) return;
    if (!resumeAt.current) {
      restored.current = true;
      return;
    }
    const position = resumeAt.current;
    resumeAt.current = null;
    jump(position, false);
    restored.current = true;
    latest.current = position;
    setResume({ page: position.page });
  }, [loaded, layout, jump]);
  (0, import_react.useEffect)(() => {
    renderer.current?.focus(current);
  }, [current, pageRenderer]);
  (0, import_react.useEffect)(() => {
    const flush = () => {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
        saveTimer.current = 0;
      }
      if (restored.current && latest.current) persist(latest.current);
    };
    const hidden = () => {
      if (document.visibilityState === "hidden") flush();
    };
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", hidden);
    return () => {
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", hidden);
      flush();
    };
  }, [persist]);
  const visit = async (destination) => {
    try {
      setResume(null);
      jump(await resolveDestination(loaded.document, destination));
      setNotice("");
    } catch (err) {
      setNotice(describe(err));
    }
  };
  const mutate = (operation) => {
    try {
      operation();
      setBookmarks(store.list());
      setNotice("");
    } catch (err) {
      setNotice("\u4E66\u7B7E\u672A\u4FDD\u5B58\uFF1A" + describe(err));
    }
  };
  const add = () => {
    if (!store) return;
    mutate(() => {
      const position = anchor.current || { page: 1, offset: 0 };
      const item = store.add({ ...position, label: `\u7B2C ${position.page} \u9875` });
      setEditing(item.id);
      setSection("mine");
      setOpen(true);
    });
  };
  const refresh = () => {
    try {
      setBookmarks(store.list());
    } catch (err) {
      setNotice("\u4E66\u7B7E\u8BFB\u53D6\u5931\u8D25\uFF1A" + describe(err));
    }
  };
  const restart = () => {
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
      saveTimer.current = 0;
    }
    try {
      progress.current?.clear();
    } catch {
    }
    setResume(null);
    restored.current = true;
    latest.current = { page: 1, offset: 0 };
    jump({ page: 1, offset: 0 }, false);
  };
  (0, import_react.useEffect)(() => {
    if (!store) return;
    window.addEventListener("storage", refresh);
    return () => window.removeEventListener("storage", refresh);
  }, [store]);
  const ratio = scale * renderDensity();
  const sheets = [];
  if (layout) {
    const pageWidth = Math.max(layout.width + PAD * 2, fitWidth || 0);
    for (let page = span.first + 1; page <= span.last + 1; page++) {
      const index = page - 1;
      sheets.push(h(Sheet, { key: page, renderer: pageRenderer, page, top: layout.tops[index], left: (pageWidth - layout.widths[index]) / 2, width: layout.widths[index], height: layout.heights[index], ratio, textClass }));
    }
  }
  return h(
    "div",
    { className: "dpb-root", ref: root, "data-pdf-bookmarks": true },
    h("style", null, viewer_default),
    h(
      "div",
      { className: "dpb-toolbar", role: "toolbar", "aria-label": "PDF \u9605\u8BFB\u5DE5\u5177" },
      h(Button, { "aria-expanded": open, "aria-label": "\u5207\u6362\u4E66\u7B7E\u5BFC\u822A", onClick: () => setOpen(!open), title: "\u76EE\u5F55\u548C\u4E66\u7B7E" }, "\u2630"),
      h("span", { className: "dpb-pages" }, loaded ? h("input", { "aria-label": "\u5F53\u524D\u9875", type: "number", min: 1, max: loaded.document.numPages, value: current, onChange: (event) => {
        const page = Number(event.target.value);
        if (page >= 1 && page <= loaded.document.numPages) {
          setResume(null);
          jump({ page, offset: 0 }, false);
        }
      } }) : "\u2026", loaded && ` / ${loaded.document.numPages}`),
      h("span", { className: "dpb-spacer" }),
      h("select", { "aria-label": "\u7F29\u653E\u6BD4\u4F8B", value: zoom, onChange: (event) => setZoom(event.target.value) }, h("option", { value: "fit" }, "\u9002\u5E94\u5BBD\u5EA6"), ...[0.5, 0.75, 1, 1.25, 1.5, 2].map((value) => h("option", { key: value, value }, `${value * 100}%`))),
      h(Button, { onClick: add, disabled: !store, "aria-label": "\u6DFB\u52A0\u5F53\u524D\u9605\u8BFB\u4F4D\u7F6E\u4E3A\u4E66\u7B7E", title: "\u6DFB\u52A0\u4E66\u7B7E" }, "\u2606 \u4E66\u7B7E")
    ),
    notice && h("div", { className: "dpb-notice", role: "status" }, notice, h(Button, { onClick: () => setNotice(""), "aria-label": "\u5173\u95ED\u63D0\u793A" }, "\xD7")),
    resume && h("div", { className: "dpb-notice dpb-resume", role: "status" }, `\u5DF2\u56DE\u5230\u4E0A\u6B21\u9605\u8BFB\u4F4D\u7F6E\uFF1A\u7B2C ${resume.page} \u9875`, h(Button, { onClick: restart }, "\u56DE\u5230\u5F00\u5934"), h(Button, { onClick: () => setResume(null), "aria-label": "\u5173\u95ED\u7EED\u8BFB\u63D0\u793A" }, "\xD7")),
    error ? h("div", { className: "dpb-status", role: "alert" }, h("p", null, error), h(Button, { onClick: () => setAttempt(attempt + 1) }, "\u91CD\u8BD5"), h(Button, { onClick: fallback }, "\u4F7F\u7528\u5185\u7F6E PDF \u9884\u89C8")) : !layout ? h("div", { className: "dpb-status", role: "status" }, preparing || "\u6B63\u5728\u6253\u5F00 PDF\u2026") : h(
      "div",
      { className: "dpb-content" + (narrow ? " dpb-narrow" : "") },
      open && h(
        "nav",
        { className: "dpb-nav", "aria-label": "PDF \u4E66\u7B7E\u5BFC\u822A" },
        h(
          "div",
          { className: "dpb-tabs", role: "tablist", "aria-label": "\u5BFC\u822A\u7C7B\u578B" },
          h(Button, { role: "tab", "aria-selected": section === "outline", onClick: () => setSection("outline") }, "\u6587\u6863\u76EE\u5F55"),
          h(Button, { role: "tab", "aria-selected": section === "mine", onClick: () => setSection("mine") }, "\u6211\u7684\u4E66\u7B7E")
        ),
        h("div", { className: "dpb-nav-body" }, section === "outline" ? outline === null ? h("p", { className: "dpb-empty" }, "\u6B63\u5728\u8BFB\u53D6\u76EE\u5F55\u2026") : outline.length ? h(Outline, { items: outline, visit }) : h("p", { className: "dpb-empty" }, "\u6B64 PDF \u6CA1\u6709\u5185\u7F6E\u76EE\u5F55\u3002\u53EF\u5728\u201C\u6211\u7684\u4E66\u7B7E\u201D\u4E2D\u6DFB\u52A0\u9605\u8BFB\u4F4D\u7F6E\u3002") : bookmarks.length ? h("ul", { className: "dpb-bookmarks" }, bookmarks.map((item) => h("li", { key: item.id }, editing === item.id ? h(BookmarkName, { item, save: (label) => {
          mutate(() => store.rename(item.id, label));
          setEditing(null);
        }, cancel: () => setEditing(null) }) : h(
          import_react.default.Fragment,
          null,
          h(Button, { className: "dpb-bookmark-link", onClick: () => {
            setResume(null);
            jump(item);
          }, title: item.label }, h("span", null, item.label), h("small", null, `\u7B2C ${item.page} \u9875`)),
          h(Button, { "aria-label": `\u91CD\u547D\u540D\u4E66\u7B7E ${item.label}`, onClick: () => setEditing(item.id), title: "\u91CD\u547D\u540D" }, "\u270E"),
          h(Button, { "aria-label": `\u5220\u9664\u4E66\u7B7E ${item.label}`, onClick: () => mutate(() => store.remove(item.id)), title: "\u5220\u9664" }, "\xD7")
        )))) : h("p", { className: "dpb-empty" }, store ? "\u8FD8\u6CA1\u6709\u9605\u8BFB\u4E66\u7B7E\u3002\u70B9\u51FB\u5DE5\u5177\u680F\u201C\u2606 \u4E66\u7B7E\u201D\u6536\u85CF\u5F53\u524D\u4F4D\u7F6E\u3002" : "\u672C\u5730\u4E66\u7B7E\u6682\u4E0D\u53EF\u7528\uFF0C\u4ECD\u53EF\u9605\u8BFB\u6587\u6863\u548C\u4F7F\u7528\u76EE\u5F55\u3002")),
        h("div", { className: "dpb-nav-footer" }, "\u4E66\u7B7E\u4FDD\u5B58\u5728\u672C\u673A\uFF0CPDF \u539F\u6587\u4EF6\u4E0D\u53D8")
      ),
      h(
        "div",
        { className: "dpb-scroll", ref: bindScroll, onScroll, onWheel: () => {
        }, "aria-label": "PDF \u6587\u6863\u9875\u9762", tabIndex: 0 },
        h("div", { className: "dpb-paper-list", style: { height: layout.total, width: Math.max(layout.width + PAD * 2, fitWidth || 0) } }, sheets)
      )
    )
  );
}
function Outline({ items, visit }) {
  return h("ul", { className: "dpb-outline" }, items.map((item, index) => h(OutlineItem, { key: index, item, visit })));
}
function OutlineItem({ item, visit }) {
  const [expanded, setExpanded] = (0, import_react.useState)(true), children = item.items?.length > 0;
  return h(
    "li",
    null,
    h(
      "div",
      { className: "dpb-outline-row" },
      children ? h(Button, { "aria-label": `${expanded ? "\u6536\u8D77" : "\u5C55\u5F00"} ${item.title}`, "aria-expanded": expanded, onClick: () => setExpanded(!expanded) }, expanded ? "\u2304" : "\u203A") : h("span", { className: "dpb-tree-spacer" }),
      h(Button, { className: "dpb-outline-link", disabled: !item.dest, title: item.dest ? item.title : "\u6B64\u9879\u6CA1\u6709\u6587\u6863\u5185\u8DF3\u8F6C\u76EE\u6807", onClick: () => visit(item.dest) }, item.title || "\u672A\u547D\u540D\u7AE0\u8282")
    ),
    children && expanded && h(Outline, { items: item.items, visit })
  );
}
function BookmarkName({ item, save, cancel }) {
  const [value, setValue] = (0, import_react.useState)(item.label), input = (0, import_react.useRef)(null);
  (0, import_react.useEffect)(() => {
    input.current?.focus();
    input.current?.select();
  }, []);
  return h(
    "form",
    { className: "dpb-name", onSubmit: (event) => {
      event.preventDefault();
      if (value.trim()) save(value);
    } },
    h("input", { ref: input, "aria-label": "\u4E66\u7B7E\u540D\u79F0", value, maxLength: 200, onChange: (event) => setValue(event.target.value), onKeyDown: (event) => {
      if (event.key === "Escape") cancel();
    } }),
    h(Button, { type: "submit", disabled: !value.trim() }, "\u4FDD\u5B58"),
    h(Button, { onClick: cancel, "aria-label": "\u53D6\u6D88\u4FEE\u6539\u4E66\u7B7E" }, "\u53D6\u6D88")
  );
}
function landing(table, position) {
  const index = position.page - 1;
  const offset = Math.max(0, Math.min(1, position.offset || 0));
  if (index === 0 && offset === 0) return 0;
  return Math.max(0, Math.ceil(table.tops[index] + table.heights[index] * offset));
}
function Sheet({ renderer, page, top, left, width, height, ratio, textClass }) {
  const root = (0, import_react.useRef)(null), canvas = (0, import_react.useRef)(null), text = (0, import_react.useRef)(null);
  (0, import_react.useLayoutEffect)(() => {
    if (!renderer) return;
    renderer.mount(page, { root: root.current, canvas: canvas.current, text: text.current }, { key: String(ratio), ratio });
    return () => renderer.unmount(page);
  }, [renderer, page, ratio]);
  return h(
    "section",
    { ref: root, className: "dpb-page", "data-bookmark-page": page, style: { top, left, width, height }, "aria-label": `\u7B2C ${page} \u9875` },
    h("div", { ref: canvas, className: "dpb-canvas" }),
    h("div", { ref: text, className: `dpb-text ${textClass}` })
  );
}

// src/client.js
var inject = ["slots", "documentPreviews"];
function apply(ctx, loadEngine) {
  let removeDefinition, removeSlot;
  const fallback = () => {
    const cleanups = [removeDefinition, removeSlot];
    removeDefinition = removeSlot = void 0;
    for (const cleanup of cleanups) try {
      cleanup?.();
    } catch (error) {
      console.warn("[dsh-pdf-bookmarks] \u56DE\u9000\u5931\u8D25", error);
    }
  };
  try {
    if (typeof ctx?.effect !== "function" || typeof ctx.slots?.inject !== "function" || typeof ctx.slots?.register !== "function" || typeof ctx.documentPreviews?.register !== "function") throw new Error("\u7F3A\u5C11 PDF \u9884\u89C8\u6240\u9700\u63A5\u53E3");
    const Viewer2 = createViewer(loadEngine, fallback);
    ctx.effect(() => ctx.slots.inject("sidebar.right.tab.document", function* () {
      try {
        removeSlot = ctx.slots.register({ name: "sidebar.right.tab.document", key: "dsh-pdf-bookmarks/pdf" }, Viewer2);
        removeDefinition = ctx.documentPreviews.register({ id: "dsh-pdf-bookmarks/pdf", extensions: ["pdf"], binaryExtensions: ["pdf"], priority: "extension", title: () => "PDF \u4E66\u7B7E", loading: "bytes-complete", wrap: false });
        yield fallback;
      } catch (error) {
        fallback();
        console.warn("[dsh-pdf-bookmarks] \u63A5\u53E3\u4E0D\u9002\u914D\uFF0C\u4FDD\u7559\u5185\u7F6E\u9884\u89C8", error);
      }
    }));
  } catch (error) {
    fallback();
    console.warn("[dsh-pdf-bookmarks] \u63D2\u4EF6\u672A\u542F\u7528\uFF0C\u4FDD\u7559\u5185\u7F6E\u9884\u89C8", error);
  }
}

const plugin=module.exports;return {inject:plugin.inject,apply:ctx=>plugin.apply(ctx,()=>require.async('./client.engine.js'))};} catch(error){console.warn('[dsh-pdf-bookmarks] client disabled',error);return {apply(){}};}}}); } catch(error) { console.warn('[dsh-pdf-bookmarks] module registration skipped',error); }

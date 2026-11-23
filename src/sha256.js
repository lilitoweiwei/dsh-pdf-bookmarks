/**
 * 纯 JS 的 SHA-256。
 *
 * 存在的理由：`crypto.subtle` 只在“安全上下文”（https、localhost、file）里才有，
 * 通过 http 域名访问 DSH（如 `http://dshu:3080`）时它是 undefined，直接调用会抛
 * `Cannot read properties of undefined (reading 'digest')`。
 * 书签与续读的键是文档内容的 SHA-256，这里给出逐字节相同的降级实现：
 * 两种环境算出的键一致，已有数据不需要迁移。
 *
 * 实现是增量式的：`update()` 接受任意长度的分片，`digestHex()` 输出小写十六进制。
 */

const K = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
]);

export function createSha256() {
  let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a;
  let h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;
  const w = new Uint32Array(64);
  const tail = new Uint8Array(64);
  let tailLen = 0, total = 0, closed = false;

  function compress(src, off) {
    for (let i = 0; i < 16; i++) {
      const j = off + (i << 2);
      w[i] = ((src[j] << 24) | (src[j + 1] << 16) | (src[j + 2] << 8) | src[j + 3]) >>> 0;
    }
    for (let i = 16; i < 64; i++) {
      const x = w[i - 15], y = w[i - 2];
      const s0 = ((x >>> 7) | (x << 25)) ^ ((x >>> 18) | (x << 14)) ^ (x >>> 3);
      const s1 = ((y >>> 17) | (y << 15)) ^ ((y >>> 19) | (y << 13)) ^ (y >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }
    let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;
    for (let i = 0; i < 64; i++) {
      const S1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
      const ch = (e & f) ^ (~e & g);
      const t1 = (h + S1 + ch + K[i] + w[i]) >>> 0;
      const S0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (S0 + maj) >>> 0;
      h = g; g = f; f = e; e = (d + t1) >>> 0;
      d = c; c = b; b = a; a = (t1 + t2) >>> 0;
    }
    h0 = (h0 + a) >>> 0; h1 = (h1 + b) >>> 0; h2 = (h2 + c) >>> 0; h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0; h5 = (h5 + f) >>> 0; h6 = (h6 + g) >>> 0; h7 = (h7 + h) >>> 0;
  }

  return {
    update(data) {
      if (closed) throw new Error('SHA-256 已结束，不能继续写入');
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
      if (closed) throw new Error('SHA-256 已经计算过');
      const bits = total * 8;
      const padLen = tailLen < 56 ? 64 - tailLen : 128 - tailLen;
      const pad = new Uint8Array(padLen);
      pad[0] = 0x80;
      const view = new DataView(pad.buffer);
      view.setUint32(padLen - 8, Math.floor(bits / 0x100000000));
      view.setUint32(padLen - 4, bits >>> 0);
      // 直接补块压缩，不走 update：补齐字节不计入 total
      let i = 0;
      if (tailLen > 0) {
        i = 64 - tailLen;
        tail.set(pad.subarray(0, i), tailLen);
        compress(tail, 0);
        tailLen = 0;
      }
      for (; i + 64 <= padLen; i += 64) compress(pad, i);
      if (i !== padLen) throw new Error('SHA-256 补齐失败');
      closed = true;
      let out = '';
      for (const h of [h0, h1, h2, h3, h4, h5, h6, h7]) out += h.toString(16).padStart(8, '0');
      return out;
    },
  };
}

/** 同步算完：适合小输入或已经在后台线程里的场合。 */
export function sha256Hex(bytes) {
  return createSha256().update(bytes).digestHex();
}

/** 让出主线程一次（MessageChannel 没有 setTimeout 的 4 ms 下限，也不依赖 rAF 是否可见）。 */
function yieldTask() {
  if (typeof MessageChannel === 'function') {
    return new Promise(resolve => {
      const channel = new MessageChannel();
      channel.port1.onmessage = () => { channel.port1.close(); resolve(); };
      channel.port2.postMessage(0);
    });
  }
  return new Promise(resolve => setTimeout(resolve, 0));
}

/**
 * 分片计算的版本：每片算完让出一次主线程，27 MB 的文档也不会把界面卡住。
 * `byteOffset / byteLength` 用于只取 `bytes` 的一段（测试与调用方都可以用）。
 */
export async function sha256HexChunked(bytes, {chunkSize = 262144, slice = null} = {}) {
  const view = slice ? bytes.subarray(slice.start ?? 0, slice.end ?? bytes.length) : bytes;
  const hash = createSha256();
  if (view.length <= chunkSize * 2) return hash.update(view).digestHex();
  for (let offset = 0; offset < view.length; offset += chunkSize) {
    hash.update(view.subarray(offset, Math.min(offset + chunkSize, view.length)));
    if (offset + chunkSize < view.length) await yieldTask();
  }
  return hash.digestHex();
}

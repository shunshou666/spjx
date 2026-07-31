// ============================================================
//  一、长视频/VIP 解析线路（爱奇艺、腾讯、优酷、芒果TV等）
// ============================================================
const VIP_PARSE_APIS = [
    { name: '线路1', url: 'http://quanminjiexi.com/jx/?url=', priority: 1, timeout: 8000 },
    { name: '线路2', url: 'https://jx.playerjy.com/?url=', priority: 2, timeout: 8000 },
    { name: '线路3', url: 'http://player.cmov.cn/?url=', priority: 3, timeout: 8000 },
    { name: '线路4', url: 'https://jx.aidouer.net/?url=', priority: 4, timeout: 8000 },
    { name: '线路5', url: 'https://jx.nnxv.cn/tv.php?url=', priority: 5, timeout: 8000 },
    { name: '线路6', url: 'https://jx.xmflv.com/?url=', priority: 6, timeout: 8000 },
    { name: '线路7', url: 'https://jx.xmflv.cc/?url=', priority: 7, timeout: 8000 },
    { name: '线路8', url: 'https://www.pouyun.com/?url=', priority: 8, timeout: 8000 },
    { name: '线路9', url: 'https://jx.77flv.cc/?url=', priority: 9, timeout: 8000 },
    { name: '线路10', url: 'https://jx.dmflv.cc/?url=', priority: 10, timeout: 8000 },
    { name: '线路11', url: 'https://jx.xymp4.cc/?url=', priority: 11, timeout: 8000 },
    { name: '线路12', url: 'https://jx.mmkv.cn/tv.php?url=', priority: 12, timeout: 8000 },
    { name: '线路13', url: 'https://z1.m1907.top/?jx=', priority: 13, timeout: 8000 },
    { name: '线路14', url: 'https://jx.789jiexi.com/?url=', priority: 14, timeout: 8000 },
    { name: '线路15', url: 'https://jx.hls.one/?url=', priority: 15, timeout: 8000 },
    { name: '线路16', url: 'https://jx.2s0.cn/player/?url=', priority: 16, timeout: 8000 },
    { name: 'aikan-tv解析', url: 'http://aikan-tv.com/?url=', priority: 17, timeout: 8000 },
    { name: 'kx28解析', url: 'http://kx28.com/vip/index.php?url=', priority: 18, timeout: 8000 },
    { name: 'bbbbbb解析', url: 'http://api.bbbbbb.me/vip/?url=', priority: 19, timeout: 8000 },
    { name: 'V2OB解析', url: 'https://www.v2ob.com/?url=', priority: 20, timeout: 8000 },
    { name: '163ren解析', url: 'http://jx.api.163ren.com/vod.php?url=', priority: 21, timeout: 8000 },
    { name: '月亮解析', url: 'https://api.yueliangjx.com/?url=', priority: 22, timeout: 8000 },
    { name: '91exp解析', url: 'http://api.91exp.com/svip/?url=', priority: 23, timeout: 8000 },
    { name: '618g解析', url: 'https://jx.618g.com/?url=', priority: 24, timeout: 8000 },
    { name: '82190555解析', url: 'http://www.82190555.com/index/qqvod.php?url=', priority: 25, timeout: 8000 },
    { name: '夜幕解析', url: 'https://www.yemu.xyz/?url=', priority: 26, timeout: 8000 },
    { name: '东城解析', url: 'https://www.dcvip8.com/?url=', priority: 27, timeout: 8000 },
    { name: '① 电视剧解析(有广告)', url: '//jx.jsonplayer.com/player/?url=', priority: 28, timeout: 8000 },
    { name: '② 电影解析(有广告)', url: '//jx.playerjy.com/?ads=0&url=', priority: 29, timeout: 8000 },
    { name: '④ 智能解析(备用)', url: '//z1.m1907.cn/?jx=', priority: 30, timeout: 8000 },
    { name: '蓝光解析(直解)', url: '//llq.tyhua.top/?url=', priority: 31, timeout: 8000 },
    { name: '优酷解析(备用)', url: '//www.daga.cc/vip2/?url=', priority: 32, timeout: 8000 },
    { name: '爱奇艺解析(备用)', url: '//www.daga.cc/vip3/?url=', priority: 33, timeout: 8000 },
    { name: '好莱坞解析(备用)', url: '//player.mrgaocloud.com/player/?url=', priority: 34, timeout: 8000 },
];

// ============================================================
//  二、短视频解析 API（抖音、快手、小红书、B站等无水印）
// ============================================================
const SHORT_VIDEO_APIS = [
  { name: '米人API', url: 'http://api.mir6.com/?url=', method: 'GET', priority: 1, timeout: 8000, responseType: 'json' },
  { name: '17zhiling解析', url: 'https://api.17zhiling.com/api/video/parse-video-url?url=', method: 'GET', priority: 2, timeout: 8000, responseType: 'json' },
  { name: 'zhuceka解析', url: 'https://api.zhuceka.cn/home/api?url=', method: 'GET', priority: 3, timeout: 8000, responseType: 'json' },
  { name: 'istero抖音解析', url: 'https://api.istero.com/resource/v1/douyin/video/analysis?url=', method: 'GET', priority: 4, timeout: 8000, responseType: 'json' },
  { name: 'qyapi去水印', url: 'https://qyapi.ipaybuy.cn?url=', method: 'GET', priority: 5, timeout: 8000, responseType: 'json' },
  { name: '江湖聚合API', url: 'https://api.svipk.com/api/video/?url=', method: 'GET', priority: 6, timeout: 8000, responseType: 'json' },
  { name: 'V2OB解析API', url: 'https://www.v2ob.com/api?url=', method: 'GET', priority: 7, timeout: 8000, responseType: 'json' },
  { name: 'nobbB站API', url: 'https://api.nobb.cc/bili_video/?url=', method: 'GET', priority: 8, timeout: 8000, responseType: 'json' },
  { name: 'qqlykm解析', url: 'https://qqlykm.cn/api?url=', method: 'GET', priority: 9, timeout: 8000, responseType: 'json' },
  { name: 'obtaindown解析', url: 'https://api.obtaindown.com/obApi/api/analysis?url=', method: 'POST', priority: 10, timeout: 8000, responseType: 'json' },
  { name: 'easydown解析', url: 'https://api.easydown.org/api/v1/parse?url=', method: 'POST', priority: 11, timeout: 8000, responseType: 'json' },
  { name: 'Litchi AI解析', url: 'https://api.litchi-ai.com/api/video/parse?url=', method: 'POST', priority: 12, timeout: 8000, responseType: 'json' },
];

// ============================================================
//  三、B站专属解析配置
// ============================================================
const BILI_API = {
  name: 'nobb.cc B站解析',
  baseUrl: 'https://api.nobb.cc/bili_video/',
  params: { otype: 'json' },
};
const BILI_QUALITY_OPTIONS = [
  { label: '超清 1080P+', value: '112' },
  { label: '高清 1080P', value: '80' },
  { label: '高清 720P', value: '64' },
  { label: '清晰 480P', value: '32' },
  { label: '流畅 360P', value: '16' },
];

// ============================================================
//  通用解析结果
// ============================================================
class ParseResult {
  constructor({ success, url, title, platform, responseTime, error }) {
    this.success = success;
    this.url = url;
    this.title = title;
    this.platform = platform;
    this.responseTime = responseTime;
    this.error = error;
  }
}

// ============================================================
//  工具：补齐协议头
// ============================================================
function resolveUrl(url) {
  if (url.startsWith('//')) return 'https:' + url;
  return url;
}

function isValidVideoUrl(str) {
  if (!str || typeof str !== 'string') return false;
  try {
    const u = new URL(str);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

// 常见短视频 API 返回的视频 URL 字段名
const VIDEO_URL_KEYS = ['url', 'video_url', 'videoUrl', 'play_url', 'playUrl', 'link', 'src', 'source'];

// 短视频 API 可能返回"时长"的字段名（单位秒 / 毫秒 混合，统一转秒）
const VIDEO_DURATION_KEYS = ['duration', 'time', 'length', 'vtime', 'play_time', 'video_time', 'size'];

// 从 JSON 对象中递归提取第一个视频 URL
function extractVideoUrlFromJson(obj, depth = 0) {
  if (depth > 5 || !obj || typeof obj !== 'object') return null;
  if (Array.isArray(obj)) {
    for (const item of obj) {
      const found = extractVideoUrlFromJson(item, depth + 1);
      if (found) return found;
    }
    return null;
  }
  for (const key of VIDEO_URL_KEYS) {
    const val = obj[key];
    if (typeof val === 'string' && isValidVideoUrl(val)) return val;
  }
  for (const key of Object.keys(obj)) {
    const found = extractVideoUrlFromJson(obj[key], depth + 1);
    if (found) return found;
  }
  return null;
}

// 从 JSON 对象中递归提取"时长"（秒）
function extractDurationFromJson(obj, depth = 0) {
  if (depth > 5 || !obj || typeof obj !== 'object') return null;
  if (Array.isArray(obj)) {
    for (const item of obj) {
      const found = extractDurationFromJson(item, depth + 1);
      if (found) return found;
    }
    return null;
  }
  for (const key of VIDEO_DURATION_KEYS) {
    const val = obj[key];
    if (typeof val === 'number' && val > 0) {
      // 大于 100000 视为毫秒
      return val > 100000 ? Math.round(val / 1000) : Math.round(val);
    }
    if (typeof val === 'string') {
      const n = parseFloat(val);
      if (!isNaN(n) && n > 0) return val > 100000 ? Math.round(n / 1000) : Math.round(n);
    }
  }
  for (const key of Object.keys(obj)) {
    const found = extractDurationFromJson(obj[key], depth + 1);
    if (found) return found;
  }
  return null;
}

// HTML 页面中的视频特征关键词
const VIDEO_INDICATORS = [
  { pattern: /<video[^>]+src\s*=/i, label: 'video element' },
  { pattern: /\.m3u8(?:\?|$|")/i, label: 'm3u8 stream' },
  { pattern: /\.mp4(?:\?|$|")/i, label: 'mp4 file' },
  { pattern: /\b(dplayer|ckplayer|videojs|flowplayer|jwplayer|plyr)\b/i, label: 'video player' },
  { pattern: /playerConfig|player_config|playReady/i, label: 'player config' },
  { pattern: /["'](?:video|play|vod)\/[^"']+["']/i, label: 'video path' },
  { pattern: /source\s+src\s*=/i, label: 'source element' },
];

// 解析页"失败/错误"特征文案（命中即视为解析未成功）
//  仅保留中文解析失败强特征 + HTTP 状态码，避免误杀正常成功页
const PAGE_ERROR_KEYWORDS = [
  '解析失败', '播放失败', '视频不存在', '资源不存在', '无资源', '暂无资源',
  '该视频已被', '版权限制', '地区限制', '接口失效', '解析接口失效', '域名解析失败',
  '连接被拒绝', '服务器 IP 地址', '找不到服务器', 'DNS', '502', '503', '504',
];

// 真实可播放媒体直链后缀（排除图片/封面）
const MEDIA_URL_PATTERN = /https?:\/\/[^\s"'<>()\\]+?\.(?:m3u8|mp4|flv|mkv|webm|ts)(?:\?[^'"<>()\\]*)?/ig;

// 从 HTML 文本中提取所有媒体直链（已去重）
function extractMediaUrls(html) {
  const matches = html.match(MEDIA_URL_PATTERN) || [];
  const seen = new Set();
  const list = [];
  for (const m of matches) {
    const url = m.trim();
    if (seen.has(url)) continue;
    seen.add(url);
    list.push(url);
  }
  return list;
}

// 按"可播放置信度"排序媒体直链：HLS(.m3u8) > 常见视频后缀
function rankMediaUrls(urls) {
  const score = (u) => {
    const low = u.toLowerCase();
    if (low.includes('.m3u8')) return 0;
    if (low.endsWith('.mp4')) return 1;
    if (low.endsWith('.flv') || low.endsWith('.webm')) return 2;
    return 3;
  };
  return urls.slice().sort((a, b) => score(a) - score(b));
}

// 判断两个 URL 是否同源（同 host）
function sameHost(a, b) {
  try { return new URL(a).host === new URL(b).host; }
  catch (_) { return false; }
}

// 从 HTML 中判断是否为"错误/失败"页
function isErrorPage(html, parserUrl) {
  const lower = html.toLowerCase();
  return PAGE_ERROR_KEYWORDS.some(k => lower.includes(k.toLowerCase()));
}

// ============================================================
//  智能路由管理器（分级测试版）
//    第1级：连通性测试（iframe 加载）
//    第2级：内容验证（JSON 解析 / HTML 视频特征检测）
// ============================================================
class SmartRouteManager {
  constructor() {
    this.routeStats = this.loadRouteStats();
    this.testResults = new Map();
    this.abortControllers = new Map();
    this._probeQueue = [];
    this._probeRunning = 0;
    this._MAX_PROBES = 4;
    this._lastRanking = null;
  }

  loadRouteStats() {
    try {
      const stats = localStorage.getItem('routeStats');
      return stats ? JSON.parse(stats) : {};
    } catch (e) {
      return {};
    }
  }

  saveRouteStats() {
    try {
      localStorage.setItem('routeStats', JSON.stringify(this.routeStats));
    } catch (e) { /* ignore */ }
  }

  updateRouteStats(apiUrl, success, responseTime) {
    if (!this.routeStats[apiUrl]) {
      this.routeStats[apiUrl] = {
        successCount: 0, failCount: 0, avgResponseTime: 0, lastUsed: 0, totalTests: 0,
      };
    }
    const s = this.routeStats[apiUrl];
    s.totalTests++;
    s.lastUsed = Date.now();
    if (success) {
      s.successCount++;
      s.avgResponseTime = s.avgResponseTime * (s.successCount - 1) + responseTime;
      s.avgResponseTime /= s.successCount;
    } else {
      s.failCount++;
    }
    this.saveRouteStats();
  }

  getSuccessRate(apiUrl) {
    const s = this.routeStats[apiUrl];
    return s && s.totalTests > 0 ? s.successCount / s.totalTests : 0;
  }

  getSortedRoutes(apis) {
    return apis.slice().sort((a, b) => {
      const aR = this.getSuccessRate(a.url);
      const bR = this.getSuccessRate(b.url);
      if (aR !== bR) return bR - aR;
      const aT = (this.routeStats[a.url] || {}).avgResponseTime || 999999;
      const bT = (this.routeStats[b.url] || {}).avgResponseTime || 999999;
      if (aT !== bT) return aT - bT;
      return (a.priority || 99) - (b.priority || 99);
    });
  }

  // ====================================================================
  //  第1级测试：连通性测试（iframe 快速加载）
  //    externalFrame：传入外部可见 iframe（避免重复加载 / 双 iframe）
  // ====================================================================
  async level1Connectivity(api, videoUrl, timeout, externalFrame = null) {
    const testUrl = resolveUrl(api.url + encodeURIComponent(videoUrl));
    const controller = new AbortController();
    this.abortControllers.set(api.url + '_l1', controller);

    const frame = externalFrame || (() => {
      const f = document.createElement('iframe');
      f.style.display = 'none';
      f.style.position = 'absolute';
      f.style.left = '-9999px';
      document.body.appendChild(f);
      return f;
    })();

    frame.src = testUrl;

    try {
      const result = await Promise.race([
        new Promise((resolve, reject) => {
          const tid = setTimeout(() => reject(new Error('timeout')), timeout);
          frame.onload = () => {
            clearTimeout(tid);
            resolve({ success: true });
          };
          frame.onerror = () => { clearTimeout(tid); reject(new Error('load error')); };
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), timeout)),
      ]);
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      if (!externalFrame) {
        setTimeout(() => { if (document.body.contains(frame)) document.body.removeChild(frame); }, 500);
      }
      this.abortControllers.delete(api.url + '_l1');
    }
  }

  // ====================================================================
  //  第2级测试：内容验证
  //    - JSON 类型（短剧）：fetch + 解析 JSON + 提取视频 URL
  //    - HTML 类型（VIP）：fetch( → 代理) + 检测 HTML 视频特征
  // ====================================================================

  // 用 <video> 实测媒体直链是否真实可播放，并读取真实时长（秒）
  // 这是"百分百精准"判定的核心：能 loadedmetadata 才算真·解析成功
  // 并发闸门：最多 MAX_PROBES 个 video 探测同时进行，避免 20 路齐发卡死
  probeMediaUrl(url, timeout = 9000) {
    return new Promise((resolve) => {
      const task = () => new Promise((res) => {
        if (!isValidVideoUrl(url)) { res({ ok: false, reason: 'invalid url', inconclusive: false }); return; }
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.crossOrigin = 'anonymous'; // 仅当 CDN 允许 CORS 时可读取时长
        video.muted = true;
        let done = false;
        const finish = (r) => { if (done) return; done = true; try { video.src = ''; video.load(); } catch (_) {} res(r); };
        const tid = setTimeout(() => finish({ ok: false, reason: 'probe timeout', inconclusive: true }), timeout);
        video.addEventListener('loadedmetadata', () => {
          clearTimeout(tid);
          const d = (typeof video.duration === 'number' && !isNaN(video.duration) && isFinite(video.duration))
            ? Math.round(video.duration) : null;
          finish({ ok: true, duration: d, url });
        });
        video.addEventListener('error', () => {
          clearTimeout(tid);
          // CORS 拦截 / 链接失效 → 无法判定为硬成功，归为 inconclusive
          finish({ ok: false, reason: 'video element error', inconclusive: true });
        });
        try { video.src = url; video.load(); } catch (_) {
          clearTimeout(tid);
          finish({ ok: false, reason: 'set src failed', inconclusive: false });
        }
      });
      this._probeQueue.push({ task, resolve });
      this._pumpProbes();
    });
  }
  _pumpProbes() {
    while (this._probeRunning < this._MAX_PROBES && this._probeQueue.length > 0) {
      const { task, resolve } = this._probeQueue.shift();
      this._probeRunning++;
      task().then((r) => {
        this._probeRunning--;
        resolve(r);
        this._pumpProbes();
      });
    }
  }

  async level2ContentValidation(api, videoUrl) {    if (api.responseType === 'json') {
      return this.level2Json(api, videoUrl);
    }
    return this.level2Html(api, videoUrl);
  }

  // JSON 类型 — 直接 fetch，解析 JSON，提取视频链接
  async level2Json(api, videoUrl) {
    const fullUrl = resolveUrl(api.url + encodeURIComponent(videoUrl));
    const controller = new AbortController();
    this.abortControllers.set(api.url + '_l2', controller);

    try {
      const res = await fetch(fullUrl, { signal: AbortSignal.timeout(6000) });
      if (!res.ok) {
        return { passed: false, reason: 'HTTP ' + res.status };
      }
      let text;
      try { text = await res.text(); } catch (_) {
        return { passed: false, reason: 'read body failed' };
      }
      let data;
      try { data = JSON.parse(text); } catch (_) {
        return { passed: false, reason: 'not valid JSON' };
      }
      const videoUrlFound = extractVideoUrlFromJson(data);
      const duration = extractDurationFromJson(data);
      if (videoUrlFound) {
        // 真实探测直链能否播放并拿到精准时长（JSON 内字段可能不准/缺失）
        const probe = await this.probeMediaUrl(videoUrlFound);
        const realDuration = (probe.ok && probe.duration) ? probe.duration : duration;
        return {
          passed: true,
          videoUrl: videoUrlFound,
          rawData: data,
          duration: realDuration,
          realPlayable: probe.ok,
        };
      }
      // JSON 里没找到视频 URL → 失败
      return { passed: false, reason: 'no video url in JSON' };
    } catch (e) {
      if (e.name === 'AbortError') return { passed: false, reason: 'timeout' };
      // 网络错误 / CORS 拦截 → 归为 inconclusive（无法判断）
      const isNetworkError = e instanceof TypeError || e.name === 'TypeError';
      return { passed: false, reason: e.message, inconclusive: isNetworkError };
    } finally {
      this.abortControllers.delete(api.url + '_l2');
    }
  }

  // HTML 类型 — 先直连 fetch，CORS 拦截则走代理，检测"真实可播放的媒体直链"
  async level2Html(api, videoUrl) {
    const fullUrl = resolveUrl(api.url + encodeURIComponent(videoUrl));
    const controller = new AbortController();
    this.abortControllers.set(api.url + '_l2', controller);

    const analyze = (html) => {
      const errorPage = isErrorPage(html, fullUrl);
      const allMedia = extractMediaUrls(html);
      // 优先跨域直链；解析页自身同域的媒体也保留（部分解析器自托管 m3u8）
      const cross = allMedia.filter(u => !sameHost(u, fullUrl));
      const mediaUrls = rankMediaUrls(cross.length > 0 ? cross : allMedia);
      const indicators = VIDEO_INDICATORS
        .filter(ind => ind.pattern.test(html))
        .map(ind => ind.label);
      return {
        // 必须通过：不是错误页 + 找到媒体直链
        passed: !errorPage && mediaUrls.length > 0,
        errorPage,
        mediaUrls,
        indicators,
        htmlLength: html.length,
      };
    };

    // 方式1：直连 fetch（可能被 CORS 拦截）
    try {
      const res = await fetch(fullUrl, {
        signal: AbortSignal.timeout(6000),
        mode: 'cors',
      });
      if (res.ok) {
        const html = await res.text();
        const result = analyze(html);
        if (result.passed) {
          return await this._finalizeHtmlL2(api, result, 'direct');
        }
        return { ...result, passed: false, via: 'direct', reason: result.errorPage ? 'error page detected' : 'no cross-host media url in HTML' };
      }
    } catch (_) { /* CORS blocked or network error, try proxy */ }

    // 方式2：通过公共 CORS 代理获取内容
    try {
      const proxyUrl = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(fullUrl);
      const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(8000) });
      if (res.ok) {
        const html = await res.text();
        const result = analyze(html);
        if (result.passed) {
          return await this._finalizeHtmlL2(api, result, 'proxy');
        }
        return { ...result, passed: false, via: 'proxy', reason: result.errorPage ? 'error page detected (proxy)' : 'no cross-host media url in HTML (proxy)' };
      }
      // 代理返回 4xx/5xx（域名不存在、服务器错误）→ 硬性失败，不是 inconclusive
      return { passed: false, reason: 'proxy HTTP ' + res.status, inconclusive: false };
    } catch (e) {
      // 代理也抛网络错误（DNS 失败、连接超时等）→ 真正的网络不可达，不应标记为 inconclusive
      const isNetworkError = e instanceof TypeError || e.name === 'TypeError';
      return { passed: false, reason: 'proxy network error: ' + e.message, inconclusive: isNetworkError };
    }
  }

  // HTML L2 通过后的收尾：用 <video> 实测媒体直链能否真实播放并读取时长
  //  尝试前 2 个候选直链，任一可播即算"实测可播放"
  async _finalizeHtmlL2(api, analyzeResult, via) {
    const candidates = analyzeResult.mediaUrls.slice(0, 2);
    let lastReason = 'no media url';
    for (const mediaUrl of candidates) {
      const probe = await this.probeMediaUrl(mediaUrl);
      if (probe.ok) {
        return {
          passed: true,
          via,
          mediaUrl,
          duration: probe.duration,
          realPlayable: true,
          indicators: analyzeResult.indicators,
          htmlLength: analyzeResult.htmlLength,
        };
      }
      lastReason = probe.reason;
    }
    // 媒体直链无法真实加载（CORS / 失效）→ 视为内容不可验证
    return {
      passed: false,
      via,
      mediaUrl: candidates[0],
      reason: 'media url not playable (probe failed: ' + lastReason + ')',
      inconclusive: true,
    };
  }

  // ====================================================================
  //  完整分级测试：先 L1（连通性），通过后再 L2（内容验证）
  //    - L1 失败 → 跳过该线路
  //    - L1 通过但 L2 失败 → 进入 fallback 候选
  //    - L1 + L2 都通过 → 立即选中（跳过后续线路）
  //    externalFrame：外部可见 iframe（用于 UI 多窗口模式）
  // ====================================================================
  async testRoute(api, videoUrl, timeout = 5000, onProgress = null, externalFrame = null) {
    const start = Date.now();
    const testUrl = resolveUrl(api.url + encodeURIComponent(videoUrl));

    // L1：连通性测试
    if (onProgress) onProgress({ type: 'l1_start', api });
    const l1 = await this.level1Connectivity(api, videoUrl, timeout, externalFrame);
    if (!l1.success) {
      if (onProgress) onProgress({ type: 'l1_fail', api, responseTime: Date.now() - start, error: l1.error });
      return {
        api, success: false, level: 1,
        responseTime: Date.now() - start,
        error: l1.error || 'connectivity timeout',
        url: testUrl,
      };
    }
    if (onProgress) onProgress({ type: 'l1_ok', api, responseTime: Date.now() - start });

    // L2：内容验证
    if (onProgress) onProgress({ type: 'l2_start', api, responseType: api.responseType });
    const l2 = await this.level2ContentValidation(api, videoUrl);

      if (l2.passed) {
        if (onProgress) onProgress({ type: 'l2_ok', api, responseTime: Date.now() - start });
        // L2 通过（且经 <video> 实测可播放）→ 最高置信度的"真成功"
        return {
          api, success: true, level: 2,
          responseTime: Date.now() - start,
          url: testUrl,
          videoValidated: true,
          realPlayable: !!l2.realPlayable,
          duration: l2.duration || null,
          l2Details: l2,
        };
      }

    if (onProgress) onProgress({ type: 'l2_fail', api, responseTime: Date.now() - start, reason: l2.reason, inconclusive: l2.inconclusive || false });

    // L1 通过 + L2 失败（或 inconclusive）
    const l1Only = {
      api, success: false, level: 1,
      responseTime: Date.now() - start,
      url: testUrl,
      videoValidated: false,
      l2Failed: true,
      l2Inconclusive: l2.inconclusive || false,
      l2Reason: l2.reason || 'content validation failed',
    };

    // 如果 L2 是 inconclusive（无法验证内容），将 L1 通过视为"软成功"
    if (l2.inconclusive) {
      l1Only.success = true;
      l1Only.softSuccess = true;
    }

    return l1Only;
  }

  // ====================================================================
  //  查找最佳线路（分级策略）
  //    按批次并发测试，策略：
  //      1. L1 + L2 都通过 → 立即选定（终选）
  //      2. L2 不可验证但 L1 通过 → 记为"软成功"，继续找 L2 真通过
  //      3. L1 通过但 L2 明确失败 → 记为 fallback，继续找
  //      4. 所有 API 完成 → 优先选软成功；没有则选最快的 L1 通过
  //      5. 全部 L1 失败 → 降级到默认线路
  // ====================================================================
  async findBestRoute(apis, videoUrl, maxConcurrent = 5, onProgress = null, frameMap = null) {
    const sorted = this.getSortedRoutes(apis);
    this.testResults.clear();

    return new Promise((resolve, reject) => {
      let completed = 0;
      let resolved = false;
      const results = [];
      const softSuccesses = [];   // L1 ok + L2 inconclusive
      const l2Passes = [];        // L1 + L2 通过（未实测播放）

      const processResult = (r) => {
        this.updateRouteStats(r.api.url, r.success, r.responseTime);
        results.push(r);
        completed++;

        if (resolved) return;

        // 最高优先级：经 <video> 实测可播放（拿到真实时长）→ 立即终选
        if (r.success && r.level === 2 && r.realPlayable) {
          resolved = true;
          if (onProgress) onProgress({ type: 'selected', api: r.api, result: r });
          resolve(r);
          return;
        }

        // L1+L2 全部通过（但未实测播放）→ 暂存，等是否有 realPlayable 出现
        if (r.success && r.level === 2 && r.videoValidated) {
          l2Passes.push(r);
        }

        // L2 不可验证但 L1 通过 → 暂存为软成功
        if (r.softSuccess) {
          softSuccesses.push(r);
        }

        // 所有 API 完成，没有真通过的
        if (completed === sorted.length) {
          resolved = true;
          this._lastRanking = this.buildCandidateRanking(apis, results, softSuccesses, l2Passes);

          // 1) 优先选实测可播放的
          if (l2Passes.length > 0) {
            const best = l2Passes.sort((a, b) => a.responseTime - b.responseTime)[0];
            if (onProgress) onProgress({ type: 'selected', api: best.api, result: best, soft: true });
            resolve(best);
            return;
          }

          // 2) 优先选软成功（内容不可验证但页面能加载）
          if (softSuccesses.length > 0) {
            const best = softSuccesses.sort((a, b) => a.responseTime - b.responseTime)[0];
            if (onProgress) onProgress({ type: 'selected', api: best.api, result: best, soft: true });
            resolve(best);
            return;
          }

          // 3) 选最快的 L1 通过（有 L2 失败但页面能加载）
          const l1Pass = results.filter(r => r.success && r.level === 1 && !r.l2Failed)
            .sort((a, b) => a.responseTime - b.responseTime);
          if (l1Pass.length > 0) {
            const best = l1Pass[0];
            if (onProgress) onProgress({ type: 'selected', api: best.api, result: best, soft: true });
            resolve(best);
            return;
          }

          // 全部失败
          const successful = results.filter(r => r.success);
          if (successful.length > 0) {
            const fastest = successful.sort((a, b) => a.responseTime - b.responseTime)[0];
            if (onProgress && fastest) onProgress({ type: 'selected', api: fastest.api, result: fastest, soft: true });
            resolve(fastest);
            return;
          }
          reject(new Error('所有线路测试失败'));
        }
      };

      const testBatch = async (routes) => {
        const promises = routes.map(api => {
          const frame = frameMap ? frameMap.get(api.url) || null : null;
          return this.testRoute(api, videoUrl, api.timeout || 5000, onProgress, frame)
            .then(processResult)
            .catch(() => { completed++; });
        });
        await Promise.allSettled(promises);
      };

      (async () => {
        for (let i = 0; i < sorted.length && !resolved; i += maxConcurrent) {
          await testBatch(sorted.slice(i, i + maxConcurrent));
        }
      })();

      // 全局超时 25 秒
      setTimeout(() => {
        if (!resolved) {
          resolved = true;
          this._lastRanking = this.buildCandidateRanking(apis, results, softSuccesses, l2Passes);
          if (l2Passes.length > 0) {
            const best = l2Passes.sort((a, b) => a.responseTime - b.responseTime)[0];
            if (onProgress) onProgress({ type: 'selected', api: best.api, result: best, soft: true });
            resolve(best);
          } else if (softSuccesses.length > 0) {
            const best = softSuccesses.sort((a, b) => a.responseTime - b.responseTime)[0];
            if (onProgress) onProgress({ type: 'selected', api: best.api, result: best, soft: true });
            resolve(best);
          } else {
            const successful = results.filter(r => r.success);
            if (successful.length > 0) {
              const fastest = successful.sort((a, b) => a.responseTime - b.responseTime)[0];
              if (onProgress && fastest) onProgress({ type: 'selected', api: fastest.api, result: fastest, soft: true });
              resolve(fastest);
            } else {
              reject(new Error('所有线路测试超时'));
            }
          }
        }
      }, 25000);
    });
  }

  // 构造"可播放候选"排序列表（用于播放失败后一键换线路）
  //  优先级：实测可播放 > L2 通过 > 软成功 > L1 通过；同级按响应时间
  buildCandidateRanking(apis, results, softSuccesses, l2Passes) {
    const rank = (r) => {
      if (r.realPlayable) return 0;
      if (r.success && r.level === 2) return 1;
      if (r.softSuccess) return 2;
      if (r.success && r.level === 1 && !r.l2Failed) return 3;
      if (r.l2Failed) return 4;
      return 5;
    };
    const all = [...results];
    return all
      .map(r => ({ r, rank: rank(r) }))
      .sort((a, b) => (a.rank - b.rank) || (a.r.responseTime - b.r.responseTime))
      .map(x => x.r);
  }

  // 播放失败后获取下一条候选线路（排除已失败的）
  nextCandidate(apis, excludeUrls = []) {
    if (!this._lastRanking) return null;
    const next = this._lastRanking.find(r =>
      !excludeUrls.includes(r.api.url) &&
      (r.success || r.softSuccess || (r.l2Failed && !r.l2Inconclusive))
    );
    return next || null;
  }

  cancelAllTests() {
    this.abortControllers.forEach(c => { try { c.abort(); } catch (e) { /* ignore */ } });
    this.abortControllers.clear();
  }

  getRouteStatsInfo() {
    const allApis = [...VIP_PARSE_APIS, ...SHORT_VIDEO_APIS];
    return allApis.map(api => {
      const s = this.routeStats[api.url] || {};
      return {
        name: api.name,
        url: api.url,
        successRate: Math.round(this.getSuccessRate(api.url) * 100),
        avgResponseTime: Math.round(s.avgResponseTime || 0),
        totalTests: s.totalTests || 0,
        lastUsed: s.lastUsed || 0,
      };
    }).sort((a, b) => b.successRate - a.successRate);
  }
}

window.smartRouteManager = new SmartRouteManager();

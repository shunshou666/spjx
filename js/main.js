(function () {
  'use strict';

  // ============================================================
  //  DOM 引用
  // ============================================================
  const $ = (id) => document.getElementById(id);
  const qs = (s, el) => (el || document).querySelector(s);

  // Tab
  const tabBtns = document.querySelectorAll('.tab-btn');
  const panels = {
    vip: $('panelVip'),
    short: $('panelShort'),
    bili: $('panelBili'),
  };

  // VIP
  const vipUrl = $('vipUrl');
  const vipApi = $('vipApi');
  const vipParseBtn = $('vipParseBtn');

  // Short video
  const shortUrl = $('shortUrl');
  const shortApi = $('shortApi');
  const shortParseBtn = $('shortParseBtn');

  // Bili
  const biliBv = $('biliBv');
  const biliAv = $('biliAv');
  const biliQuality = $('biliQuality');
  const biliOtypeBtns = document.querySelectorAll('#biliOtype .btn-group-item');
  const biliParseBtn = $('biliParseBtn');
  const biliResult = $('biliResult');
  const biliResultContent = $('biliResultContent');
  const biliResultClose = $('biliResultClose');

  // Player
  const playerOverlay = $('playerContainer');
  const videoPlayer = $('videoPlayer');
  const loadingOverlay = $('loadingOverlay');
  const playerTitle = $('playerTitle');
  const playerEpisode = $('playerEpisode');
  const playerRefresh = $('playerRefresh');
  const playerClose = $('playerClose');
  const playerSwitch = $('playerSwitch');

  // History / Stats
  const toggleHistoryBtn = $('toggleHistoryBtn');
  const historyDrawer = $('historyDrawer');
  const historyList = $('historyList');
  const clearHistoryBtn = $('clearHistoryBtn');
  const closeHistoryBtn = $('closeHistoryBtn');
  const toggleStatsBtn = $('toggleStatsBtn');
  const statsDrawer = $('statsDrawer');
  const statsList = $('statsList');
  const clearStatsBtn = $('clearStatsBtn');
  const closeStatsBtn = $('closeStatsBtn');

  // Instructions
  const instructionsToggle = $('instructionsToggle');
  const instructionsBody = $('instructionsBody');

  // Message
  const msgContainer = $('messageContainer');

  // ============================================================
  //  状态
  // ============================================================
  let currentTab = 'vip';
  let currentVipUrl = '';
  let currentVipApi = '';
  let biliOtype = 'json';
  let routeTestUI = null;
  let switchContext = null; // { apis, excludeUrls: [], originalUrl }

  // ============================================================
  //  初始化
  // ============================================================
  function init() {
    routeTestUI = new RouteTestUI();
    populateSelect(vipApi, VIP_PARSE_APIS);
    populateSelect(shortApi, SHORT_VIDEO_APIS);
    populateQualitySelect();
    renderQuickLinks();
    renderShortPlatforms();

    // Tab
    tabBtns.forEach((btn) => {
      btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    // VIP
    vipParseBtn.addEventListener('click', () => handleVipParse());
    vipUrl.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleVipParse(); });

    // Short
    shortParseBtn.addEventListener('click', () => handleShortParse());
    shortUrl.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleShortParse(); });

    // Bili
    biliParseBtn.addEventListener('click', () => handleBiliParse());
    biliBv.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleBiliParse(); });
    biliAv.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleBiliParse(); });
    biliOtypeBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        biliOtypeBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        biliOtype = btn.dataset.value;
      });
    });
    biliResultClose.addEventListener('click', () => biliResult.classList.add('hidden'));

    // Player
    playerRefresh.addEventListener('click', refreshVideo);
    playerClose.addEventListener('click', closePlayer);
    if (playerSwitch) playerSwitch.addEventListener('click', switchRoute);
    videoPlayer.addEventListener('load', () => {
      setTimeout(() => {
      loadingOverlay.classList.add('hidden');
      const sw = $('playerSwitch');
      if (sw) sw.classList.remove('player-switch-alert');
    }, 600);
    });
    videoPlayer.addEventListener('error', () => {
      loadingOverlay.classList.add('hidden');
      showMsg('当前线路解析失败，可点击「换线路」尝试其他接口', 'error');
    });

    // History / Stats
    toggleHistoryBtn.addEventListener('click', () => toggleDrawer(historyDrawer, statsDrawer));
    closeHistoryBtn.addEventListener('click', () => historyDrawer.classList.add('hidden'));
    clearHistoryBtn.addEventListener('click', clearHistory);
    toggleStatsBtn.addEventListener('click', () => toggleDrawer(statsDrawer, historyDrawer));
    closeStatsBtn.addEventListener('click', () => statsDrawer.classList.add('hidden'));
    clearStatsBtn.addEventListener('click', clearStats);

    // Instructions
    instructionsToggle.addEventListener('click', () => {
      instructionsBody.classList.toggle('hidden');
      instructionsToggle.classList.toggle('open');
    });

    // Load history
    renderHistoryList();

    // URL param auto-parse
    const urlParams = new URLSearchParams(window.location.search);
    const autoUrl = urlParams.get('url');
    if (autoUrl) {
      vipUrl.value = decodeURIComponent(autoUrl);
      switchTab('vip');
      handleVipParse();
    }
  }

  // ============================================================
  //  Tab 切换
  // ============================================================
  function switchTab(tab) {
    currentTab = tab;
    tabBtns.forEach((b) => b.classList.toggle('active', b.dataset.tab === tab));
    Object.entries(panels).forEach(([k, el]) => el.classList.toggle('active', k === tab));
  }

  // ============================================================
  //  下拉框填充
  // ============================================================
  function populateSelect(sel, apis) {
    sel.innerHTML = '<option value="smart">\u{1F680} 自动选择线路</option>' +
      apis.map((a) => `<option value="${a.url}">${a.name}</option>`).join('');
  }

  function populateQualitySelect() {
    biliQuality.innerHTML = BILI_QUALITY_OPTIONS
      .map((o) => `<option value="${o.value}">${o.label}</option>`).join('');
  }

  // ============================================================
  //  快速链接
  // ============================================================
  function renderQuickLinks() {
    const links = [
      { name: '爱奇艺', url: 'https://www.iqiyi.com' },
      { name: '腾讯视频', url: 'https://v.qq.com' },
      { name: '优酷', url: 'https://www.youku.com' },
      { name: '芒果TV', url: 'https://www.mgtv.com' },
      { name: 'Bilibili', url: 'https://www.bilibili.com' },
    ];
    $('vipQuickLinks').innerHTML = links
      .map((l) => `<a href="${l.url}" target="_blank" class="platform-link">${l.name}</a>`).join('');
  }

  function renderShortPlatforms() {
    const platforms = ['抖音', '快手', '小红书', 'B站', '微博', '皮皮虾', '汽水音乐', '火山'];
    $('shortPlatforms').innerHTML = platforms
      .map((p) => `<span class="platform-tag">${p}</span>`).join('');
  }

  // ============================================================
  //  工具函数
  // ============================================================
  function isValidUrl(str) {
    try { const u = new URL(str); return u.protocol === 'http:' || u.protocol === 'https:'; }
    catch (_) { return false; }
  }

  function extractBvAv(str) {
    const bv = str.match(/BV[a-zA-Z0-9]+/);
    const av = str.match(/av(\d+)/i);
    return { bv: bv ? bv[0] : '', av: av ? av[1] : '' };
  }

  // ============================================================
  //  VIP 长视频解析
  // ============================================================
  async function handleVipParse() {
    const url = vipUrl.value.trim();
    if (!url) return showMsg('请输入视频地址', 'error');
    if (!isValidUrl(url)) return showMsg('请输入有效的视频网址', 'error');

    currentVipUrl = url;
    const api = vipApi.value;

    saveToHistory(url, await extractVideoInfoFallback(url));

    if (api === 'smart') {
      try {
        const result = await routeTestUI.run(VIP_PARSE_APIS, async (onProgress, frameMap) => {
          return await window.smartRouteManager.findBestRoute(VIP_PARSE_APIS, url, VIP_PARSE_APIS.length, onProgress, frameMap);
        });
        if (result && result.success) {
          switchContext = { apis: VIP_PARSE_APIS, excludeUrls: [], originalUrl: url };
          currentVipApi = result.api.url;
          setTimeout(() => openPlayer(result.url, url, result), 300);
        } else {
          fallbackVip(url);
        }
      } catch (_) {
        fallbackVip(url);
      }
    } else {
      switchContext = { apis: VIP_PARSE_APIS, excludeUrls: [], originalUrl: url };
      currentVipApi = api;
      openPlayer(api + encodeURIComponent(url), url, { api: { url: api } });
    }
  }

  function fallbackVip(url) {
    switchContext = { apis: VIP_PARSE_APIS, excludeUrls: [], originalUrl: url };
    const fb = VIP_PARSE_APIS[0];
    currentVipApi = fb.url;
    showMsg('智能检测失败，使用默认线路', 'warning');
    setTimeout(() =>     openPlayer(fb.url + encodeURIComponent(url), url, { api: { url: fb.url } }), 300);
  }

  // 当前线路播放失败时，一键切换到下一条候选接口
  async function switchRoute() {
    if (!switchContext) return showMsg('当前非智能选择，请直接更换线路', 'warning');
    if (!window.smartRouteManager) return;
    // 把刚失败的线路计入统计失败
    if (currentVipApi) {
      window.smartRouteManager.updateRouteStats(currentVipApi, false, 0);
    }
    if (!switchContext.excludeUrls.includes(currentVipApi)) {
      switchContext.excludeUrls.push(currentVipApi);
    }
    const next = window.smartRouteManager.nextCandidate(switchContext.apis, switchContext.excludeUrls);
    if (!next) {
      showMsg('已尝试所有可用线路，均无可用播放', 'error');
      return;
    }
    currentVipApi = next.api.url;
    const testUrl = resolveApiUrl(next.api, switchContext.originalUrl);
    showMsg('正在切换到：' + next.api.name, 'info');
    openPlayer(testUrl, switchContext.originalUrl, next);
  }

  function resolveApiUrl(api, url) {
    const base = api.url.startsWith('//') ? 'https:' + api.url : api.url;
    return base + encodeURIComponent(url);
  }

  // ============================================================
  //  短视频解析
  // ============================================================
  async function handleShortParse() {
    const url = shortUrl.value.trim();
    if (!url) return showMsg('请输入短视频链接', 'error');
    if (!isValidUrl(url)) return showMsg('请输入有效的视频链接', 'error');

    const api = shortApi.value;

    if (api === 'smart') {
      try {
        const result = await routeTestUI.run(
          SHORT_VIDEO_APIS,
          async (onProgress, frameMap) => {
            return await window.smartRouteManager.findBestRoute(SHORT_VIDEO_APIS, url, SHORT_VIDEO_APIS.length, onProgress, frameMap);
          },
          (final) => onShortResolved(final, url)
        );
        if (!result) {
          openShortResult(SHORT_VIDEO_APIS[0].url + encodeURIComponent(url), url);
        }
      } catch (_) {
        openShortResult(SHORT_VIDEO_APIS[0].url + encodeURIComponent(url), url);
      }
    } else {
      openShortResult(api + encodeURIComponent(url), url);
    }
  }

  // 短视频智能检测完成后：与 VIP 共用同一套展开动画弹窗，
  // 这里在展开后的瓦片内渲染"去水印结果"（下载/直链/封面等）
  function onShortResolved(result, url) {
    switchContext = { apis: SHORT_VIDEO_APIS, excludeUrls: [], originalUrl: url };
    const entry = routeTestUI.tileMap.get(result.api.url);
    if (!entry) { openShortResult(result.url, url); return; }

    const body = entry.el;
    // 复用同一套品牌卡片样式承载结果
    let box = body.querySelector('.rt-short-result');
    if (!box) {
      box = document.createElement('div');
      box.className = 'rt-short-result';
      body.appendChild(box);
    }

    const l2 = result.l2Details;
    if (result.success && l2 && l2.passed && l2.rawData) {
      box.innerHTML = buildShortResultHtml(l2.rawData, result.duration || l2.duration);
    } else {
      box.innerHTML = `
        <div class="rt-short-fallback">
          <p>未获取到结构化数据，可点下方按钮在新页面查看解析结果：</p>
          <a href="${result.url}" target="_blank" class="btn btn-primary btn-block" style="text-decoration:none;margin-top:8px;">打开解析页面</a>
        </div>`;
    }
  }

  function openShortResult(apiUrl) {
    routeTestUI.showManualResult(apiUrl, '解析结果', (box) => {
      box.innerHTML = '<div style="padding:24px;text-align:center;color:rgba(255,255,255,0.6);">正在加载解析...</div>';
      fetch(apiUrl)
        .then((r) => r.text())
        .then((text) => {
          try { box.innerHTML = buildShortResultHtml(JSON.parse(text)); }
          catch (_) { box.innerHTML = buildShortFallbackHtml(apiUrl, text); }
        })
        .catch(() => { box.innerHTML = buildShortFallbackHtml(apiUrl); });
    });
  }

  function buildShortFallbackHtml(apiUrl, rawText) {
    const hasRaw = rawText && rawText.length > 0;
    return `
      <p class="rt-short-meta">${hasRaw ? '解析结果：' : '无法直接获取JSON（跨域限制），请在新页面查看：'}</p>
      <a href="${apiUrl}" target="_blank" class="btn btn-primary btn-block" style="text-decoration:none;margin-bottom:8px;">打开解析页面</a>
      <iframe src="${apiUrl}" style="width:100%;height:280px;border:1px solid rgba(255,255,255,0.08);border-radius:8px;"></iframe>
      ${hasRaw ? `<pre class="rt-short-raw">${escapeHtml(rawText)}</pre>` : ''}
    `;
  }

  function escapeHtml(str) {
    return str.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  }

  function extractDurationFromData(obj) {
    const keys = ['duration', 'time', 'length', 'vtime', 'play_time', 'video_time', 'size'];
    const found = (o, d) => {
      if (d > 4 || !o || typeof o !== 'object') return null;
      if (Array.isArray(o)) { for (const i of o) { const r = found(i, d + 1); if (r) return r; } return null; }
      for (const k of keys) {
        const v = o[k];
        if (typeof v === 'number' && v > 0) return v > 100000 ? Math.round(v / 1000) : Math.round(v);
        if (typeof v === 'string') { const n = parseFloat(v); if (!isNaN(n) && n > 0) return v > 100000 ? Math.round(n / 1000) : Math.round(n); }
      }
      for (const k of Object.keys(o)) { const r = found(o[k], d + 1); if (r) return r; }
      return null;
    };
    return found(obj, 0);
  }

  // 与 buildShortResultHtml 共用同一套卡片内容（供"智能检测"展开瓦片内渲染）
  function buildShortResultHtml(data, duration) {
    let html = '';
    if (data.title) html += `<p class="rt-short-title">${data.title}</p>`;
    if (data.cover) html += `<img src="${data.cover}" class="rt-short-cover" alt="cover">`;
    if (data.url) {
      html += `<a href="${data.url}" target="_blank" class="btn btn-primary btn-block" style="text-decoration:none;margin-bottom:8px;">下载视频</a>`;
    }
    const dur = duration || extractDurationFromData(data);
    if (dur) {
      html += `<p class="rt-short-meta">时长：${window.videoInfoExtractor.formatDuration(dur)}</p>`;
    }
    if (data.author) html += `<p class="rt-short-meta">作者：${data.author}</p>`;
    if (!html) html = `<pre class="rt-short-raw">${JSON.stringify(data, null, 2)}</pre>`;
    return html;
  }
  async function handleBiliParse() {
    let bv = biliBv.value.trim();
    let av = biliAv.value.trim();

    if (!bv && !av) { return showMsg('请输入 BV 号或 AV 号', 'error'); }
    const extracted = extractBvAv(bv || av);
    if (extracted.bv) bv = extracted.bv;
    if (extracted.av) av = extracted.av;

    const quality = biliQuality.value;
    const params = new URLSearchParams({ otype: biliOtype, q: quality });
    if (bv) params.set('bv', bv);
    else params.set('av', av);

    const apiUrl = BILI_API.baseUrl + '?' + params.toString();
    showMsg('正在解析B站视频...', 'info');

    try {
      const res = await fetch(apiUrl);
      const text = await res.text();
      let display = text;
      try { display = JSON.stringify(JSON.parse(text), null, 2); } catch (_) { /* raw */ }
      biliResultContent.textContent = display;
      biliResult.classList.remove('hidden');
      showMsg('解析成功', 'success');

      if (biliOtype === 'url') {
        const cleanUrl = text.trim();
        if (isValidUrl(cleanUrl)) {
          openPlayer(cleanUrl, '');
        }
      }
      if (biliOtype === 'dplayer') {
        openPlayer(apiUrl, '');
      }
    } catch (e) {
      showMsg('B站解析失败：' + e.message, 'error');
    }
  }

  // ============================================================
  //  播放器
  // ============================================================
  function openPlayer(src, originalUrl, route) {
    playerTitle.textContent = '视频播放';
    playerEpisode.classList.add('hidden');
    playerOverlay.classList.remove('hidden');
    loadingOverlay.classList.remove('hidden');
    videoPlayer.src = src;

    // 播放器内显示时长（仅 JSON 类接口可获取，HTML 跨域无法读取）
    if (route && route.duration) {
      playerEpisode.textContent = '时长 ' + window.videoInfoExtractor.formatDuration(route.duration);
      playerEpisode.classList.remove('hidden');
    }

    setTimeout(() => {
      playerOverlay.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);

    if (originalUrl) {
      const history = getHistory();
      const found = history.find((h) => h.url === originalUrl);
      if (found) {
        playerTitle.textContent = found.title || '视频播放';
        if (found.episode) {
          playerEpisode.textContent = found.episode;
          playerEpisode.classList.remove('hidden');
        }
      }
    }

    // 播放健康看门狗：线路若长时间仍在 loading，说明实际未播放
    schedulePlaybackWatchdog();
  }

  let _watchdogTimer = null;
  function schedulePlaybackWatchdog() {
    if (_watchdogTimer) { clearTimeout(_watchdogTimer); _watchdogTimer = null; }
    _watchdogTimer = setTimeout(() => {
      _watchdogTimer = null;
      // 播放器已关闭 或 已正常隐藏 loading → 视为成功，不做处理
      if (playerOverlay.classList.contains('hidden')) return;
      if (loadingOverlay.classList.contains('hidden')) return;
      // 仍在 loading：线路很可能失效
      const sw = $('playerSwitch');
      if (sw) {
        sw.classList.add('player-switch-alert');
        showMsg('该线路可能未正常播放，可点「换线路」尝试其他接口', 'error');
      }
    }, 12000);
  }

  function refreshVideo() {
    if (!videoPlayer.src) return showMsg('没有正在播放的视频', 'warning');
    loadingOverlay.classList.remove('hidden');
    const currentSrc = videoPlayer.src;
    videoPlayer.src = '';
    setTimeout(() => { videoPlayer.src = currentSrc; }, 200);
  }

  function closePlayer() {
    if (_watchdogTimer) { clearTimeout(_watchdogTimer); _watchdogTimer = null; }
    const sw = $('playerSwitch');
    if (sw) sw.classList.remove('player-switch-alert');
    playerOverlay.classList.add('hidden');
    videoPlayer.src = '';
  }

  // ============================================================
  //  历史记录
  // ============================================================
  function getHistory() {
    try { return JSON.parse(localStorage.getItem('videoHistory') || '[]'); }
    catch (_) { return []; }
  }

  function setHistory(h) {
    try { localStorage.setItem('videoHistory', JSON.stringify(h)); }
    catch (_) { /* ignore */ }
  }

  function saveToHistory(url, info) {
    const h = getHistory();
    const idx = h.findIndex((i) => i.url === url);
    const entry = {
      url,
      title: info.title || '视频播放',
      episode: info.episode || '',
      note: '',
      lastWatch: new Date().toISOString(),
    };
    if (idx !== -1) { h[idx] = { ...h[idx], ...entry }; }
    else { h.unshift(entry); }
    if (h.length > 30) h.length = 30;
    setHistory(h);
    renderHistoryList();
  }

  async function extractVideoInfoFallback(url) {
    try {
      if (window.videoInfoExtractor) {
        return await window.videoInfoExtractor.extractVideoInfo(url);
      }
    } catch (_) { /* ignore */ }
    return { title: '视频播放', episode: '', platform: 'unknown' };
  }

  function renderHistoryList() {
    const h = getHistory();
    if (h.length === 0) {
      historyList.innerHTML = '<div class="empty-state">暂无观看历史</div>';
      return;
    }
    historyList.innerHTML = h.map((item, i) => {
      const dateStr = formatDate(item.lastWatch);
      return `
        <div class="history-item">
          <div class="history-item-main" data-index="${i}">
            <div class="history-item-title">${item.title}</div>
            ${item.episode ? `<div class="history-item-episode">${item.episode}</div>` : ''}
            <div class="history-item-time">${dateStr}</div>
          </div>
          <input type="text" class="note-input" placeholder="添加备注" value="${item.note || ''}" data-history-index="${i}">
        </div>
      `;
    }).join('');

    historyList.querySelectorAll('.history-item-main').forEach((el) => {
      el.addEventListener('click', () => {
        const i = parseInt(el.dataset.index);
        const h = getHistory();
        if (h[i]) {
          vipUrl.value = h[i].url;
          switchTab('vip');
          handleVipParse();
          historyDrawer.classList.add('hidden');
        }
      });
    });

    historyList.querySelectorAll('.note-input').forEach((el) => {
      el.addEventListener('change', () => {
        const i = parseInt(el.dataset.historyIndex);
        const h = getHistory();
        if (h[i]) {
          h[i].note = el.value;
          setHistory(h);
        }
      });
    });
  }

  function clearHistory() {
    setHistory([]);
    renderHistoryList();
    showMsg('历史已清空', 'success');
  }

  function formatDate(dateStr) {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now - d;
    const days = Math.floor(diff / 86400000);
    if (days === 0) {
      const hrs = Math.floor(diff / 3600000);
      if (hrs === 0) { const mins = Math.floor(diff / 60000); return mins <= 0 ? '刚刚' : `${mins}分钟前`; }
      return `${hrs}小时前`;
    }
    if (days === 1) return '昨天';
    if (days < 7) return `${days}天前`;
    return d.toLocaleDateString('zh-CN');
  }

  // ============================================================
  //  统计
  // ============================================================
  function renderStats() {
    if (!window.smartRouteManager) {
      statsList.innerHTML = '<div class="empty-state">加载中...</div>';
      return;
    }
    const data = window.smartRouteManager.getRouteStatsInfo();
    const hasData = data.some((s) => s.totalTests > 0);
    if (!hasData) {
      statsList.innerHTML = '<div class="empty-state">暂无数据<br><small>使用解析后这里会显示线路性能</small></div>';
      return;
    }
    statsList.innerHTML = data.map((s) => {
      const color = s.successRate >= 80 ? '#48bb78' : s.successRate >= 50 ? '#ed8936' : '#f56565';
      return `
        <div class="stats-item">
          <div class="stats-item-header">
            <span class="stats-item-name">${s.name}</span>
            <span class="stats-item-rate" style="color:${color}">${s.successRate}%</span>
          </div>
          <div class="stats-detail"><span class="stats-label">响应时间</span><span class="stats-value">${s.avgResponseTime}ms</span></div>
          <div class="stats-detail"><span class="stats-label">测试次数</span><span class="stats-value">${s.totalTests}</span></div>
          <div class="stats-detail"><span class="stats-label">最后使用</span><span class="stats-value">${s.lastUsed ? formatDate(s.lastUsed) : '从未'}</span></div>
        </div>
      `;
    }).join('');
  }

  function clearStats() {
    if (window.smartRouteManager) {
      window.smartRouteManager.routeStats = {};
      window.smartRouteManager.saveRouteStats();
      renderStats();
      showMsg('统计数据已清空', 'success');
    }
  }

  // ============================================================
  //  抽屉
  // ============================================================
  function toggleDrawer(open, close) {
    const isOpen = !open.classList.contains('hidden');
    open.classList.toggle('hidden');
    if (close) close.classList.add('hidden');
    if (open === statsDrawer && !isOpen) renderStats();
  }

  // ============================================================
  //  消息
  // ============================================================
  function showMsg(text, type) {
    const el = document.createElement('div');
    el.className = `message msg-${type}`;
    el.textContent = text;
    msgContainer.appendChild(el);
    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transition = 'opacity .3s';
      setTimeout(() => { if (msgContainer.contains(el)) msgContainer.removeChild(el); }, 300);
    }, 3000);
  }

  // ============================================================
  //  智能线路检测 UI（多窗口视频墙）
  // ============================================================
  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

  class RouteTestUI {
    constructor() {
      this.modal = document.getElementById('routeTestModal');
      this.gridEl = document.getElementById('rtGrid');
      this.statusEl = document.getElementById('rtStatus');
      this.cancelBtn = document.getElementById('rtCancelBtn');
      this.tileMap = new Map();
      this.frameMap = new Map();
      this.selected = false;
      this._animating = false;
      this._resolveRun = null;

      this.cancelBtn.addEventListener('click', () => this._cancel());
    }

    _cancel() {
      if (window.smartRouteManager) window.smartRouteManager.cancelAllTests();
      this.hide();
      if (this._resolveRun) { const cb = this._resolveRun; this._resolveRun = null; cb(null); }
    }

    // 手动选择线路 / 降级兜底时，复用同一套弹窗展现单个结果
    //   headerName：线路名；buildFn(htmlContainer) 负责填充内容
    showManualResult(apiUrl, headerName, buildFn) {
      if (window.smartRouteManager) window.smartRouteManager.cancelAllTests();
      this.hide();
      this.gridEl.innerHTML = '';
      this.tileMap.clear();
      this.frameMap.clear();

      this.modal.classList.remove('hidden');
      this.statusEl.textContent = headerName || '解析结果';
      this.cancelBtn.textContent = '关闭';
      this.cancelBtn.onclick = () => this.hide();

      const tile = document.createElement('div');
      tile.className = 'rt-tile expanded';
      tile.style.position = 'fixed';
      tile.style.inset = '0';
      tile.style.borderRadius = '0';

      tile.innerHTML =
        '<div class="rt-tile-top">' +
          '<span class="rt-tile-name">' + (headerName || '解析结果') + '</span>' +
          '<span class="rt-tile-status">已选中</span>' +
          '<span class="rt-tile-badge">🎯 最优</span>' +
        '</div>' +
        '<div class="rt-tile-video"><iframe sandbox="allow-scripts allow-same-origin" src="' + apiUrl + '"></iframe></div>';

      const box = document.createElement('div');
      box.className = 'rt-short-result';
      tile.appendChild(box);
      this.gridEl.appendChild(tile);
      this.tileMap.set(apiUrl, { el: tile });

      buildFn(box, apiUrl);
    }

    async run(apis, testFn, onDone) {
      if (window.smartRouteManager) window.smartRouteManager.cancelAllTests();
      this.hide();
      this.gridEl.innerHTML = '';
      this.tileMap.clear();
      this.frameMap.clear();

      return new Promise(async (resolve) => {
        this._resolveRun = resolve;
        this._onDone = onDone;
        this.selected = false;
        this._animating = false;

        this.modal.classList.remove('hidden');
        this.statusEl.textContent = '并行测试 ' + apis.length + ' 个接口...';
        this.cancelBtn.textContent = '取消';
        this.cancelBtn.onclick = () => this._cancel();

        apis.forEach((api, i) => {
          const tile = this._createTile(api, i);
          this.gridEl.appendChild(tile);
        });

        await sleep(150);

        try {
          const testResult = await testFn(
            (event) => this._handleProgress(event),
            this.frameMap
          );
          if (!this.selected) {
            if (testResult && testResult.success) {
              await this._animateExpand(testResult.api, testResult);
            } else {
              this.statusEl.textContent = '未找到可用线路';
              await sleep(1000);
              this.hide();
              resolve(null);
            }
          }
        } catch (err) {
          this.statusEl.textContent = '检测异常: ' + (err.message || '未知');
          await sleep(800);
          this.hide();
          resolve(null);
        }
      });
    }

    _createTile(api, index) {
      const tile = document.createElement('div');
      tile.className = 'rt-tile';
      tile.dataset.url = api.url;

      tile.innerHTML =
        '<div class="rt-tile-top">' +
          '<span class="rt-tile-name">' + api.name + '</span>' +
          '<span class="rt-tile-status">连接中</span>' +
          '<span class="rt-tile-time">-</span>' +
        '</div>' +
        '<div class="rt-tile-video">' +
          '<iframe sandbox="allow-scripts allow-same-origin" loading="lazy"></iframe>' +
          '<div class="rt-tile-shimmer"></div>' +
        '</div>' +
        '<div class="rt-tile-badge">检测中</div>';

      tile.style.opacity = '0';
      tile.style.transform = 'scale(0.85) translateY(12px)';
      setTimeout(() => {
        tile.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
        tile.style.opacity = '1';
        tile.style.transform = 'scale(1) translateY(0)';
      }, 40 + index * 50);

      const iframe = tile.querySelector('iframe');
      this.frameMap.set(api.url, iframe);
      this.tileMap.set(api.url, {
        el: tile,
        iframe,
        statusEl: tile.querySelector('.rt-tile-status'),
        timeEl: tile.querySelector('.rt-tile-time'),
        badgeEl: tile.querySelector('.rt-tile-badge'),
      });

      return tile;
    }

    _handleProgress(event) {
      if (this.selected) return;
      const entry = this.tileMap.get(event.api?.url);
      if (!entry) return;
      const { el, statusEl, timeEl, badgeEl } = entry;

      switch (event.type) {
        case 'l1_start':
          statusEl.textContent = '连接中';
          badgeEl.textContent = '连通测试';
          break;

        case 'l1_ok':
          el.classList.add('l1-pass');
          statusEl.textContent = '已连通';
          timeEl.textContent = event.responseTime + 'ms';
          badgeEl.textContent = '连通 ✓';
          const s1 = el.querySelector('.rt-tile-shimmer');
          if (s1) s1.closest('.rt-tile-video').classList.add('shimmer-done');
          break;

        case 'l1_fail':
          statusEl.textContent = event.error || '超时';
          timeEl.textContent = event.responseTime + 'ms';
          badgeEl.textContent = '✗ 失败';
          el.classList.add('eliminated');
          const s2 = el.querySelector('.rt-tile-shimmer');
          if (s2) s2.parentElement.classList.add('shimmer-done');
          break;

        case 'l2_start':
          statusEl.textContent = event.responseType === 'json' ? '解析数据' : '验证内容';
          badgeEl.textContent = '内容验证';
          break;

        case 'l2_ok':
          el.classList.add('l2-pass');
          timeEl.textContent = event.responseTime + 'ms';
          if (event.realPlayable) {
            statusEl.textContent = '实测可播放';
            badgeEl.textContent = '✓ 实测';
          } else {
            statusEl.textContent = '验证通过';
            badgeEl.textContent = '验证 ✓';
          }
          break;

        case 'l2_fail':
          if (event.inconclusive) {
            statusEl.textContent = '内容不可验证';
            badgeEl.textContent = '⚠ 未知';
          } else {
            statusEl.textContent = event.reason || '验证失败';
            badgeEl.textContent = '✗';
            el.classList.add('eliminated');
          }
          break;

        case 'selected':
          this.selected = true;
          this._animateExpand(event.api, event.result);
          return;
      }
    }

    async _animateExpand(api, result) {
      if (this._animating) return;
      this._animating = true;

      const entry = this.tileMap.get(api.url);

      this.statusEl.textContent = '🎯 已选择: ' + api.name;
      this.cancelBtn.textContent = '关闭';
      this.cancelBtn.onclick = () => { this.hide(); this._onDone?.(result); this._resolveRun?.(result); };

      if (entry) {
        entry.el.classList.remove('eliminated');
        entry.el.classList.add('selected');
        entry.statusEl.textContent = '已选中';
        entry.badgeEl.textContent = '🎯 最优';
        if (result && result.realPlayable) {
          entry.badgeEl.textContent = '✅ 实测可播';
          if (result.duration) {
            entry.statusEl.textContent = '✅ 可播 ' + window.videoInfoExtractor.formatDuration(result.duration);
          }
        }
        const s3 = entry.el.querySelector('.rt-tile-shimmer');
        if (s3) s3.parentElement.classList.add('shimmer-done');

        this.tileMap.forEach((t, url) => {
          if (url !== api.url) t.el.classList.add('eliminated');
        });

        await sleep(350);

        this.gridEl.style.transition = 'grid-template-columns 0.5s ease, gap 0.5s ease';
        this.gridEl.style.gridTemplateColumns = '1fr';
        this.gridEl.style.gap = '0';
        entry.el.style.aspectRatio = 'unset';
        entry.el.style.borderRadius = '0';
        entry.el.style.borderWidth = '3px';
        entry.el.classList.add('expanded');

        await sleep(550);
      }

      this._onDone?.(result);
      this._resolveRun?.(result);
    }

    hide() {
      this.modal.classList.add('hidden');
      this.modal.style.opacity = '';
      this.modal.style.transform = '';
      this.gridEl.innerHTML = '';
      this.tileMap.clear();
      this.frameMap.clear();
      this.selected = false;
      this._animating = false;
      this.gridEl.style.gridTemplateColumns = '';
      this.gridEl.style.gap = '';
      this.gridEl.style.transition = '';
      this.cancelBtn.textContent = '取消';
      this.cancelBtn.onclick = () => this._cancel();
    }
  }

  // ============================================================
  //  Boot
  // ============================================================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

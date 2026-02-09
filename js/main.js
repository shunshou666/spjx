// 视频解析主要功能
(function() {
    'use strict';

    // DOM 元素
    const videoUrlInput = document.getElementById('videoUrl');
    const parseApiSelect = document.getElementById('parseApi');
    const parseBtn = document.getElementById('parseBtn');
    const playerContainer = document.getElementById('playerContainer');
    const videoPlayer = document.getElementById('videoPlayer');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const refreshBtn = document.getElementById('refreshBtn');
    const closeBtn = document.getElementById('closeBtn');
    const toggleHistoryBtn = document.getElementById('toggleHistoryBtn');
    const historyContainer = document.getElementById('historyContainer');
    const historyList = document.getElementById('historyList');
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');
    const toggleStatsBtn = document.getElementById('toggleStatsBtn');
    const statsContainer = document.getElementById('statsContainer');
    const statsList = document.getElementById('statsList');
    const clearStatsBtn = document.getElementById('clearStatsBtn');
    const videoTitle = document.getElementById('videoTitle');
    const videoEpisode = document.getElementById('videoEpisode');

    // 当前视频信息
    let currentVideoInfo = null;
    let currentVideoUrl = '';
    let currentParseApi = '';

    // 初始化解析线路
    function initializeParseApis() {
        // 清空现有选项
        parseApiSelect.innerHTML = '';
        
        // 添加自动选择线路选项
        const smartOption = document.createElement('option');
        smartOption.value = 'smart';
        smartOption.textContent = '🚀 自动选择线路';
        smartOption.selected = true;
        parseApiSelect.appendChild(smartOption);
        
        // 从 PARSE_APIS 数组添加选项
        PARSE_APIS.forEach(api => {
            const option = document.createElement('option');
            option.value = api.url;
            option.textContent = api.name;
            parseApiSelect.appendChild(option);
        });
    }

    // 初始化
    function init() {
        // 初始化解析线路
        initializeParseApis();

        // 绑定事件
        parseBtn.addEventListener('click', handleParse);
        videoUrlInput.addEventListener('keypress', handleKeyPress);
        refreshBtn.addEventListener('click', refreshVideo);
        closeBtn.addEventListener('click', closePlayer);
        toggleHistoryBtn.addEventListener('click', toggleHistory);
        clearHistoryBtn.addEventListener('click', clearHistory);
        toggleStatsBtn.addEventListener('click', toggleStats);
        clearStatsBtn.addEventListener('click', clearStats);

        // 加载历史记录
        loadHistoryFromStorage();
        renderHistoryList();

        // 从 URL 参数获取视频地址（如果有）
        const urlParams = new URLSearchParams(window.location.search);
        const urlFromParam = urlParams.get('url');
        if (urlFromParam) {
            videoUrlInput.value = decodeURIComponent(urlFromParam);
            handleParse();
        }
    }

    // 处理回车键
    function handleKeyPress(e) {
        if (e.key === 'Enter') {
            handleParse();
        }
    }

    // 验证 URL
    function isValidUrl(string) {
        try {
            const url = new URL(string);
            return url.protocol === 'http:' || url.protocol === 'https:';
        } catch (_) {
            return false;
        }
    }

    // 检查是否为支持的视频平台
    function isSupportedPlatform(url) {
        const supportedDomains = [
            'iqiyi.com',
            'qq.com',
            'youku.com',
            'mgtv.com',
            'sohu.com',
            'le.com',
            'pptv.com',
            '1905.com',
            'ixigua.com',
            'bilibili.com',
            'acfun.cn',
            'tudou.com'
        ];

        return supportedDomains.some(domain => url.includes(domain));
    }

    // 从URL提取视频标题和集数
    async function extractVideoInfo(url) {
        try {
            // 使用新的视频信息提取器
            if (window.videoInfoExtractor) {
                const info = await window.videoInfoExtractor.extractVideoInfo(url);
                return {
                    title: info.title || '视频播放',
                    episode: info.episode || '',
                    duration: info.duration,
                    platform: info.platform
                };
            }
        } catch (error) {
            console.error('提取视频信息失败:', error);
        }

        // 回退到原来的简单提取方法
        let title = '视频播放';
        let episode = '';

        try {
            // 解析URL
            const urlObj = new URL(url);
            const hostname = urlObj.hostname;
            
            // 尝试从URL提取信息
            const pathname = urlObj.pathname;
            const search = urlObj.search;
            
            // 尝试从URL中提取剧集信息
            const episodeMatch = pathname.match(/(第)?(\d+)集/);
            if (episodeMatch) {
                episode = `第${episodeMatch[2] || episodeMatch[1]}集`;
            }
            
            // 尝试提取剧集数字
            const numberMatch = pathname.match(/[\?&](ep|episode|num)=(\d+)/i);
            if (numberMatch && numberMatch[2]) {
                episode = `第${numberMatch[2]}集`;
            }

            // 从URL中提取可能的标题
            const segments = pathname.split('/').filter(s => s);
            if (segments.length > 0) {
                const lastSegment = segments[segments.length - 1];
                // 移除数字后缀
                title = lastSegment.replace(/[-_]?\d+集?$/, '');
                title = title.replace(/[-_]/g, ' ');
                // 只取合理长度的标题
                if (title.length > 50) {
                    title = title.substring(0, 50) + '...';
                }
            }

            // 如果标题太短或无意义，使用默认值
            if (!title || title.length < 2) {
                title = '视频播放';
            }
        } catch (e) {
            // 解析失败，使用默认值
        }

        return { title, episode, duration: null, platform: 'unknown' };
    }

    // 处理解析
    async function handleParse() {
        const videoUrl = videoUrlInput.value.trim();
        const parseApi = parseApiSelect.value;

        // 验证 URL
        if (!videoUrl) {
            showMessage('请输入视频地址', 'error');
            return;
        }

        if (!isValidUrl(videoUrl)) {
            showMessage('请输入有效的视频地址', 'error');
            return;
        }

        // 提取视频信息
        const videoInfo = await extractVideoInfo(videoUrl);
        currentVideoInfo = videoInfo;
        currentVideoUrl = videoUrl;

        // 保存到历史记录
        saveToHistory(videoUrl, videoInfo);

        // 更新播放器标题
        updatePlayerTitle(videoInfo);

        // 显示加载状态
        showLoading();

        try {
            if (parseApi === 'smart') {
                // 使用智能路由
                await handleSmartParse(videoUrl);
            } else {
                // 使用指定线路
                currentParseApi = parseApi;
                setTimeout(() => {
                    loadVideo(parseApi + encodeURIComponent(videoUrl));
                }, 300);
            }
        } catch (error) {
            loadingOverlay.classList.add('hidden');
            showMessage('解析失败，请尝试手动选择线路', 'error');
            console.error('解析失败:', error);
        }
    }

    // 智能解析处理
    async function handleSmartParse(videoUrl) {
        try {
            showMessage('🔍 正在智能检测最佳线路...', 'info');
            
            // 使用智能路由管理器找到最佳线路
            const result = await window.smartRouteManager.findBestRoute(videoUrl);
            
            if (result.success) {
                currentParseApi = result.api.url;
                showMessage(`✅ 已选择最佳线路：${result.api.name}（响应时间：${result.responseTime}ms）`, 'success');
                
                // 延迟一点时间让用户看到消息
                setTimeout(() => {
                    loadVideo(result.url);
                }, 800);
            } else {
                // 即使测试失败，也尝试使用该线路
                currentParseApi = result.api.url;
                showMessage(`⚠️ 使用线路：${result.api.name}（其他线路可能更慢）`, 'warning');
                
                setTimeout(() => {
                    loadVideo(result.url);
                }, 800);
            }
        } catch (error) {
            // 智能路由失败，回退到第一个线路
            const fallbackApi = PARSE_APIS[0];
            currentParseApi = fallbackApi.url;
            showMessage('智能路由检测失败，使用默认线路', 'warning');
            
            setTimeout(() => {
                loadVideo(fallbackApi.url + encodeURIComponent(videoUrl));
            }, 300);
        }
    }

    // 更新播放器标题
    function updatePlayerTitle(videoInfo) {
        videoTitle.textContent = videoInfo.title;
        
        if (videoInfo.episode) {
            videoEpisode.textContent = videoInfo.episode;
            videoEpisode.classList.remove('hidden');
        } else {
            videoEpisode.classList.add('hidden');
        }

        // 显示时长信息（如果有）
        if (videoInfo.duration) {
            let durationDisplay = document.getElementById('videoDuration');
            if (!durationDisplay) {
                durationDisplay = document.createElement('div');
                durationDisplay.id = 'videoDuration';
                durationDisplay.className = 'video-duration';
                
                // 插入到播放器信息区域
                const playerInfo = document.querySelector('.player-info');
                if (playerInfo) {
                    playerInfo.appendChild(durationDisplay);
                }
            }
            durationDisplay.textContent = `时长: ${videoInfo.duration}`;
        }
    }

    // 刷新视频
    function refreshVideo() {
        if (!currentVideoUrl) {
            showMessage('没有正在播放的视频', 'warning');
            return;
        }

        showLoading();
        setTimeout(() => {
            loadVideo(currentParseApi + encodeURIComponent(currentVideoUrl));
        }, 300);
    }

    // 显示加载状态
    function showLoading() {
        const originalText = parseBtn.querySelector('.btn-text').textContent;
        parseBtn.querySelector('.btn-text').innerHTML = '<span class="loading"></span>';
        parseBtn.disabled = true;

        // 显示播放器并显示加载动画
        playerContainer.classList.remove('hidden');
        loadingOverlay.classList.remove('hidden');

        // 平滑滚动到播放器
        setTimeout(() => {
            playerContainer.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'nearest' 
            });
        }, 100);

        // 恢复按钮状态
        setTimeout(() => {
            parseBtn.querySelector('.btn-text').textContent = originalText;
            parseBtn.disabled = false;
        }, 500);
    }

    // 加载视频
    function loadVideo(url) {
        try {
            videoPlayer.src = url;
            
            // 监听视频加载完成
            videoPlayer.onload = function() {
                // 延迟一点时间确保视频加载好再隐藏加载动画
                setTimeout(() => {
                    loadingOverlay.classList.add('hidden');
                    showMessage('解析成功，开始播放', 'success');
                    
                    // 尝试获取视频信息
                    tryGetVideoInfo();
                }, 800);
            };

            // 监听视频加载错误
            videoPlayer.onerror = function() {
                loadingOverlay.classList.add('hidden');
                showMessage('当前线路解析失败，请尝试切换其他线路', 'error');
            };
        } catch (error) {
            loadingOverlay.classList.add('hidden');
            showMessage('解析失败，请尝试切换其他线路', 'error');
            console.error('加载视频失败:', error);
        }
    }

    // 尝试获取视频信息（时长等）
    function tryGetVideoInfo() {
        try {
            // 尝试从iframe中获取视频信息
            const iframe = videoPlayer;
            
            // 设置一个定时器来检查视频信息
            let attempts = 0;
            const maxAttempts = 10;
            
            const checkVideoInfo = () => {
                attempts++;
                
                try {
                    // 尝试访问iframe内容（可能会因为跨域限制失败）
                    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                    const videoElement = iframeDoc.querySelector('video');
                    
                    if (videoElement && videoElement.duration && !isNaN(videoElement.duration)) {
                        const duration = formatDuration(videoElement.duration);
                        updateVideoInfo({
                            duration: duration,
                            currentTime: formatDuration(videoElement.currentTime || 0)
                        });
                        
                        // 监听时间更新
                        videoElement.addEventListener('timeupdate', () => {
                            updateVideoInfo({
                                duration: formatDuration(videoElement.duration),
                                currentTime: formatDuration(videoElement.currentTime)
                            });
                        });
                        
                        return; // 成功获取，停止尝试
                    }
                } catch (e) {
                    // 跨域限制，无法访问iframe内容
                    console.log('无法访问iframe内容（跨域限制）');
                }
                
                // 如果还没有达到最大尝试次数，继续尝试
                if (attempts < maxAttempts) {
                    setTimeout(checkVideoInfo, 1000);
                } else {
                    console.log('无法获取视频时长信息');
                }
            };
            
            // 开始检查
            setTimeout(checkVideoInfo, 2000);
            
        } catch (error) {
            console.error('获取视频信息失败:', error);
        }
    }

    // 格式化时长
    function formatDuration(seconds) {
        if (!seconds || isNaN(seconds)) return '00:00';
        
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        
        if (hours > 0) {
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        } else {
            return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
    }

    // 更新视频信息显示
    function updateVideoInfo(info) {
        if (info.duration) {
            // 在播放器工具栏中显示时长信息
            let durationDisplay = document.getElementById('videoDuration');
            if (!durationDisplay) {
                durationDisplay = document.createElement('div');
                durationDisplay.id = 'videoDuration';
                durationDisplay.className = 'video-duration';
                
                // 插入到播放器信息区域
                const playerInfo = document.querySelector('.player-info');
                if (playerInfo) {
                    playerInfo.appendChild(durationDisplay);
                }
            }
            
            if (info.currentTime && info.duration !== '00:00') {
                durationDisplay.textContent = `${info.currentTime} / ${info.duration}`;
            } else if (info.duration !== '00:00') {
                durationDisplay.textContent = `时长: ${info.duration}`;
            }
        }
    }

    // 关闭播放器
    function closePlayer() {
        playerContainer.classList.add('hidden');
        videoPlayer.src = '';
        currentVideoUrl = '';
        currentVideoInfo = null;
        
        // 滚动回顶部
        window.scrollTo({ 
            top: 0, 
            behavior: 'smooth' 
        });
    }

    // 历史记录功能
    function saveToHistory(url, videoInfo) {
        let history = getHistoryFromStorage();
        
        // 检查是否已存在
        const existingIndex = history.findIndex(item => item.url === url);
        if (existingIndex !== -1) {
            // 更新时间
            history[existingIndex].lastWatch = new Date().toISOString();
        } else {
            // 添加新记录
            history.unshift({
                url: url,
                title: videoInfo.title,
                episode: videoInfo.episode,
                note: '',
                lastWatch: new Date().toISOString()
            });
            
            // 最多保留20条记录
            if (history.length > 20) {
                history = history.slice(0, 20);
            }
        }
        
        saveHistoryToStorage(history);
        renderHistoryList();
    }

    function getHistoryFromStorage() {
        try {
            const history = localStorage.getItem('videoHistory');
            return history ? JSON.parse(history) : [];
        } catch (e) {
            return [];
        }
    }

    function loadHistoryFromStorage() {
        // 在这里可以做一些历史记录的初始化工作
    }

    function saveHistoryToStorage(history) {
        try {
            localStorage.setItem('videoHistory', JSON.stringify(history));
        } catch (e) {
            console.error('保存历史记录失败:', e);
        }
    }

    function renderHistoryList() {
        const history = getHistoryFromStorage();
        
        if (history.length === 0) {
            historyList.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 20px;">暂无观看历史</p>';
            return;
        }

        historyList.innerHTML = history.map((item, index) => {
            const date = new Date(item.lastWatch);
            const dateStr = formatDate(date);
            const episodeHtml = item.episode 
                ? `<div class="history-item-episode">${item.episode}</div>` 
                : '';
            const note = item.note || '';
            
            return `
                <div class="history-item">
                    <div class="history-item-main" onclick="window.videoParser.playFromHistory('${item.url.replace(/'/g, "\\'")}')">
                        <div class="history-item-title">${item.title}</div>
                        ${episodeHtml}
                        <div class="history-item-time">${dateStr}</div>
                    </div>
                    <div class="history-item-note">
                        <input 
                            type="text" 
                            class="note-input" 
                            placeholder="添加备注，如：第3集" 
                            value="${note}"
                            data-index="${index}"
                            onchange="window.videoParser.updateNote(${index}, this.value)"
                        >
                    </div>
                </div>
            `;
        }).join('');
    }

    function updateNote(index, note) {
        const history = getHistoryFromStorage();
        if (history[index]) {
            history[index].note = note;
            saveHistoryToStorage(history);
            showMessage('备注已更新', 'success');
        }
    }

    function formatDate(date) {
        const now = new Date();
        const diff = now - date;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        
        if (days === 0) {
            const hours = Math.floor(diff / (1000 * 60 * 60));
            if (hours === 0) {
                const minutes = Math.floor(diff / (1000 * 60));
                return minutes <= 0 ? '刚刚' : `${minutes}分钟前`;
            }
            return `${hours}小时前`;
        } else if (days === 1) {
            return '昨天';
        } else if (days < 7) {
            return `${days}天前`;
        } else {
            return date.toLocaleDateString('zh-CN');
        }
    }

    function clearHistory() {
        if (confirm('确定要清空所有观看历史吗？')) {
            saveHistoryToStorage([]);
            renderHistoryList();
            showMessage('历史记录已清空', 'success');
        }
    }

    function toggleHistory() {
        historyContainer.classList.toggle('hidden');
        // 隐藏统计容器
        statsContainer.classList.add('hidden');
        
        if (!historyContainer.classList.contains('hidden')) {
            // 滚动到历史记录
            setTimeout(() => {
                historyContainer.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'nearest' 
                });
            }, 100);
        }
    }

    function toggleStats() {
        statsContainer.classList.toggle('hidden');
        // 隐藏历史容器
        historyContainer.classList.add('hidden');
        
        if (!statsContainer.classList.contains('hidden')) {
            renderStatsList();
            // 滚动到统计信息
            setTimeout(() => {
                statsContainer.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'nearest' 
                });
            }, 100);
        }
    }

    function renderStatsList() {
        if (!window.smartRouteManager) {
            statsList.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 20px;">统计数据加载中...</p>';
            return;
        }

        const stats = window.smartRouteManager.getRouteStatsInfo();
        
        if (stats.length === 0 || stats.every(s => s.totalTests === 0)) {
            statsList.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 20px;">暂无统计数据<br><small>使用智能路由后会显示各线路的性能统计</small></p>';
            return;
        }

        statsList.innerHTML = stats.map((stat, index) => {
            const lastUsedText = stat.lastUsed ? formatDate(new Date(stat.lastUsed)) : '从未使用';
            const successRateColor = stat.successRate >= 80 ? '#48bb78' : 
                                   stat.successRate >= 50 ? '#ed8936' : '#f56565';
            
            return `
                <div class="stats-item">
                    <div class="stats-item-header">
                        <div class="stats-item-name">${stat.name}</div>
                        <div class="stats-item-rate" style="color: ${successRateColor}">
                            ${stat.successRate}%
                        </div>
                    </div>
                    <div class="stats-item-details">
                        <div class="stats-detail">
                            <span class="stats-label">响应时间:</span>
                            <span class="stats-value">${stat.avgResponseTime}ms</span>
                        </div>
                        <div class="stats-detail">
                            <span class="stats-label">测试次数:</span>
                            <span class="stats-value">${stat.totalTests}</span>
                        </div>
                        <div class="stats-detail">
                            <span class="stats-label">最后使用:</span>
                            <span class="stats-value">${lastUsedText}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    function clearStats() {
        if (confirm('确定要清空所有线路统计数据吗？')) {
            if (window.smartRouteManager) {
                window.smartRouteManager.routeStats = {};
                window.smartRouteManager.saveRouteStats();
                renderStatsList();
                showMessage('统计数据已清空', 'success');
            }
        }
    }

    function playFromHistory(url) {
        videoUrlInput.value = url;
        handleParse();
        historyContainer.classList.add('hidden');
    }

    // 显示消息提示
    function showMessage(message, type = 'info') {
        // 创建消息元素
        const messageEl = document.createElement('div');
        messageEl.className = `message message-${type}`;
        messageEl.textContent = message;
        
        // 添加样式
        Object.assign(messageEl.style, {
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '12px 24px',
            borderRadius: '8px',
            color: 'white',
            fontSize: '14px',
            fontWeight: '500',
            zIndex: '10000',
            animation: 'slideDown 0.3s ease-out',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
        });

        // 根据类型设置背景色
        const colors = {
            success: '#48bb78',
            error: '#f56565',
            warning: '#ed8936',
            info: '#4299e1'
        };
        messageEl.style.background = colors[type] || colors.info;

        // 添加动画样式
        if (!document.getElementById('message-animation-style')) {
            const style = document.createElement('style');
            style.id = 'message-animation-style';
            style.textContent = `
                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateX(-50%) translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(-50%) translateY(0);
                    }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(messageEl);

        // 3秒后自动移除
        setTimeout(() => {
            messageEl.style.animation = 'slideDown 0.3s ease-out reverse';
            setTimeout(() => {
                if (document.body.contains(messageEl)) {
                    document.body.removeChild(messageEl);
                }
            }, 300);
        }, 3000);
    }

    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // 添加一些实用工具函数到 window 对象
    window.videoParser = {
        parse: handleParse,
        playFromHistory: playFromHistory,
        updateNote: updateNote
    };
})();

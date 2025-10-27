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
    const videoTitle = document.getElementById('videoTitle');
    const videoEpisode = document.getElementById('videoEpisode');

    // 当前视频信息
    let currentVideoInfo = null;
    let currentVideoUrl = '';
    let currentParseApi = '';

    // 初始化
    function init() {
        // 绑定事件
        parseBtn.addEventListener('click', handleParse);
        videoUrlInput.addEventListener('keypress', handleKeyPress);
        refreshBtn.addEventListener('click', refreshVideo);
        closeBtn.addEventListener('click', closePlayer);
        toggleHistoryBtn.addEventListener('click', toggleHistory);
        clearHistoryBtn.addEventListener('click', clearHistory);

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
    function extractVideoInfo(url) {
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

        return { title, episode };
    }

    // 处理解析
    function handleParse() {
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

        // 显示提示信息
        if (!isSupportedPlatform(videoUrl)) {
            showMessage('当前线路若无法播放，请尝试切换其他线路', 'warning');
        } else {
            showMessage('若当前线路无法播放，请尝试切换其他线路', 'info');
        }

        // 提取视频信息
        const videoInfo = extractVideoInfo(videoUrl);
        currentVideoInfo = videoInfo;
        currentVideoUrl = videoUrl;
        currentParseApi = parseApi;

        // 保存到历史记录
        saveToHistory(videoUrl, videoInfo);

        // 更新播放器标题
        updatePlayerTitle(videoInfo);

        // 显示加载状态
        showLoading();

        // 延迟显示播放器，给用户更好的反馈
        setTimeout(() => {
            loadVideo(parseApi + encodeURIComponent(videoUrl));
        }, 300);
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

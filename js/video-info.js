// 视频信息获取模块
class VideoInfoExtractor {
    constructor() {
        this.videoInfoCache = new Map();
        this.apiEndpoints = [
            // 可以添加一些公开的视频信息API
        ];
    }

    // 从URL尝试提取视频信息
    async extractVideoInfo(originalUrl) {
        try {
            // 尝试从缓存获取
            if (this.videoInfoCache.has(originalUrl)) {
                return this.videoInfoCache.get(originalUrl);
            }

            let videoInfo = {
                title: '视频播放',
                duration: null,
                thumbnail: null,
                description: null,
                platform: this.detectPlatform(originalUrl)
            };

            // 根据不同平台尝试获取信息
            switch (videoInfo.platform) {
                case 'bilibili':
                    videoInfo = await this.getBilibiliInfo(originalUrl) || videoInfo;
                    break;
                case 'iqiyi':
                    videoInfo = await this.getIqiyiInfo(originalUrl) || videoInfo;
                    break;
                case 'qq':
                    videoInfo = await this.getQQVideoInfo(originalUrl) || videoInfo;
                    break;
                case 'youku':
                    videoInfo = await this.getYoukuInfo(originalUrl) || videoInfo;
                    break;
                default:
                    videoInfo = await this.getGenericInfo(originalUrl) || videoInfo;
            }

            // 缓存结果
            this.videoInfoCache.set(originalUrl, videoInfo);
            return videoInfo;

        } catch (error) {
            console.error('提取视频信息失败:', error);
            return {
                title: '视频播放',
                duration: null,
                thumbnail: null,
                description: null,
                platform: 'unknown'
            };
        }
    }

    // 检测视频平台
    detectPlatform(url) {
        const platformMap = {
            'bilibili.com': 'bilibili',
            'iqiyi.com': 'iqiyi',
            'qq.com': 'qq',
            'youku.com': 'youku',
            'mgtv.com': 'mgtv',
            'sohu.com': 'sohu'
        };

        for (const [domain, platform] of Object.entries(platformMap)) {
            if (url.includes(domain)) {
                return platform;
            }
        }
        return 'unknown';
    }

    // 获取B站视频信息
    async getBilibiliInfo(url) {
        try {
            // 从URL提取BV号或AV号
            const bvMatch = url.match(/BV[a-zA-Z0-9]+/);
            const avMatch = url.match(/av(\d+)/);
            
            if (bvMatch || avMatch) {
                // 这里可以调用B站的公开API（如果有的话）
                // 由于跨域限制，实际项目中可能需要后端代理
                return await this.extractFromPageTitle(url);
            }
        } catch (error) {
            console.error('获取B站信息失败:', error);
        }
        return null;
    }

    // 获取爱奇艺视频信息
    async getIqiyiInfo(url) {
        try {
            return await this.extractFromPageTitle(url);
        } catch (error) {
            console.error('获取爱奇艺信息失败:', error);
        }
        return null;
    }

    // 获取腾讯视频信息
    async getQQVideoInfo(url) {
        try {
            return await this.extractFromPageTitle(url);
        } catch (error) {
            console.error('获取腾讯视频信息失败:', error);
        }
        return null;
    }

    // 获取优酷视频信息
    async getYoukuInfo(url) {
        try {
            return await this.extractFromPageTitle(url);
        } catch (error) {
            console.error('获取优酷信息失败:', error);
        }
        return null;
    }

    // 通用信息获取（尝试从页面标题等获取）
    async getGenericInfo(url) {
        try {
            return await this.extractFromPageTitle(url);
        } catch (error) {
            console.error('获取通用信息失败:', error);
        }
        return null;
    }

    // 从页面标题提取信息
    async extractFromPageTitle(url) {
        try {
            // 由于跨域限制，这个方法在实际使用中可能受限
            // 可以考虑使用代理服务器或者浏览器扩展
            
            // 尝试从URL本身提取信息
            const urlInfo = this.parseUrlInfo(url);
            if (urlInfo) {
                return urlInfo;
            }

            return null;
        } catch (error) {
            console.error('从页面标题提取信息失败:', error);
            return null;
        }
    }

    // 从URL解析信息
    parseUrlInfo(url) {
        try {
            const urlObj = new URL(url);
            let title = '视频播放';
            let episode = '';

            // 尝试从URL路径提取信息
            const pathname = urlObj.pathname;
            const searchParams = urlObj.searchParams;

            // 提取可能的标题信息
            const pathSegments = pathname.split('/').filter(s => s);
            if (pathSegments.length > 0) {
                const lastSegment = pathSegments[pathSegments.length - 1];
                // 清理文件扩展名和特殊字符
                title = lastSegment
                    .replace(/\.(html|htm|php)$/, '')
                    .replace(/[-_]/g, ' ')
                    .replace(/\d+$/, '')
                    .trim();
                
                if (title.length < 2 || title.length > 50) {
                    title = '视频播放';
                }
            }

            // 尝试提取集数信息
            const episodeMatch = pathname.match(/(第)?(\d+)集/) || 
                                searchParams.get('episode') || 
                                searchParams.get('ep');
            
            if (episodeMatch) {
                if (typeof episodeMatch === 'string') {
                    episode = `第${episodeMatch}集`;
                } else if (episodeMatch[2]) {
                    episode = `第${episodeMatch[2]}集`;
                }
            }

            return {
                title: title,
                episode: episode,
                duration: null,
                thumbnail: null,
                description: null,
                platform: this.detectPlatform(url)
            };

        } catch (error) {
            console.error('解析URL信息失败:', error);
            return null;
        }
    }

    // 格式化时长
    formatDuration(seconds) {
        if (!seconds || isNaN(seconds)) return null;
        
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        
        if (hours > 0) {
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        } else {
            return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
    }

    // 清除缓存
    clearCache() {
        this.videoInfoCache.clear();
    }
}

// 创建全局实例
window.videoInfoExtractor = new VideoInfoExtractor();
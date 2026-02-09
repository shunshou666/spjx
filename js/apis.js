// 视频解析线路配置
const PARSE_APIS = [
    {
        name: '线路1',
        url: 'http://quanminjiexi.com/jx/?url=',
        priority: 1,
        timeout: 8000
    },
    {
        name: '线路2(可解析bilibili会员视频)',
        url: 'https://jx.playerjy.com/?url=',
        priority: 2,
        timeout: 8000
    },
    {
        name: '线路3',
        url: 'http://player.cmov.cn/?url=',
        priority: 3,
        timeout: 8000
    },
    {
        name: '线路4',
        url: 'https://jx.aidouer.net/?url=',
        priority: 4,
        timeout: 8000
    },
    {
        name: '线路5',
        url: 'https://jx.nnxv.cn/tv.php?url=',
        priority: 5,
        timeout: 8000
    },
    {
        name: '线路6',
        url: 'https://jx.xmflv.com/?url=',
        priority: 6,
        timeout: 8000
    },
    {
        name: '线路7',
        url: 'https://jx.xmflv.cc/?url=',
        priority: 7,
        timeout: 8000
    },
    {
        name: '线路8',
        url: 'https://www.pouyun.com/?url=',
        priority: 8,
        timeout: 8000
    },
    {
        name: '线路9',
        url: 'https://jx.77flv.cc/?url=',
        priority: 9,
        timeout: 8000
    },
    {
        name: '线路10',
        url: 'https://jx.dmflv.cc/?url=',
        priority: 10,
        timeout: 8000
    },
    {
        name: '线路11',
        url: 'https://jx.xymp4.cc/?url=',
        priority: 11,
        timeout: 8000
    },
    {
        name: '线路12',
        url: 'https://jx.mmkv.cn/tv.php?url=',
        priority: 12,
        timeout: 8000
    },
    {
        name: '线路13',
        url: 'https://z1.m1907.top/?jx=',
        priority: 13,
        timeout: 8000
    }
];

// 智能路由管理器
class SmartRouteManager {
    constructor() {
        this.routeStats = this.loadRouteStats();
        this.testResults = new Map();
        this.abortControllers = new Map();
    }

    // 加载线路统计数据
    loadRouteStats() {
        try {
            const stats = localStorage.getItem('routeStats');
            return stats ? JSON.parse(stats) : {};
        } catch (e) {
            return {};
        }
    }

    // 保存线路统计数据
    saveRouteStats() {
        try {
            localStorage.setItem('routeStats', JSON.stringify(this.routeStats));
        } catch (e) {
            console.error('保存线路统计失败:', e);
        }
    }

    // 更新线路统计
    updateRouteStats(apiUrl, success, responseTime) {
        if (!this.routeStats[apiUrl]) {
            this.routeStats[apiUrl] = {
                successCount: 0,
                failCount: 0,
                avgResponseTime: 0,
                lastUsed: 0,
                totalTests: 0
            };
        }

        const stats = this.routeStats[apiUrl];
        stats.totalTests++;
        stats.lastUsed = Date.now();

        if (success) {
            stats.successCount++;
            // 计算平均响应时间
            stats.avgResponseTime = (stats.avgResponseTime * (stats.successCount - 1) + responseTime) / stats.successCount;
        } else {
            stats.failCount++;
        }

        this.saveRouteStats();
    }

    // 获取线路成功率
    getSuccessRate(apiUrl) {
        const stats = this.routeStats[apiUrl];
        if (!stats || stats.totalTests === 0) return 0;
        return stats.successCount / stats.totalTests;
    }

    // 获取排序后的线路（基于成功率和响应时间）
    getSortedRoutes() {
        return PARSE_APIS.slice().sort((a, b) => {
            const aStats = this.routeStats[a.url] || {};
            const bStats = this.routeStats[b.url] || {};
            
            const aSuccessRate = this.getSuccessRate(a.url);
            const bSuccessRate = this.getSuccessRate(b.url);
            
            // 优先考虑成功率
            if (aSuccessRate !== bSuccessRate) {
                return bSuccessRate - aSuccessRate;
            }
            
            // 成功率相同时考虑响应时间
            const aResponseTime = aStats.avgResponseTime || 999999;
            const bResponseTime = bStats.avgResponseTime || 999999;
            
            if (aResponseTime !== bResponseTime) {
                return aResponseTime - bResponseTime;
            }
            
            // 最后按优先级排序
            return a.priority - b.priority;
        });
    }

    // 测试单个线路
    async testRoute(api, videoUrl, timeout = 8000) {
        const startTime = Date.now();
        const controller = new AbortController();
        const testUrl = api.url + encodeURIComponent(videoUrl);
        
        this.abortControllers.set(api.url, controller);

        try {
            // 创建一个隐藏的iframe来测试
            const testFrame = document.createElement('iframe');
            testFrame.style.display = 'none';
            testFrame.style.position = 'absolute';
            testFrame.style.left = '-9999px';
            testFrame.src = testUrl;
            
            document.body.appendChild(testFrame);

            // 设置超时
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => {
                    reject(new Error('timeout'));
                }, timeout);
            });

            // 监听iframe加载
            const loadPromise = new Promise((resolve, reject) => {
                const timeoutId = setTimeout(() => {
                    reject(new Error('load timeout'));
                }, timeout);

                testFrame.onload = () => {
                    clearTimeout(timeoutId);
                    try {
                        // 检查iframe是否成功加载内容
                        const responseTime = Date.now() - startTime;
                        resolve({
                            api,
                            success: true,
                            responseTime,
                            url: testUrl
                        });
                    } catch (e) {
                        reject(e);
                    }
                };

                testFrame.onerror = () => {
                    clearTimeout(timeoutId);
                    reject(new Error('load error'));
                };
            });

            const result = await Promise.race([loadPromise, timeoutPromise]);
            
            // 清理测试iframe
            setTimeout(() => {
                if (document.body.contains(testFrame)) {
                    document.body.removeChild(testFrame);
                }
            }, 1000);

            return result;

        } catch (error) {
            const responseTime = Date.now() - startTime;
            return {
                api,
                success: false,
                responseTime,
                error: error.message,
                url: testUrl
            };
        } finally {
            this.abortControllers.delete(api.url);
        }
    }

    // 并发测试所有线路，返回最快的可用线路
    async findBestRoute(videoUrl, maxConcurrent = 5) {
        const sortedRoutes = this.getSortedRoutes();
        this.testResults.clear();

        return new Promise((resolve, reject) => {
            let completedTests = 0;
            let hasResolved = false;
            const results = [];

            // 分批并发测试
            const testBatch = async (routes) => {
                const promises = routes.map(api => 
                    this.testRoute(api, videoUrl, api.timeout || 8000)
                        .then(result => {
                            this.updateRouteStats(result.api.url, result.success, result.responseTime);
                            results.push(result);
                            completedTests++;

                            // 如果找到第一个成功的线路，立即返回
                            if (result.success && !hasResolved) {
                                hasResolved = true;
                                resolve(result);
                            }

                            // 如果所有测试都完成了但没有成功的
                            if (completedTests === sortedRoutes.length && !hasResolved) {
                                hasResolved = true;
                                // 返回响应时间最短的结果（即使失败）
                                const bestResult = results.sort((a, b) => a.responseTime - b.responseTime)[0];
                                if (bestResult) {
                                    resolve(bestResult);
                                } else {
                                    reject(new Error('所有线路测试失败'));
                                }
                            }
                        })
                        .catch(error => {
                            completedTests++;
                            console.error(`线路 ${api.name} 测试失败:`, error);
                        })
                );

                await Promise.allSettled(promises);
            };

            // 分批执行，避免同时发起太多请求
            const executeBatches = async () => {
                for (let i = 0; i < sortedRoutes.length; i += maxConcurrent) {
                    if (hasResolved) break;
                    const batch = sortedRoutes.slice(i, i + maxConcurrent);
                    await testBatch(batch);
                }
            };

            executeBatches();

            // 设置总体超时
            setTimeout(() => {
                if (!hasResolved) {
                    hasResolved = true;
                    if (results.length > 0) {
                        const bestResult = results.sort((a, b) => a.responseTime - b.responseTime)[0];
                        resolve(bestResult);
                    } else {
                        reject(new Error('所有线路测试超时'));
                    }
                }
            }, 30000); // 30秒总超时
        });
    }

    // 取消所有正在进行的测试
    cancelAllTests() {
        this.abortControllers.forEach(controller => {
            try {
                controller.abort();
            } catch (e) {
                // 忽略取消错误
            }
        });
        this.abortControllers.clear();
    }

    // 获取线路统计信息
    getRouteStatsInfo() {
        return PARSE_APIS.map(api => {
            const stats = this.routeStats[api.url] || {};
            const successRate = this.getSuccessRate(api.url);
            return {
                name: api.name,
                url: api.url,
                successRate: Math.round(successRate * 100),
                avgResponseTime: Math.round(stats.avgResponseTime || 0),
                totalTests: stats.totalTests || 0,
                lastUsed: stats.lastUsed || 0
            };
        }).sort((a, b) => b.successRate - a.successRate);
    }
}

// 创建全局智能路由管理器实例
window.smartRouteManager = new SmartRouteManager();

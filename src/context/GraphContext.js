import React, { createContext, useEffect, useState } from 'react';
import { processGraphData } from '../utils/dataProcessor';

// 导入本地JSON文件
import projectsData from '../data/水利工程.json';
import techsData from '../data/技术.json';
import floodsData from '../data/水灾.json';

// 创建上下文
export const GraphContext = createContext();

export const GraphProvider = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                console.log('正在加载数据...');

                // 直接使用导入的JSON数据
                console.log('数据加载成功:', { projectsData, techsData, floodsData });

                // 处理数据为图谱可用格式
                const processedData = processGraphData(projectsData, techsData, floodsData);
                setGraphData(processedData);
            } catch (err) {
                console.error('处理数据失败', err);
                setError('数据处理失败，请刷新页面重试');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    // 提供筛选数据的方法
    const filterData = (timeRange, searchTerm = '') => {
        if (!graphData.allNodes) return graphData;

        const { start, end } = timeRange;

        // 验证时间范围是否有效
        if (start >= end) {
            console.warn('无效的时间范围：开始时间必须小于结束时间');
            // 当时间范围无效时返回空数据
            return { nodes: [], edges: [] };
        }

        const term = searchTerm.toLowerCase();

        const filteredNodes = graphData.allNodes.filter(node => {
            // 根据时间筛选
            let nodeYear = 0;

            if (node.year) {
                // 处理年份范围 (如 "1276-1293")
                if (node.year.includes('-')) {
                    const [startYear] = node.year.split('-');
                    nodeYear = parseInt(startYear, 10);
                } else {
                    nodeYear = parseInt(node.year, 10);
                }
            } else if (node.period) {
                // 如果有朝代信息，使用朝代中间年份
                if (node.period === '元朝') {
                    nodeYear = 1300; // 元朝中期
                }
                // 可以在这里添加其他朝代的映射
                else if (node.period === '春秋') {
                    nodeYear = -623; // 春秋中期
                }
                else if (node.period === '战国') {
                    nodeYear = -348; // 战国中期
                }
                else if (node.period === '秦朝') {
                    nodeYear = -214; // 秦朝中期
                }
                else if (node.period === '西汉') {
                    nodeYear = -97; // 西汉中期
                }
                else if (node.period === '东汉') {
                    nodeYear = 123; // 东汉中期
                }
                else if (node.period === '三国') {
                    nodeYear = 250; // 三国中期
                }
                else if (node.period === '西晋') {
                    nodeYear = 290; // 西晋中期
                }
                else if (node.period === '东晋') {
                    nodeYear = 368; // 东晋中期
                }
                else if (node.period === '南北朝') {
                    nodeYear = 505; // 南北朝中期
                }
                else if (node.period === '隋朝') {
                    nodeYear = 600; // 隋朝中期
                }
                else if (node.period === '唐朝') {
                    nodeYear = 763; // 唐朝中期
                }
                else if (node.period === '五代十国') {
                    nodeYear = 934; // 五代十国中期
                }
                else if (node.period === '北宋') {
                    nodeYear = 1044; // 北宋中期
                }
                else if (node.period === '南宋') {
                    nodeYear = 1203; // 南宋中期
                }
                else if (node.period === '明朝') {
                    nodeYear = 1506; // 明朝中期
                }
                else if (node.period === '清朝') {
                    nodeYear = 1777; // 清朝中期
                }
            }

            const inTimeRange = isNaN(nodeYear) || (nodeYear >= start && nodeYear <= end);

            // 根据搜索词筛选
            const matchesSearch = !term ||
                node.label?.toLowerCase().includes(term) ||
                node.type?.toLowerCase().includes(term);

            return inTimeRange && matchesSearch;
        });

        // 获取节点ID集合
        const nodeIds = new Set(filteredNodes.map(node => node.id));

        // 过滤边，确保两端节点都存在
        const filteredEdges = graphData.allEdges.filter(edge =>
            nodeIds.has(edge.source) && nodeIds.has(edge.target)
        );

        return {
            nodes: filteredNodes,
            edges: filteredEdges
        };
    };

    return (
        <GraphContext.Provider value={{
            graphData,
            loading,
            error,
            filterData
        }}>
            {children}
        </GraphContext.Provider>
    );
};

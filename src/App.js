// App.js 修复数据加载和时间范围筛选问题
import React, { useState, useEffect, useCallback } from 'react';
import Graph from './components/Graph/Graph';
import { processGraphData } from './utils/dataProcessor';
import { normalizeTimeInfo } from './utils/timeNormalizer';
import './App.css';

// 导入本地JSON数据文件
import waterProjectsData from './data/水利工程.json';
import waterTechnologyData from './data/技术.json';
import waterDisastersData from './data/水灾.json';

const App = () => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [allNodes, setAllNodes] = useState([]);
  const [allEdges, setAllEdges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState({ start: -770, end: 1911 });
  const [timeRangeError, setTimeRangeError] = useState(null);

  // 加载所有数据
  useEffect(() => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('开始加载数据...');

      // 确保数据存在且非空
      if (
          (!waterProjectsData || waterProjectsData.length === 0) &&
          (!waterTechnologyData || waterTechnologyData.length === 0) &&
          (!waterDisastersData || waterDisastersData.length === 0)
      ) {
        throw new Error('所有数据加载失败');
      }

      // 预处理并标准化时间信息
      const normalizedProjects = waterProjectsData.map(item => {
        const timeInfo = normalizeTimeInfo(item);
        return {
          ...item,
          normalizedStartYear: timeInfo.startYear,
          normalizedEndYear: timeInfo.endYear,
          normalizedDynasty: timeInfo.dynasty
        };
      });

      const normalizedTechs = waterTechnologyData.map(item => {
        const timeInfo = normalizeTimeInfo(item);
        return {
          ...item,
          normalizedStartYear: timeInfo.startYear,
          normalizedEndYear: timeInfo.endYear,
          normalizedDynasty: timeInfo.dynasty
        };
      });

      // 对于水灾数据，可能需要特殊处理
      const normalizedDisasters = waterDisastersData.map(item => {
        const timeInfo = normalizeTimeInfo(item);
        return {
          ...item,
          normalizedStartYear: timeInfo.startYear,
          normalizedEndYear: timeInfo.endYear,
          normalizedDynasty: timeInfo.dynasty
        };
      });

      // 处理数据为统一格式
      const graphData = processGraphData(
          normalizedProjects,
          normalizedTechs,
          normalizedDisasters
      );

      if (!graphData.nodes.length) {
        throw new Error('处理后无节点数据');
      }

      // 在设置节点前做一次最终检查
      const finalNodes = graphData.nodes.map(node => {
        // 如果节点缺少标准化时间信息，但原始数据有，则复制过来
        if (
            (node.normalizedStartYear === null || node.normalizedStartYear === undefined) &&
            node.originalData &&
            node.originalData.normalizedStartYear
        ) {
          node.normalizedStartYear = node.originalData.normalizedStartYear;
          node.normalizedEndYear = node.originalData.normalizedEndYear;
          node.normalizedDynasty = node.originalData.normalizedDynasty;
        }
        return node;
      });

      // 更新状态
      setAllNodes(finalNodes);
      setAllEdges(graphData.edges);
      setNodes(finalNodes);
      setEdges(graphData.edges);
      setIsLoading(false);

      console.log('数据加载和处理完成，总节点数:', finalNodes.length);
    } catch (err) {
      console.error('数据加载或处理错误:', err);
      setError(err.message || '未知错误');
      setIsLoading(false);
    }
  }, []);

  // 将朝代转换为代表性年份
  const periodToYear = (period) => {
    const periodMap = {
      '春秋': -623,
      '战国': -348,
      '秦朝': -214,
      '西汉': -97,
      '新朝': 16,
      '东汉': 123,
      '三国': 250,
      '西晋': 290,
      '东晋': 368,
      '南北朝': 505,
      '隋朝': 600,
      '唐朝': 763,
      '五代十国': 934,
      '北宋': 1044,
      '南宋': 1203,
      '元朝': 1300,
      '明朝': 1506,
      '清朝': 1777
    };
    return periodMap[period] || null;
  };

  // 筛选数据的函数 - 使用useCallback确保不会不必要地重新创建
  const getFilteredData = useCallback(() => {
    // 如果时间范围无效，返回空数据
    if (timeRange.start >= timeRange.end) {
      console.log('时间范围无效，返回空数据');
      return { nodes: [], edges: [] };
    }

    console.log(`筛选数据：时间范围 ${timeRange.start} 到 ${timeRange.end}`);
    console.log(`原始节点数量: ${allNodes.length}`);

    // 记录缺少时间信息的节点数量
    let noTimeInfoCount = 0;

    // 根据时间范围筛选节点
    const filteredNodes = allNodes.filter(node => {
      // 使用标准化的时间字段
      if (node.normalizedStartYear !== null && node.normalizedStartYear !== undefined) {
        // 获取节点的起止年份
        const nodeStartYear = node.normalizedStartYear;
        const nodeEndYear = node.normalizedEndYear || nodeStartYear;

        // 策略4: 部分交集法 - 只要有部分交集即可（最宽松的筛选）
        const inRange = !(nodeEndYear < timeRange.start || nodeStartYear > timeRange.end);

        return inRange;
      }

      // 如果没有标准化时间字段，尝试其他方法提取时间信息
      const nodeYear = getNodeYear(node);

      // 如果获取到年份信息，进行范围检查
      if (nodeYear !== null && !isNaN(nodeYear)) {
        return nodeYear >= timeRange.start && nodeYear <= timeRange.end;
      }

      // 对于完全没有时间信息的节点，如果选择了全部或接近全部时间范围，则显示
      const isFullRange = (timeRange.end - timeRange.start) > 2500;
      if (isFullRange) {
        return true;
      }

      // 记录缺少时间信息的节点
      noTimeInfoCount++;

      // 默认不显示没有时间信息的节点，除非是全范围查询
      return false;
    });

    console.log(`筛选后节点数量: ${filteredNodes.length}`);
    console.log(`缺少时间信息的节点数量: ${noTimeInfoCount}`);

    // 获取节点ID集合
    const nodeIds = new Set(filteredNodes.map(node => node.id));

    // 根据筛选的节点筛选边
    const filteredEdges = allEdges.filter(edge => {
      return nodeIds.has(edge.source) && nodeIds.has(edge.target);
    });

    console.log(`筛选后边数量: ${filteredEdges.length}`);

    return { nodes: filteredNodes, edges: filteredEdges };
  }, [timeRange, allNodes, allEdges]);

  // 获取节点年份 (备用方法，当标准化年份不可用时使用)
  const getNodeYear = (node) => {
    // 优先处理具体年份
    if (node.year) {
      // 处理年份范围 (如 "1276-1293")
      if (typeof node.year === 'string' && node.year.includes('-')) {
        const [startYear] = node.year.split('-');
        return parseInt(startYear, 10);
      }
      // 处理单一年份
      return parseInt(node.year, 10);
    }

    // 处理朝代信息
    if (node.period) {
      return periodToYear(node.period);
    }

    // 尝试从标签中提取年份信息
    if (node.label) {
      const yearRegex = /(\d+)\s*年/;
      const match = yearRegex.exec(node.label);
      if (match) {
        return parseInt(match[1], 10);
      }
    }

    return null;
  };

  // 处理开始时间变化
  const handleStartChange = (e) => {
    const newStart = parseInt(e.target.value, 10);
    const newRange = { ...timeRange, start: newStart };

    // 确保开始时间不超过结束时间
    if (newStart >= timeRange.end) {
      setTimeRangeError('开始时间必须小于结束时间');
    } else {
      setTimeRangeError(null);
    }

    setTimeRange(newRange);
  };

  // 处理结束时间变化
  const handleEndChange = (e) => {
    const newEnd = parseInt(e.target.value, 10);
    const newRange = { ...timeRange, end: newEnd };

    // 确保结束时间不小于开始时间
    if (newEnd <= timeRange.start) {
      setTimeRangeError('结束时间必须大于开始时间');
    } else {
      setTimeRangeError(null);
    }

    setTimeRange(newRange);
  };

  // 时间范围变化时更新筛选结果
  useEffect(() => {
    if (!isLoading && allNodes.length > 0) {
      console.log('时间范围变化，重新筛选数据');
      const { nodes: filteredNodes, edges: filteredEdges } = getFilteredData();
      setNodes(filteredNodes);
      setEdges(filteredEdges);
    }
  }, [timeRange, allNodes, allEdges, isLoading, getFilteredData]);

  // 显示加载中状态
  if (isLoading) {
    return <div className="loading-container">加载知识图谱中...</div>;
  }

  // 显示错误
  if (error) {
    return (
        <div className="error-container">
          <h3>错误</h3>
          <p>{error}</p>
          <p>请检查控制台获取更多信息</p>
        </div>
    );
  }

  return (
      <div className="app-container">
        <header className="app-header">
          <h1>水利图谱</h1>
          <div className="time-slider">
            <span>时间范围: {timeRange.start} - {timeRange.end}</span>
            {timeRangeError && <div className="time-range-error">{timeRangeError}</div>}
            <input
                type="range"
                min="-770"
                max="1911"
                value={timeRange.start}
                onChange={handleStartChange}
            />
            <input
                type="range"
                min="-770"
                max="1911"
                value={timeRange.end}
                onChange={handleEndChange}
            />
          </div>
        </header>

        <main>
          {nodes.length === 0 ? (
              <div className="no-data">所选时间范围内无数据</div>
          ) : (
              <Graph
                  nodes={nodes}
                  edges={edges}
                  width={window.innerWidth - 40}
                  height={window.innerHeight - 150}
              />
          )}
        </main>
      </div>
  );
};

export default App;

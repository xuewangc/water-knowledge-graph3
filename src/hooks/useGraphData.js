import { useContext, useState, useEffect } from 'react';
import { GraphContext } from '../context/GraphContext';

/**
 * 处理图谱数据的自定义Hook
 * @param {Object} timeFilter - 时间过滤条件
 * @param {string} searchTerm - 搜索词
 * @returns {Object} 处理后的图谱数据和状态
 */
const useGraphData = (timeFilter, searchTerm) => {
    const { graphData, loading, error, filterData } = useContext(GraphContext);
    const [filteredData, setFilteredData] = useState({ nodes: [], edges: [] });
    const [selectedNode, setSelectedNode] = useState(null);
    const [timeRangeError, setTimeRangeError] = useState(null);

    // 验证时间范围是否有效
    const validateTimeRange = (range) => {
        if (!range) return false;
        const { start, end } = range;
        if (start >= end) {
            setTimeRangeError('无效的时间范围：开始时间必须小于结束时间');
            return false;
        }
        setTimeRangeError(null);
        return true;
    };

    // 应用过滤条件
    useEffect(() => {
        if (loading || error) return;

        // 验证时间范围
        if (!validateTimeRange(timeFilter)) {
            // 时间范围无效时清空图谱数据
            setFilteredData({ nodes: [], edges: [] });
            return;
        }

        const filtered = filterData(timeFilter, searchTerm);
        setFilteredData(filtered);

        // 如果当前选中的节点不在过滤结果中，则取消选中
        if (selectedNode) {
            const stillExists = filtered.nodes.some(node => node.id === selectedNode.id);
            if (!stillExists) {
                setSelectedNode(null);
            }
        }
    }, [loading, error, timeFilter, searchTerm, filterData, selectedNode]);

    // 选择节点的处理
    const handleNodeSelect = (node) => {
        setSelectedNode(node);
    };

    return {
        graphData: filteredData,
        loading,
        error,
        timeRangeError,
        selectedNode,
        handleNodeSelect
    };
};

export default useGraphData;

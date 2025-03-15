// graphLayout.js - 简化版，不依赖D3
/**
 * 创建更有机、稍微混乱的布局
 * @param {Array} nodes - 节点对象数组
 * @param {Array} edges - 边对象数组
 * @param {Object} options - 配置选项
 * @returns {Object} - 定位后的节点和边
 */
export const createForceLayout = (nodes, edges, options = {}) => {
    const {
        width = 800,
        height = 600,
    } = options;

    // 创建节点副本以避免修改原始数据
    const nodesCopy = nodes.map(node => ({ ...node }));

    // 为每个节点生成随机位置
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.4; // 使用画布40%的半径

    nodesCopy.forEach((node, index) => {
        // 使用"黄金角"方法生成均匀但看起来随机的分布
        const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // 约137.5度
        const angle = index * goldenAngle;

        // 距离中心的随机距离，但保持在半径范围内
        const distance = radius * Math.sqrt(Math.random());

        // 计算最终位置
        node.x = centerX + distance * Math.cos(angle);
        node.y = centerY + distance * Math.sin(angle);

        // 添加少量随机抖动使布局更自然
        const jitter = radius * 0.05;
        node.x += (Math.random() - 0.5) * jitter;
        node.y += (Math.random() - 0.5) * jitter;
    });

    // 创建边的引用副本
    const linksCopy = edges.map(edge => {
        const sourceNode = nodesCopy.find(n => n.id === edge.source);
        const targetNode = nodesCopy.find(n => n.id === edge.target);

        if (!sourceNode || !targetNode) {
            console.warn(`找不到边的源节点或目标节点: ${edge.source} -> ${edge.target}`);
            return null;
        }

        return {
            ...edge,
            source: sourceNode,
            target: targetNode
        };
    }).filter(link => link !== null);

    return {
        nodes: nodesCopy,
        links: linksCopy
    };
};

// 用于更新现有布局的函数
export const updateLayout = (existingLayout, updatedNodes, updatedEdges, options) => {
    // 重用现有位置实现平滑过渡
    const nodesWithPositions = updatedNodes.map(node => {
        const existingNode = existingLayout.nodes.find(n => n.id === node.id);
        if (existingNode) {
            return { ...node, x: existingNode.x, y: existingNode.y };
        }
        return node;
    });

    return createForceLayout(nodesWithPositions, updatedEdges, options);
};

export default {
    createForceLayout,
    updateLayout
};

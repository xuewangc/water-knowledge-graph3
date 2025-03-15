// 在src/utils目录下创建debugHelper.js
// 这个文件可以帮助你诊断数据问题

export const debugGraphData = (nodes, edges) => {
    console.group('知识图谱数据调试');

    // 检查节点数据
    console.log('节点数据:', nodes);
    if (!nodes || nodes.length === 0) {
        console.error('没有节点数据!');
    } else {
        console.log(`共有 ${nodes.length} 个节点`);

        // 检查节点必要属性
        const sampleNode = nodes[0];
        console.log('节点样例:', sampleNode);

        // 检查ID是否存在
        const hasIds = nodes.every(node => node.id);
        if (!hasIds) {
            console.warn('部分节点缺少ID!');
        }

        // 检查标签是否存在
        const hasLabels = nodes.every(node => node.label || node.name || node.title);
        if (!hasLabels) {
            console.warn('部分节点缺少标签!');
        }
    }

    // 检查边数据
    console.log('边数据:', edges);
    if (!edges || edges.length === 0) {
        console.error('没有边数据!');
    } else {
        console.log(`共有 ${edges.length} 条边`);

        // 检查边必要属性
        const sampleEdge = edges[0];
        console.log('边样例:', sampleEdge);

        // 检查source/target引用
        const hasValidSources = edges.every(edge => edge.source || edge.from);
        const hasValidTargets = edges.every(edge => edge.target || edge.to);

        if (!hasValidSources) {
            console.warn('部分边缺少source!');
        }

        if (!hasValidTargets) {
            console.warn('部分边缺少target!');
        }

        // 检查source/target是否指向存在的节点
        if (nodes && nodes.length > 0) {
            const nodeIds = new Set(nodes.map(node => node.id));

            const edgesWithInvalidSource = edges.filter(edge => {
                const sourceId = edge.source || edge.from;
                return !nodeIds.has(sourceId);
            });

            const edgesWithInvalidTarget = edges.filter(edge => {
                const targetId = edge.target || edge.to;
                return !nodeIds.has(targetId);
            });

            if (edgesWithInvalidSource.length > 0) {
                console.warn(`有 ${edgesWithInvalidSource.length} 条边的source无效!`);
            }

            if (edgesWithInvalidTarget.length > 0) {
                console.warn(`有 ${edgesWithInvalidTarget.length} 条边的target无效!`);
            }
        }
    }

    console.groupEnd();

    return {
        hasNodes: nodes && nodes.length > 0,
        hasEdges: edges && edges.length > 0,
        nodeCount: nodes ? nodes.length : 0,
        edgeCount: edges ? edges.length : 0
    };
};

// 使用方法:
// import { debugGraphData } from '../utils/debugHelper';
//
// useEffect(() => {
//   debugGraphData(nodes, edges);
// }, [nodes, edges]);

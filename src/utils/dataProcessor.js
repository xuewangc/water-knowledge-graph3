// src/utils/dataProcessor.js
/**
 * 处理三种不同的数据格式，转换为统一的图结构
 * @param {Object|Array} waterProjects - 水利工程数据
 * @param {Object|Array} waterTechnology - 水利技术数据
 * @param {Object|Array} waterDisasters - 水灾数据
 * @returns {Object} - 包含nodes和edges的统一图数据
 */
export const processGraphData = (waterProjects, waterTechnology, waterDisasters) => {
    console.log('原始数据：', { waterProjects, waterTechnology, waterDisasters });

    // 确保每种数据源都是数组
    const projectsArray = ensureArray(waterProjects);
    const technologyArray = ensureArray(waterTechnology);
    const disastersArray = ensureArray(waterDisasters);

    console.log('转换为数组后：', {
        projects: projectsArray.length,
        technology: technologyArray.length,
        disasters: disastersArray.length
    });

    // 创建统一格式的节点
    const projectNodes = projectsArray.filter(Boolean).map(project => ({
        id: project.id || `project-${Math.random().toString(36).substr(2, 9)}`,
        label: project.label || '',
        type: '水利工程',
        category: project.category || '工程',
        year: project.year || '',
        details: project.details || '',
        data: project // 保存原始数据以备用
    }));

    const technologyNodes = technologyArray.filter(Boolean).map(tech => ({
        id: tech.id || `tech-${Math.random().toString(36).substr(2, 9)}`,
        label: tech.label || tech.Label || '', // 注意可能的大小写不一致
        type: '水利技术',
        category: tech.type || '技术',
        year: tech.period || tech.year || '',
        details: tech.details || '',
        data: tech
    }));

    const disasterNodes = disastersArray.filter(Boolean).map(disaster => ({
        id: disaster.id || `disaster-${Math.random().toString(36).substr(2, 9)}`,
        label: disaster.label || '',
        type: '水灾记录',
        category: disaster.type || '水灾',
        year: disaster.year || '',
        details: disaster.details || '',
        data: disaster
    }));

    // 合并所有节点
    const allNodes = [...projectNodes, ...technologyNodes, ...disasterNodes];

    // 创建边关系
    const edges = [];

    // 处理水利工程关系
    projectsArray.filter(Boolean).forEach(project => {
        // 前序工程关系
        if (project.prevProject) {
            const targetId = findNodeIdByLabel(allNodes, project.prevProject);
            if (targetId) {
                edges.push({
                    source: project.id,
                    target: targetId,
                    type: '前序'
                });
            }
        }

        // 后续工程关系
        if (project.nextProject) {
            const targetId = findNodeIdByLabel(allNodes, project.nextProject);
            if (targetId) {
                edges.push({
                    source: project.id,
                    target: targetId,
                    type: '后续'
                });
            }
        }

        // 技术关系
        if (project.techChain && Array.isArray(project.techChain)) {
            project.techChain.forEach(techLabel => {
                const techId = findNodeIdByLabel(allNodes, techLabel);
                if (techId) {
                    edges.push({
                        source: project.id,
                        target: techId,
                        type: '应用'
                    });
                }
            });
        }
    });

    // 处理技术关系
    technologyArray.filter(Boolean).forEach(tech => {
        if (tech.related && Array.isArray(tech.related) && tech.related.length > 0) {
            tech.related.forEach(relatedId => {
                // 检查是否是ID或标签
                const targetId = allNodes.some(node => node.id === relatedId)
                    ? relatedId
                    : findNodeIdByLabel(allNodes, relatedId);

                if (targetId) {
                    edges.push({
                        source: tech.id,
                        target: targetId,
                        type: '相关'
                    });
                }
            });
        }
    });

    // 处理水灾关系
    disastersArray.filter(Boolean).forEach(disaster => {
        if (disaster.related && Array.isArray(disaster.related) && disaster.related.length > 0) {
            disaster.related.forEach(relatedId => {
                // 检查是否是ID或标签
                const targetId = allNodes.some(node => node.id === relatedId)
                    ? relatedId
                    : findNodeIdByLabel(allNodes, relatedId);

                if (targetId) {
                    edges.push({
                        source: disaster.id,
                        target: targetId,
                        type: '相关'
                    });
                }
            });
        }
    });

    // 过滤掉无效的边（源或目标节点不存在）
    const validEdges = edges.filter(edge => {
        return allNodes.some(node => node.id === edge.source) &&
            allNodes.some(node => node.id === edge.target);
    });

    console.log('处理后的数据：', {
        nodesCount: allNodes.length,
        edgesCount: validEdges.length
    });

    return {
        nodes: allNodes,
        edges: validEdges
    };
};

/**
 * 辅助函数：确保输入是数组
 * @param {*} data - 输入数据
 * @returns {Array} - 转换后的数组
 */
const ensureArray = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;

    // 检查是否是对象数组的一种特殊情况
    if (typeof data === 'object' && data !== null) {
        // 如果对象有数字键，可能是一个类数组对象
        const keys = Object.keys(data);
        if (keys.some(key => !isNaN(parseInt(key, 10)))) {
            return Object.values(data);
        }
        // 单个对象转为数组
        return [data];
    }

    return [];
};

/**
 * 辅助函数：根据标签查找节点ID
 * @param {Array} nodes - 所有节点
 * @param {String} label - 要查找的标签
 * @returns {String|null} - 节点ID或null
 */
const findNodeIdByLabel = (nodes, label) => {
    // 确保label是字符串
    const searchLabel = String(label || '').trim();
    if (!searchLabel) return null;

    const node = nodes.find(n => String(n.label || '').trim() === searchLabel);
    return node ? node.id : null;
};

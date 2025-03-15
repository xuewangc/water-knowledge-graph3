// src/components/Graph/Graph.js
import React, { useEffect, useRef } from 'react';
import './Graph.css';

// 调试标志
const DEBUG = false;

const Graph = ({ nodes, edges, width, height }) => {
    // 主要引用
    const svgRef = useRef(null);
    const containerRef = useRef(null);
    const animationRef = useRef(null);

    // 存储状态
    const nodesRef = useRef({});
    const draggedNodeRef = useRef(null);
    const isDraggingRef = useRef(false);
    const hoveredNodeRef = useRef(null);
    const selectedNodeRef = useRef(null);

    // DOM元素引用
    const nodeElementsRef = useRef({});
    const edgeElementsRef = useRef({});
    const tooltipRef = useRef(null);
    const detailsRef = useRef(null);

    // 初始化图表
    useEffect(() => {
        if (DEBUG) {
            console.log("初始化图表:", { nodes, edges });
        }

        // 清理旧的动画帧
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
        }

        if (svgRef.current && nodes && edges) {
            createGraph();
        }

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [nodes, edges, width, height]);

    // 创建图形
    const createGraph = () => {
        // 清空SVG
        const svg = svgRef.current;
        while (svg.firstChild) {
            svg.removeChild(svg.firstChild);
        }

        // 重置引用
        nodesRef.current = {};
        nodeElementsRef.current = {};
        edgeElementsRef.current = {};

        // 创建图层
        const backgroundLayer = createSvgElement('g', { class: 'background-layer' });
        const edgesLayer = createSvgElement('g', { class: 'edges-layer' });
        const nodesLayer = createSvgElement('g', { class: 'nodes-layer' });
        const uiLayer = createSvgElement('g', { class: 'ui-layer' });

        // 添加图层
        svg.appendChild(backgroundLayer);
        svg.appendChild(edgesLayer);
        svg.appendChild(nodesLayer);
        svg.appendChild(uiLayer);

        // 添加背景
        const background = createSvgElement('rect', {
            width: width,
            height: height,
            fill: '#f8f9fa',
            opacity: '0.6'
        });
        backgroundLayer.appendChild(background);

        // 添加图例
        uiLayer.appendChild(createLegend());

        // 创建提示框
        const tooltip = createSvgElement('foreignObject', {
            class: 'node-tooltip',
            width: '200',
            height: '200',
            style: 'display: none;'
        });
        const tooltipDiv = document.createElement('div');
        tooltip.appendChild(tooltipDiv);
        uiLayer.appendChild(tooltip);
        tooltipRef.current = tooltip;

        // 创建详情面板
        const detailsPanel = document.createElement('div');
        detailsPanel.className = 'node-details-panel';
        detailsPanel.style.display = 'none';
        if (containerRef.current) {
            containerRef.current.appendChild(detailsPanel);
        }
        detailsRef.current = detailsPanel;

        // 初始化节点
        initializeNodes(nodesLayer);

        // 初始化边 - 重要：确保在节点之后
        initializeEdges(edgesLayer);

        if (DEBUG) {
            console.log("图表创建完成:", {
                nodesRef: nodesRef.current,
                nodeElements: nodeElementsRef.current,
                edgeElements: edgeElementsRef.current
            });
        }

        // 添加事件
        svg.addEventListener('mousemove', handleMouseMove);
        svg.addEventListener('mouseup', handleMouseUp);
        svg.addEventListener('mouseleave', handleMouseUp);

        // 启动动画
        startSimulation();
    };

    // 创建SVG元素
    const createSvgElement = (type, attrs = {}) => {
        const el = document.createElementNS('http://www.w3.org/2000/svg', type);
        for (const [key, value] of Object.entries(attrs)) {
            if (key === 'class') {
                el.setAttribute('class', value);
            } else if (key === 'style' && typeof value === 'string') {
                el.setAttribute('style', value);
            } else {
                el.setAttribute(key, value);
            }
        }
        return el;
    };

    // 创建图例
    const createLegend = () => {
        const legend = createSvgElement('g', {
            class: 'graph-legend',
            transform: 'translate(20, 20)'
        });

        // 水利工程
        const circle1 = createSvgElement('circle', {
            cx: '10',
            cy: '10',
            r: '8',
            fill: '#3498db'
        });

        const text1 = createSvgElement('text', {
            x: '25',
            y: '14',
            'font-size': '12',
            fill: '#333'
        });
        text1.textContent = '水利工程';

        // 水利技术
        const circle2 = createSvgElement('circle', {
            cx: '10',
            cy: '35',
            r: '8',
            fill: '#f39c12'
        });

        const text2 = createSvgElement('text', {
            x: '25',
            y: '39',
            'font-size': '12',
            fill: '#333'
        });
        text2.textContent = '水利技术';

        // 水灾记录
        const circle3 = createSvgElement('circle', {
            cx: '10',
            cy: '60',
            r: '8',
            fill: '#e74c3c'
        });

        const text3 = createSvgElement('text', {
            x: '25',
            y: '64',
            'font-size': '12',
            fill: '#333'
        });
        text3.textContent = '水灾记录';

        // 添加固定节点图例
        const circle4 = createSvgElement('circle', {
            cx: '10',
            cy: '85',
            r: '8',
            fill: '#888',
            stroke: '#000',
            'stroke-width': '2'
        });

        const text4 = createSvgElement('text', {
            x: '25',
            y: '89',
            'font-size': '12',
            fill: '#333'
        });
        text4.textContent = '固定节点（双击解锁）';

        legend.appendChild(circle1);
        legend.appendChild(text1);
        legend.appendChild(circle2);
        legend.appendChild(text2);
        legend.appendChild(circle3);
        legend.appendChild(text3);
        legend.appendChild(circle4);
        legend.appendChild(text4);

        return legend;
    };

    // 初始化节点
    const initializeNodes = (nodesLayer) => {
        nodes.forEach(node => {
            // 获取或生成位置
            let position;
            if (nodesRef.current[node.id]) {
                position = nodesRef.current[node.id].position;
                // 保持原有的固定状态
                position.isFixed = nodesRef.current[node.id].position.isFixed || false;
            } else {
                position = {
                    x: Math.random() * (width * 0.9) + width * 0.05,
                    y: Math.random() * (height * 0.9) + height * 0.05,
                    // 更大的初始速度，帮助节点快速分散
                    vx: (Math.random() - 0.5) * 5,
                    vy: (Math.random() - 0.5) * 5,
                    // 新增：初始不固定
                    isFixed: false
                };
            }

            // 创建节点元素
            const nodeGroup = createSvgElement('g', {
                class: 'graph-node',
                transform: `translate(${position.x}, ${position.y})`,
                'data-id': node.id,
                'data-type': node.type,
                style: 'cursor: grab;'
            });

            // 节点颜色
            const nodeColor = getNodeColor(node.type);
            const textColor = getTextColor(node.type);

            // 添加阴影定义
            const shadowId = `shadow-${node.id}`;
            const defs = createSvgElement('defs');
            const filter = createSvgElement('filter', {
                id: shadowId,
                x: '-50%',
                y: '-50%',
                width: '200%',
                height: '200%'
            });

            const feDropShadow = createSvgElement('feDropShadow', {
                dx: '0',
                dy: '0',
                stdDeviation: '2',
                'flood-color': 'rgba(0,0,0,0.3)',
                'flood-opacity': '0.3'
            });

            filter.appendChild(feDropShadow);
            defs.appendChild(filter);
            nodeGroup.appendChild(defs);

            // 添加文字处理滤镜
            const textFilterId = `text-filter-${node.id}`;
            const textFilter = createSvgElement('filter', {
                id: textFilterId,
                x: '-50%',
                y: '-50%',
                width: '200%',
                height: '200%'
            });

            // 文字轮廓效果
            const feGaussianBlur = createSvgElement('feGaussianBlur', {
                'in': 'SourceAlpha',
                stdDeviation: '1',
                result: 'blur'
            });

            const feOffset = createSvgElement('feOffset', {
                dx: '0',
                dy: '0',
                result: 'offsetBlur'
            });

            const feComponentTransfer = createSvgElement('feComponentTransfer', {
                'in': 'offsetBlur'
            });

            const feFuncA = createSvgElement('feFuncA', {
                type: 'linear',
                slope: '3',
                intercept: '0'
            });

            feComponentTransfer.appendChild(feFuncA);

            const feMerge = createSvgElement('feMerge');
            const feMergeNode1 = createSvgElement('feMergeNode');
            const feMergeNode2 = createSvgElement('feMergeNode', { 'in': 'SourceGraphic' });

            feMerge.appendChild(feMergeNode1);
            feMerge.appendChild(feMergeNode2);

            textFilter.appendChild(feGaussianBlur);
            textFilter.appendChild(feOffset);
            textFilter.appendChild(feComponentTransfer);
            textFilter.appendChild(feMerge);
            defs.appendChild(textFilter);

            // 创建节点圆形
            const circle = createSvgElement('circle', {
                r: '20',
                fill: nodeColor,
                stroke: '#fff',
                'stroke-width': '1.5',
                class: 'node-circle',
                filter: `url(#${shadowId})`
            });

            // 创建节点文本 - 增强版
            const text = createSvgElement('text', {
                dy: '.3em',
                'font-size': '12',
                'font-weight': 'bold',
                'text-anchor': 'middle',
                fill: '#ffffff', // 强制白色文字
                class: 'node-label',
                'pointer-events': 'none',
                'paint-order': 'stroke',
                stroke: 'rgba(0,0,0,0.9)', // 统一使用深黑色描边
                'stroke-width': '3px', // 统一使用较粗描边
                'stroke-linecap': 'round',
                'stroke-linejoin': 'round',
                filter: `url(#${textFilterId})`
            });

            // 裁剪文本
            const displayLabel = node.label && node.label.length > 6
                ? `${node.label.substring(0, 6)}...`
                : node.label || '';
            text.textContent = displayLabel;

            // 添加事件
            nodeGroup.addEventListener('mousedown', (e) => handleNodeMouseDown(e, node));
            nodeGroup.addEventListener('mouseenter', (e) => handleNodeMouseEnter(e, node));
            nodeGroup.addEventListener('mouseleave', () => handleNodeMouseLeave());
            // 新增：双击事件解除固定
            nodeGroup.addEventListener('dblclick', (e) => handleNodeDoubleClick(e, node));

            // 组装节点 - 确保文字在最上层
            nodeGroup.appendChild(circle);
            nodeGroup.appendChild(text);
            nodesLayer.appendChild(nodeGroup);

            // 存储节点引用
            nodesRef.current[node.id] = {
                data: node,
                position: position,
                element: nodeGroup
            };

            nodeElementsRef.current[node.id] = nodeGroup;

            // 如果节点已固定，更新视觉样式
            updateNodeFixedStyle(node.id);
        });
    };

    // 新增：更新节点固定状态的视觉样式
    const updateNodeFixedStyle = (nodeId) => {
        const node = nodesRef.current[nodeId];
        if (!node) return;

        const nodeElement = nodeElementsRef.current[nodeId];
        if (!nodeElement) return;

        const circle = nodeElement.querySelector('circle');
        if (!circle) return;

        if (node.position.isFixed) {
            // 固定状态：添加粗黑边框
            circle.setAttribute('stroke', '#000');
            circle.setAttribute('stroke-width', '2');
            nodeElement.classList.add('fixed');
        } else {
            // 非固定状态：恢复默认样式
            circle.setAttribute('stroke', '#fff');
            circle.setAttribute('stroke-width', '1.5');
            nodeElement.classList.remove('fixed');
        }
    };

    // 新增：双击节点解除固定
    const handleNodeDoubleClick = (e, node) => {
        e.stopPropagation();
        e.preventDefault();

        const nodeRef = nodesRef.current[node.id];
        if (!nodeRef) return;

        // 切换固定状态
        nodeRef.position.isFixed = false;

        // 给节点一个轻微的随机初速度，帮助它融入模拟
        nodeRef.position.vx = (Math.random() - 0.5) * 2;
        nodeRef.position.vy = (Math.random() - 0.5) * 2;

        // 更新视觉样式
        updateNodeFixedStyle(node.id);

        if (DEBUG) {
            console.log(`节点 ${node.id} 已解除固定`);
        }
    };

    // 初始化边
    const initializeEdges = (edgesLayer) => {
        edges.forEach((edge, index) => {
            const edgeId = edge.id || `edge-${index}`;
            const sourceNode = nodesRef.current[edge.source];
            const targetNode = nodesRef.current[edge.target];

            if (!sourceNode || !targetNode) {
                if (DEBUG) {
                    console.warn(`找不到边的端点: ${edge.source} -> ${edge.target}`);
                }
                return;
            }

            // 创建边组
            const edgeGroup = createSvgElement('g', {
                class: 'graph-edge',
                'data-id': edgeId,
                'data-source': edge.source,
                'data-target': edge.target
            });

            // 创建边线 - 增强可见性
            const line = createSvgElement('line', {
                x1: sourceNode.position.x,
                y1: sourceNode.position.y,
                x2: targetNode.position.x,
                y2: targetNode.position.y,
                stroke: '#888',
                'stroke-width': '1.5',
                'stroke-opacity': '0.8',
                'stroke-linecap': 'round'
            });

            edgeGroup.appendChild(line);

            // 可选: 添加边标签组
            if (edge.type) {
                const labelGroup = createSvgElement('g', {
                    class: 'edge-label',
                    style: 'display: none;'
                });

                // 计算中点
                const midX = (sourceNode.position.x + targetNode.position.x) / 2;
                const midY = (sourceNode.position.y + targetNode.position.y) / 2;
                labelGroup.setAttribute('transform', `translate(${midX}, ${midY})`);

                // 标签背景
                const labelBg = createSvgElement('rect', {
                    x: '-18',
                    y: '-10',
                    width: '36',
                    height: '20',
                    rx: '5',
                    fill: 'white',
                    stroke: '#ddd',
                    'stroke-width': '1'
                });

                // 标签文本
                const labelText = createSvgElement('text', {
                    'font-size': '10',
                    'text-anchor': 'middle',
                    dy: '0.3em',
                    fill: '#666'
                });
                labelText.textContent = edge.type;

                labelGroup.appendChild(labelBg);
                labelGroup.appendChild(labelText);
                edgeGroup.appendChild(labelGroup);
            }

            // 添加边到图层
            edgesLayer.appendChild(edgeGroup);

            // 存储边引用
            edgeElementsRef.current[edgeId] = {
                element: edgeGroup,
                source: sourceNode,
                target: targetNode,
                data: edge
            };
        });

        if (DEBUG) {
            console.log(`已创建 ${Object.keys(edgeElementsRef.current).length} 条边`);
        }
    };

    // 更新边位置
    const updateEdgePosition = (edgeId, sourceId, targetId) => {
        const edge = edgeElementsRef.current[edgeId];
        if (!edge || !edge.element) return;

        const sourceNode = nodesRef.current[sourceId];
        const targetNode = nodesRef.current[targetId];
        if (!sourceNode || !targetNode) return;

        const line = edge.element.querySelector('line');
        if (!line) return;

        line.setAttribute('x1', sourceNode.position.x);
        line.setAttribute('y1', sourceNode.position.y);
        line.setAttribute('x2', targetNode.position.x);
        line.setAttribute('y2', targetNode.position.y);

        // 更新标签位置
        const labelGroup = edge.element.querySelector('.edge-label');
        if (labelGroup) {
            const midX = (sourceNode.position.x + targetNode.position.x) / 2;
            const midY = (sourceNode.position.y + targetNode.position.y) / 2;
            labelGroup.setAttribute('transform', `translate(${midX}, ${midY})`);
        }
    };

    // 更新节点位置
    const updateNodePosition = (nodeId, x, y) => {
        const node = nodesRef.current[nodeId];
        if (!node) return;

        // 更新内部位置
        node.position.x = x;
        node.position.y = y;

        // 更新DOM
        node.element.setAttribute('transform', `translate(${x}, ${y})`);

        // 更新相关的所有边
        Object.entries(edgeElementsRef.current).forEach(([edgeId, edge]) => {
            const element = edge.element;
            if (!element) return;

            const sourceId = element.getAttribute('data-source');
            const targetId = element.getAttribute('data-target');

            if (sourceId === nodeId || targetId === nodeId) {
                updateEdgePosition(edgeId, sourceId, targetId);
            }
        });
    };

    // 物理模拟
    const startSimulation = () => {
        const physics = {
            repulsion: 1500,      // 大幅增加排斥力
            springLength: 150,    // 显著增加理想连接距离
            springStrength: 0.03, // 降低弹簧力，减少拉力
            damping: 0.85,        // 略微增加阻尼，使运动更平滑
            centerGravity: 0.005, // 减少中心引力，允许节点分散更远
            edgeStrength: 0.6,    // 减小连接边的强度
            jitter: 0.3           // 减小随机运动幅度，更稳定
        };

        const animate = () => {
            // 对每个节点应用物理力
            Object.entries(nodesRef.current).forEach(([nodeId, node]) => {
                // 如果节点正在被拖拽或已固定，跳过
                if (draggedNodeRef.current === nodeId || node.position.isFixed) return;

                // 初始化力
                let fx = 0;
                let fy = 0;

                // 节点间排斥力
                Object.entries(nodesRef.current).forEach(([otherId, otherNode]) => {
                    if (nodeId === otherId) return;

                    const dx = node.position.x - otherNode.position.x;
                    const dy = node.position.y - otherNode.position.y;
                    const distance = Math.sqrt(dx * dx + dy * dy) || 1;

                    // 排斥力与距离成反比
                    const force = physics.repulsion / (distance * distance);
                    fx += (dx / distance) * force;
                    fy += (dy / distance) * force;
                });

                // 边的弹簧力
                Object.entries(edgeElementsRef.current).forEach(([edgeId, edge]) => {
                    const element = edge.element;
                    if (!element) return;

                    const sourceId = element.getAttribute('data-source');
                    const targetId = element.getAttribute('data-target');

                    if (sourceId === nodeId || targetId === nodeId) {
                        const otherNodeId = sourceId === nodeId ? targetId : sourceId;
                        const otherNode = nodesRef.current[otherNodeId];
                        if (!otherNode) return;

                        const dx = node.position.x - otherNode.position.x;
                        const dy = node.position.y - otherNode.position.y;
                        const distance = Math.sqrt(dx * dx + dy * dy) || 1;

                        // 弹簧力 - 距离与理想长度的差
                        const displacement = distance - physics.springLength;
                        const force = displacement * physics.springStrength * physics.edgeStrength;

                        fx -= (dx / distance) * force;
                        fy -= (dy / distance) * force;
                    }
                });

                // 中心引力
                const dx = node.position.x - width / 2;
                const dy = node.position.y - height / 2;
                const distance = Math.sqrt(dx * dx + dy * dy) || 1;

                fx -= (dx / distance) * distance * physics.centerGravity;
                fy -= (dy / distance) * distance * physics.centerGravity;

                // 轻微随机力保持运动
                fx += (Math.random() - 0.5) * physics.jitter;
                fy += (Math.random() - 0.5) * physics.jitter;

                // 更新速度（应用阻尼）
                node.position.vx = (node.position.vx + fx) * physics.damping;
                node.position.vy = (node.position.vy + fy) * physics.damping;

                // 更新位置
                node.position.x += node.position.vx;
                node.position.y += node.position.vy;

                // 边界约束
                node.position.x = Math.max(30, Math.min(width - 30, node.position.x));
                node.position.y = Math.max(30, Math.min(height - 30, node.position.y));

                // 更新DOM
                updateNodePosition(nodeId, node.position.x, node.position.y);
            });

            animationRef.current = requestAnimationFrame(animate);
        };

        animationRef.current = requestAnimationFrame(animate);
    };

    // 节点鼠标按下
    const handleNodeMouseDown = (e, node) => {
        e.stopPropagation();
        e.preventDefault();

        // 设置拖拽状态
        isDraggingRef.current = true;
        draggedNodeRef.current = node.id;

        // 设置选中节点
        if (selectedNodeRef.current !== node.id) {
            setSelectedNode(node.id);
        }

        // 更改鼠标样式
        const nodeElement = nodeElementsRef.current[node.id];
        if (nodeElement) {
            nodeElement.style.cursor = 'grabbing';
            nodeElement.classList.add('dragging');
        }

        // 立即更新位置
        updateDraggedNodePosition(e);
    };

    // 更新被拖拽节点位置
    const updateDraggedNodePosition = (e) => {
        if (!isDraggingRef.current || !draggedNodeRef.current) return;

        const svgRect = svgRef.current.getBoundingClientRect();
        const mouseX = e.clientX - svgRect.left;
        const mouseY = e.clientY - svgRect.top;

        // 更新DOM位置
        updateNodePosition(draggedNodeRef.current, mouseX, mouseY);
    };

    // 鼠标移动
    const handleMouseMove = (e) => {
        if (isDraggingRef.current) {
            updateDraggedNodePosition(e);
        }
    };

    // 鼠标释放
    const handleMouseUp = () => {
        if (isDraggingRef.current && draggedNodeRef.current) {
            const nodeElement = nodeElementsRef.current[draggedNodeRef.current];
            if (nodeElement) {
                nodeElement.style.cursor = 'grab';
                nodeElement.classList.remove('dragging');
            }

            // 新增：设置节点为固定状态
            const node = nodesRef.current[draggedNodeRef.current];
            if (node) {
                node.position.isFixed = true;
                // 停止节点运动
                node.position.vx = 0;
                node.position.vy = 0;
                // 更新固定状态的视觉样式
                updateNodeFixedStyle(draggedNodeRef.current);

                if (DEBUG) {
                    console.log(`节点 ${draggedNodeRef.current} 已固定在位置 (${node.position.x.toFixed(0)}, ${node.position.y.toFixed(0)})`);
                }
            }

            isDraggingRef.current = false;
            draggedNodeRef.current = null;
        }
    };

    // 节点鼠标进入
    const handleNodeMouseEnter = (e, node) => {
        hoveredNodeRef.current = node.id;

        // 高亮节点
        const nodeElement = nodeElementsRef.current[node.id];
        if (nodeElement) {
            nodeElement.classList.add('hovered');
        }

        // 高亮连接的边
        Object.entries(edgeElementsRef.current).forEach(([edgeId, edge]) => {
            const element = edge.element;
            if (!element) return;

            const sourceId = element.getAttribute('data-source');
            const targetId = element.getAttribute('data-target');

            if (sourceId === node.id || targetId === node.id) {
                element.classList.add('highlighted');

                // 显示边标签
                const labelGroup = element.querySelector('.edge-label');
                if (labelGroup) {
                    labelGroup.style.display = 'block';
                }
            }
        });

        // 显示提示框
        showNodeTooltip(node, e);
    };

    // 节点鼠标离开
    const handleNodeMouseLeave = () => {
        if (!hoveredNodeRef.current) return;

        // 移除节点高亮
        const nodeElement = nodeElementsRef.current[hoveredNodeRef.current];
        if (nodeElement) {
            nodeElement.classList.remove('hovered');
        }

        // 移除边高亮
        Object.entries(edgeElementsRef.current).forEach(([edgeId, edge]) => {
            const element = edge.element;
            if (!element) return;

            const sourceId = element.getAttribute('data-source');
            const targetId = element.getAttribute('data-target');

            if (sourceId === hoveredNodeRef.current || targetId === hoveredNodeRef.current) {
                element.classList.remove('highlighted');

                // 隐藏边标签 (除非是选中的节点)
                const isConnectedToSelected =
                    selectedNodeRef.current &&
                    (sourceId === selectedNodeRef.current || targetId === selectedNodeRef.current);

                if (!isConnectedToSelected) {
                    const labelGroup = element.querySelector('.edge-label');
                    if (labelGroup) {
                        labelGroup.style.display = 'none';
                    }
                }
            }
        });

        // 隐藏提示框
        hideNodeTooltip();

        hoveredNodeRef.current = null;
    };

    // 显示节点提示框
    const showNodeTooltip = (node, e) => {
        if (!tooltipRef.current) return;

        const svgRect = svgRef.current.getBoundingClientRect();
        const mouseX = e.clientX - svgRect.left + 15;
        const mouseY = e.clientY - svgRect.top - 10;

        tooltipRef.current.setAttribute('x', mouseX);
        tooltipRef.current.setAttribute('y', mouseY);

        const tooltipDiv = tooltipRef.current.querySelector('div');
        if (tooltipDiv) {
            // 新增：显示固定状态
            const fixedStatus = nodesRef.current[node.id].position.isFixed ?
                '<p><strong>状态:</strong> <span style="color:#e74c3c">已固定</span> (双击解锁)</p>' :
                '<p><strong>状态:</strong> 自由</p>';

            tooltipDiv.innerHTML = `
        <h4>${node.label}</h4>
        <p><strong>类型:</strong> ${node.type}</p>
        ${fixedStatus}
        ${node.year ? `<p><strong>年份:</strong> ${node.year}</p>` : ''}
        ${node.details ? `<p><strong>详情:</strong> ${
                node.details.length > 100
                    ? node.details.substring(0, 100) + '...'
                    : node.details
            }</p>` : ''}
      `;
        }

        tooltipRef.current.style.display = 'block';
    };

    // 隐藏节点提示框
    const hideNodeTooltip = () => {
        if (tooltipRef.current) {
            tooltipRef.current.style.display = 'none';
        }
    };

    // 设置选中节点
    const setSelectedNode = (nodeId) => {
        // 清除之前的选中
        if (selectedNodeRef.current) {
            const prevElement = nodeElementsRef.current[selectedNodeRef.current];
            if (prevElement) {
                prevElement.classList.remove('selected');
            }

            // 移除之前边的高亮
            Object.entries(edgeElementsRef.current).forEach(([edgeId, edge]) => {
                const element = edge.element;
                if (!element) return;

                const sourceId = element.getAttribute('data-source');
                const targetId = element.getAttribute('data-target');

                if (sourceId === selectedNodeRef.current || targetId === selectedNodeRef.current) {
                    element.classList.remove('highlighted');

                    // 隐藏边标签 (除非是悬停的节点)
                    const isConnectedToHovered =
                        hoveredNodeRef.current &&
                        (sourceId === hoveredNodeRef.current || targetId === hoveredNodeRef.current);

                    if (!isConnectedToHovered) {
                        const labelGroup = element.querySelector('.edge-label');
                        if (labelGroup) {
                            labelGroup.style.display = 'none';
                        }
                    }
                }
            });
        }

        // 设置新的选中
        selectedNodeRef.current = nodeId;
        const node = nodesRef.current[nodeId].data;

        // 高亮选中节点
        const nodeElement = nodeElementsRef.current[nodeId];
        if (nodeElement) {
            nodeElement.classList.add('selected');
        }

        // 高亮相连的边
        Object.entries(edgeElementsRef.current).forEach(([edgeId, edge]) => {
            const element = edge.element;
            if (!element) return;

            const sourceId = element.getAttribute('data-source');
            const targetId = element.getAttribute('data-target');

            if (sourceId === nodeId || targetId === nodeId) {
                element.classList.add('highlighted');

                // 显示边标签
                const labelGroup = element.querySelector('.edge-label');
                if (labelGroup) {
                    labelGroup.style.display = 'block';
                }
            }
        });

        // 显示详情面板
        showDetailsPanel(node);
    };

    // 显示详情面板
    const showDetailsPanel = (node) => {
        if (!detailsRef.current) return;

        // 获取节点固定状态
        const nodeId = node.id;
        const isFixed = nodesRef.current[nodeId] && nodesRef.current[nodeId].position.isFixed;
        const fixedStatus = isFixed ?
            '<p><strong>状态:</strong> <span style="color:#e74c3c">已固定</span> (双击节点解锁)</p>' :
            '<p><strong>状态:</strong> 自由</p>';

        detailsRef.current.innerHTML = `
      <h3>${node.label}</h3>
      <p><strong>类型:</strong> ${node.type}</p>
      ${fixedStatus}
      ${node.category ? `<p><strong>类别:</strong> ${node.category}</p>` : ''}
      ${node.year ? `<p><strong>年份:</strong> ${node.year}</p>` : ''}
      ${node.details ? `<p><strong>详情:</strong> ${node.details}</p>` : ''}
    `;

        detailsRef.current.style.display = 'block';
    };

    // 获取节点颜色
    const getNodeColor = (type) => {
        if (type.includes('水利工程')) {
            return '#3498db'; // 蓝色
        } else if (type.includes('技术')) {
            return '#f39c12'; // 黄色/橙色
        } else if (type.includes('水灾')) {
            return '#e74c3c'; // 红色
        } else {
            return '#95a5a6'; // 灰色
        }
    };

    // 获取文字颜色
    const getTextColor = (nodeType) => {
        // 所有节点统一使用白色文字
        return '#ffffff';
    };

    return (
        <div className="graph-container" ref={containerRef}>
            <svg
                ref={svgRef}
                width={width}
                height={height}
                className="knowledge-graph"
            />
        </div>
    );
};

export default Graph;

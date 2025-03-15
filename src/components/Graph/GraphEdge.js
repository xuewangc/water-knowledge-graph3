// src/components/Graph/GraphEdge.js
import React from 'react';

const GraphEdge = ({ source, target, type, selected, highlighted, sourceNode, targetNode }) => {
    // 根据边类型设置颜色
    const getEdgeColor = () => {
        if (!type) return '#95a5a6';

        if (type.includes('前序') || type.includes('后续')) {
            return 'var(--project-color, #4CAF50)'; // 绿色
        } else if (type.includes('应用')) {
            return 'var(--tech-color, #FEA500)'; // 橙色
        } else if (type.includes('相关')) {
            return '#95a5a6'; // 灰色
        } else {
            return '#95a5a6'; // 默认灰色
        }
    };

    // 计算箭头末端位置，避免与节点重叠
    const nodeRadius = 20; // 与节点半径保持一致
    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const scale = (length - nodeRadius) / length;

    const endX = source.x + dx * scale;
    const endY = source.y + dy * scale;

    // 设置边的样式
    const color = getEdgeColor();
    const strokeWidth = selected ? 2.5 : highlighted ? 2 : 1.5;
    const opacity = selected ? 1 : highlighted ? 0.85 : 0.6;

    // 创建一个微小的弯曲
    const getMidPoint = () => {
        // 计算中点
        const midX = (source.x + target.x) / 2;
        const midY = (source.y + target.y) / 2;

        // 添加一点弯曲
        const offsetAmount = 0; // 可以调整弯曲程度

        // 垂直于线的偏移方向
        const nx = -dy / length;
        const ny = dx / length;

        return {
            x: midX + nx * offsetAmount,
            y: midY + ny * offsetAmount
        };
    };

    const mid = getMidPoint();

    return (
        <g className={`graph-edge ${selected ? 'selected' : ''} ${highlighted ? 'highlighted' : ''}`}>
            {/* 线条 - 使用贝塞尔曲线 */}
            <path
                d={`M${source.x},${source.y} Q${mid.x},${mid.y} ${endX},${endY}`}
                stroke={color}
                strokeWidth={strokeWidth}
                opacity={opacity}
                fill="none"
                strokeLinecap="round"
                className="edge-path"
            />

            {/* 如果选中或悬停，显示关系类型标签 */}
            {(selected || highlighted) && (
                <g transform={`translate(${mid.x}, ${mid.y})`}>
                    <rect
                        x="-20"
                        y="-10"
                        width="40"
                        height="20"
                        rx="4"
                        ry="4"
                        fill="white"
                        opacity="0.9"
                        className="edge-label-bg"
                    />
                    <text
                        textAnchor="middle"
                        dy=".3em"
                        fontSize="9"
                        fill="#333"
                        fontWeight="bold"
                        pointerEvents="none"
                        className="edge-label"
                    >
                        {type}
                    </text>
                </g>
            )}
        </g>
    );
};

export default GraphEdge;

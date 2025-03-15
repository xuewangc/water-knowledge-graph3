// src/components/Graph/GraphNode.js
import React from 'react';

const GraphNode = ({
                       node,
                       x,
                       y,
                       type,
                       selected,
                       hovered,
                       onClick,
                       onMouseEnter,
                       onMouseLeave,
                       onDragStart,
                       draggable
                   }) => {
    // 根据节点类型设置颜色，使用CSS变量
    const getNodeColor = () => {
        if (!type) return '#95a5a6';

        if (type.includes('水利工程')) {
            return 'var(--project-color, #4CAF50)';
        } else if (type.includes('技术')) {
            return 'var(--tech-color, #FEA500)';
        } else if (type.includes('水灾')) {
            return 'var(--flood-color, #DC143C)';
        } else {
            return '#95a5a6'; // 灰色 - 默认
        }
    };

    // 设置节点大小，选中或悬停时略大
    const radius = selected ? 24 : hovered ? 22 : 20;
    const color = getNodeColor();

    // 最大显示长度
    const maxLabelLength = 6;
    const displayLabel = node.label && node.label.length > maxLabelLength
        ? `${node.label.substring(0, maxLabelLength)}...`
        : (node.label || '未命名');

    // 获取文字颜色 - 使用深色背景时用白色，浅色背景用黑色
    const getTextColor = () => {
        // 避免白色文字看不清的问题
        const isLightColor = color === 'var(--tech-color, #FEA500)'; // 技术节点是黄色
        return isLightColor ? '#333' : '#fff';
    };

    // 处理拖拽开始
    const handleMouseDown = (event) => {
        if (draggable && onDragStart) {
            // 阻止默认拖拽行为
            event.preventDefault();
            onDragStart(event);
        }
    };

    return (
        <g
            className={`graph-node ${selected ? 'selected' : ''} ${hovered ? 'hovered' : ''}`}
            transform={`translate(${x}, ${y})`}
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onMouseDown={handleMouseDown}
            style={{ cursor: draggable ? 'grab' : 'pointer' }}
        >
            {/* 选中或悬停时的光晕效果 */}
            {(selected || hovered) && (
                <circle
                    r={radius + 4}
                    fill="none"
                    stroke={color}
                    strokeWidth={selected ? "2" : "1.5"}
                    opacity={selected ? "0.6" : "0.4"}
                    strokeDasharray={selected ? "5,3" : "none"}
                    className="node-highlight"
                />
            )}

            {/* 主圆 */}
            <circle
                r={radius}
                fill={color}
                stroke="#ffffff"
                strokeWidth="1.5"
                className="node-circle"
            />

            {/* 文本标签 - 改进文字颜色 */}
            <text
                textAnchor="middle"
                dy=".3em"
                fontSize="12"
                fill={getTextColor()}
                fontWeight="bold"
                pointerEvents="none"
                className="node-label"
            >
                {displayLabel}
            </text>
        </g>
    );
};

export default GraphNode;

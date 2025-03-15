import React from 'react';
import ProjectDetail from './ProjectDetail';
import TechDetail from './TechDetail';
import FloodDetail from './FloodDetail';

const DetailPanel = ({ selectedNode }) => {
    if (!selectedNode) {
        return (
            <div className="detail-panel">
                <div className="detail-empty">
                    <h3>水利知识图谱</h3>
                    <p>点击节点查看详细信息</p>
                </div>
            </div>
        );
    }

    // 根据节点类别渲染不同的详情组件
    const renderDetailComponent = () => {
        switch (selectedNode.category) {
            case 'project':
                return <ProjectDetail project={selectedNode} />;
            case 'tech':
            case 'derived-tech':
                return <TechDetail tech={selectedNode} />;
            case 'flood':
                return <FloodDetail flood={selectedNode} />;
            default:
                return <div>未知节点类型</div>;
        }
    };

    return (
        <div className="detail-panel">
            <div className="detail-header">
                <h3>{selectedNode.label}</h3>
                <span className="detail-type">{getTypeLabel(selectedNode)}</span>
            </div>
            <div className="detail-content">
                {renderDetailComponent()}
            </div>
        </div>
    );
};

// 获取节点类型的中文标签
const getTypeLabel = (node) => {
    switch (node.category) {
        case 'project':
            return '水利工程';
        case 'tech':
            return '水利技术';
        case 'derived-tech':
            return '衍生技术';
        case 'flood':
            return '水灾记录';
        default:
            return '未知类型';
    }
};

export default DetailPanel;

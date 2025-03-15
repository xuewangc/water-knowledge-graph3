import React from 'react';

const ProjectDetail = ({ project }) => {
    const { data } = project;

    return (
        <div className="project-detail">
            <div className="detail-section">
                <h4>基本信息</h4>
                <div className="detail-item">
                    <span className="item-label">名称：</span>
                    <span className="item-value">{data.label}</span>
                </div>
                <div className="detail-item">
                    <span className="item-label">类型：</span>
                    <span className="item-value">{data.type}</span>
                </div>
                <div className="detail-item">
                    <span className="item-label">建成年份：</span>
                    <span className="item-value">{data.year}</span>
                </div>
                <div className="detail-item">
                    <span className="item-label">朝代：</span>
                    <span className="item-value">{data.dynasty}</span>
                </div>
                <div className="detail-item">
                    <span className="item-label">位置：</span>
                    <span className="item-value">{data.location}</span>
                </div>
                <div className="detail-item">
                    <span className="item-label">建造者：</span>
                    <span className="item-value">{data.builder}</span>
                </div>
                <div className="detail-item">
                    <span className="item-label">状态：</span>
                    <span className="item-value">{getStatusLabel(data.status)}</span>
                </div>
            </div>

            {data.techChain && data.techChain.length > 0 && (
                <div className="detail-section">
                    <h4>技术链</h4>
                    <ul className="tech-list">
                        {data.techChain.map((tech, index) => (
                            <li key={index}>{tech}</li>
                        ))}
                    </ul>
                </div>
            )}

            {data.details && (
                <div className="detail-section">
                    <h4>详细描述</h4>
                    <p className="description">{data.details}</p>
                </div>
            )}

            {data.benefits && (
                <div className="detail-section">
                    <h4>收益</h4>
                    <p className="benefits">{data.benefits}</p>
                </div>
            )}

            {data.significance && (
                <div className="detail-section">
                    <h4>历史意义</h4>
                    <p className="significance">{data.significance}</p>
                </div>
            )}

            <div className="detail-section">
                <h4>相关项目</h4>
                <div className="related-projects">
                    {data.prevProject && (
                        <div className="related-item">
                            <span className="item-label">前期项目：</span>
                            <span className="item-value">{data.prevProject}</span>
                        </div>
                    )}
                    {data.nextProject ? (
                        <div className="related-item">
                            <span className="item-label">后续项目：</span>
                            <span className="item-value">{data.nextProject}</span>
                        </div>
                    ) : (
                        <div className="related-item">
                            <span className="item-value">无后续项目</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// 获取状态的中文标签
const getStatusLabel = (status) => {
    switch (status) {
        case 'completed':
            return '已完成';
        case 'in-progress':
            return '进行中';
        case 'planned':
            return '规划中';
        case 'abandoned':
            return '已废弃';
        default:
            return status || '未知';
    }
};

export default ProjectDetail;

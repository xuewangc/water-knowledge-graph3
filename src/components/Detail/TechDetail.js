import React from 'react';

const TechDetail = ({ tech }) => {
    const { data } = tech;

    return (
        <div className="tech-detail">
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
                    <span className="item-label">时期：</span>
                    <span className="item-value">{data.period}</span>
                </div>
            </div>

            {data.innovation && (
                <div className="detail-section">
                    <h4>创新点</h4>
                    <p className="innovation">{data.innovation}</p>
                </div>
            )}

            {data.improvement && (
                <div className="detail-section">
                    <h4>技术改进</h4>
                    <p className="improvement">{data.improvement}</p>
                </div>
            )}

            {data.details && (
                <div className="detail-section">
                    <h4>详细描述</h4>
                    <p className="description">{data.details}</p>
                </div>
            )}

            {data.related && data.related.length > 0 && (
                <div className="detail-section">
                    <h4>相关技术</h4>
                    <ul className="related-list">
                        {data.related.map((tech, index) => (
                            <li key={index}>{tech}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default TechDetail;
